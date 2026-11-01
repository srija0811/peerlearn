package com.peerlearn.service;

import com.peerlearn.model.ExchangeRequest;
import com.peerlearn.model.PrivateMessage;
import com.peerlearn.model.Student;
import com.peerlearn.repository.ExchangeRequestRepository;
import com.peerlearn.repository.PrivateMessageRepository;
import com.peerlearn.repository.StudentRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PrivateMessageService {

    public static final long MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

    private final PrivateMessageRepository privateMessageRepository;
    private final ExchangeRequestRepository exchangeRequestRepository;
    private final StudentRepository studentRepository;

    public PrivateMessageService(
            PrivateMessageRepository privateMessageRepository,
            ExchangeRequestRepository exchangeRequestRepository,
            StudentRepository studentRepository) {
        this.privateMessageRepository = privateMessageRepository;
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<PrivateMessage> getMessages(String email, Long requestId) {
        ExchangeRequest request = getAuthorizedAcceptedRequest(email, requestId);
        return privateMessageRepository.findByRequest_IdOrderByCreatedAtAsc(request.getId());
    }

    public PrivateMessage sendMessage(String email, Long requestId, String content) {
        Student sender = getStudent(email);
        ExchangeRequest request = getAuthorizedAcceptedRequest(sender, requestId);
        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isEmpty() || normalizedContent.length() > 4000) {
            throw new IllegalArgumentException("Message must contain 1 to 4000 characters.");
        }

        return privateMessageRepository.save(PrivateMessage.builder()
                .request(request)
                .sender(sender)
                .content(normalizedContent)
                .createdAt(LocalDateTime.now())
                .build());
    }

    public PrivateMessage sendAttachment(String email, Long requestId, MultipartFile file) throws IOException {
        Student sender = getStudent(email);
        ExchangeRequest request = getAuthorizedAcceptedRequest(sender, requestId);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Choose a non-empty file to upload.");
        }
        if (file.getSize() > MAX_ATTACHMENT_SIZE) {
            throw new IllegalArgumentException("Attachments must be 10 MB or smaller.");
        }

        String originalName = file.getOriginalFilename();
        String attachmentName = originalName == null
                ? "attachment"
                : originalName.replace('\\', '/');
        attachmentName = attachmentName.substring(attachmentName.lastIndexOf('/') + 1)
                .replaceAll("[\\p{Cntrl}]", "_")
                .trim();
        if (attachmentName.isEmpty()) {
            attachmentName = "attachment";
        }
        if (attachmentName.length() > 255) {
            attachmentName = attachmentName.substring(0, 255);
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.length() > 150 || contentType.contains("\r") || contentType.contains("\n")) {
            contentType = "application/octet-stream";
        }

        return privateMessageRepository.save(PrivateMessage.builder()
                .request(request)
                .sender(sender)
                .content("")
                .attachmentName(attachmentName)
                .attachmentContentType(contentType)
                .attachmentSize(file.getSize())
                .attachmentData(file.getBytes())
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Transactional(readOnly = true)
    public PrivateMessage getAttachment(String email, Long requestId, Long messageId) {
        ExchangeRequest request = getAuthorizedAcceptedRequest(email, requestId);
        PrivateMessage message = privateMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found."));
        if (!message.getRequest().getId().equals(request.getId()) || message.getAttachmentData() == null) {
            throw new IllegalArgumentException("Attachment not found.");
        }
        return message;
    }

    private ExchangeRequest getAuthorizedAcceptedRequest(String email, Long requestId) {
        return getAuthorizedAcceptedRequest(getStudent(email), requestId);
    }

    private ExchangeRequest getAuthorizedAcceptedRequest(Student student, Long requestId) {
        ExchangeRequest request = exchangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Exchange request not found."));

        boolean isParticipant = request.getSender().getId().equals(student.getId())
                || request.getReceiver().getId().equals(student.getId());
        if (!isParticipant || student.getRole() != Student.Role.ROLE_STUDENT) {
            throw new SecurityException("Only the two students in this exchange can access its chat.");
        }
        if (request.getStatus() != ExchangeRequest.RequestStatus.ACCEPTED) {
            throw new IllegalStateException("Chat is available only after the exchange request is accepted.");
        }
        return request;
    }

    private Student getStudent(String email) {
        return studentRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new SecurityException("Student access is required."));
    }
}
