package com.peerlearn.service;

import com.peerlearn.model.Activity;
import com.peerlearn.model.ExchangeRequest;
import com.peerlearn.model.Notification;
import com.peerlearn.model.Student;
import com.peerlearn.repository.ActivityRepository;
import com.peerlearn.repository.ExchangeRequestRepository;
import com.peerlearn.repository.NotificationRepository;
import com.peerlearn.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ExchangeRequestService {

    private final ExchangeRequestRepository exchangeRequestRepository;
    private final StudentRepository studentRepository;
    private final ActivityRepository activityRepository;
    private final NotificationRepository notificationRepository;

    public ExchangeRequestService(
            ExchangeRequestRepository exchangeRequestRepository,
            StudentRepository studentRepository,
            ActivityRepository activityRepository,
            NotificationRepository notificationRepository) {
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.studentRepository = studentRepository;
        this.activityRepository = activityRepository;
        this.notificationRepository = notificationRepository;
    }

    public ExchangeRequest sendRequest(String currentEmail, Long receiverId, String teachingSkill, String learningSkill, String message, String preferredMode) {
        Student sender = getStudentByEmail(currentEmail);
        return sendRequest(sender.getId(), receiverId, teachingSkill, learningSkill, message, preferredMode);
    }

    public ExchangeRequest sendRequest(Long senderId, Long receiverId, String teachingSkill, String learningSkill, String message, String preferredMode) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Cannot send exchange request to yourself.");
        }

        Student sender = studentRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found."));

        Student receiver = studentRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found."));

        if (exchangeRequestRepository.hasPendingRequestBetween(senderId, receiverId)) {
            throw new IllegalStateException("A pending exchange request already exists between you and this student.");
        }

        ExchangeRequest request = ExchangeRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .teachingSkill(teachingSkill)
                .learningSkill(learningSkill)
                .message(message)
                .preferredMode(preferredMode != null ? preferredMode : "Online")
                .status(ExchangeRequest.RequestStatus.PENDING)
                .build();

        ExchangeRequest saved = exchangeRequestRepository.save(request);

        activityRepository.save(Activity.builder()
                .type("REQUEST")
                .title("Exchange Request Sent")
                .description(sender.getFullName() + " proposed a skill exchange with " + receiver.getFullName() + " (" + teachingSkill + " ⇄ " + learningSkill + ").")
                .studentId(sender.getId())
                .studentName(sender.getFullName())
                .build());

        return saved;
    }

    public ExchangeRequest acceptRequest(Long requestId, Long currentUserId) {
        ExchangeRequest request = exchangeRequestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new SecurityException("Only the recipient can accept this exchange request.");
        }
        if (request.getStatus() != ExchangeRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be accepted.");
        }

        request.setStatus(ExchangeRequest.RequestStatus.ACCEPTED);
        request.setUpdatedAt(LocalDateTime.now());
        ExchangeRequest saved = exchangeRequestRepository.save(request);

        notificationRepository.save(Notification.builder()
                .recipient(request.getSender())
                .title("Exchange Request Accepted")
                .message(request.getReceiver().getFullName() + " accepted your exchange request.")
                .type("REQUEST_ACCEPTED")
                .relatedRequestId(request.getId())
                .build());

        return saved;
    }

    public ExchangeRequest acceptRequest(String currentEmail, Long requestId) {
        return acceptRequest(requestId, getStudentByEmail(currentEmail).getId());
    }

    public ExchangeRequest rejectRequest(Long requestId, Long currentUserId) {
        ExchangeRequest request = exchangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new SecurityException("Only the recipient can reject this exchange request.");
        }

        request.setStatus(ExchangeRequest.RequestStatus.REJECTED);
        request.setUpdatedAt(LocalDateTime.now());
        return exchangeRequestRepository.save(request);
    }

    public ExchangeRequest cancelRequest(Long requestId, Long currentUserId) {
        ExchangeRequest request = exchangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));

        if (!request.getSender().getId().equals(currentUserId)) {
            throw new SecurityException("Only the sender can cancel this exchange request.");
        }

        request.setStatus(ExchangeRequest.RequestStatus.CANCELLED);
        request.setUpdatedAt(LocalDateTime.now());
        return exchangeRequestRepository.save(request);
    }

    public ExchangeRequest rejectRequest(String currentEmail, Long requestId) {
        return rejectRequest(requestId, getStudentByEmail(currentEmail).getId());
    }

    public ExchangeRequest cancelRequest(String currentEmail, Long requestId) {
        return cancelRequest(requestId, getStudentByEmail(currentEmail).getId());
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequest> getRequestsForStudent(Long studentId) {
        return exchangeRequestRepository.findBySenderIdOrReceiverIdOrderByCreatedAtDesc(studentId, studentId);
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequest> getRequestsForStudent(String currentEmail) {
        return getRequestsForStudent(getStudentByEmail(currentEmail).getId());
    }

    @Transactional(readOnly = true)
    public Long getStudentIdForEmail(String email) {
        return getStudentByEmail(email).getId();
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequest> getIncomingPendingRequests(Long studentId) {
        return exchangeRequestRepository.findByReceiverIdAndStatus(studentId, ExchangeRequest.RequestStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequest> getSentPendingRequests(Long studentId) {
        return exchangeRequestRepository.findBySenderIdAndStatus(studentId, ExchangeRequest.RequestStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<ExchangeRequest> getAcceptedConnections(Long studentId) {
        return exchangeRequestRepository.findAcceptedForStudent(studentId, ExchangeRequest.RequestStatus.ACCEPTED);
    }

    private Student getStudentByEmail(String email) {
        return studentRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated student not found."));
    }
}
