package com.peerlearn;

import com.peerlearn.model.Activity;
import com.peerlearn.model.ExchangeRequest;
import com.peerlearn.model.Notification;
import com.peerlearn.model.PrivateMessage;
import com.peerlearn.model.Student;
import com.peerlearn.repository.ActivityRepository;
import com.peerlearn.repository.ExchangeRequestRepository;
import com.peerlearn.repository.NotificationRepository;
import com.peerlearn.repository.PrivateMessageRepository;
import com.peerlearn.repository.StudentRepository;
import com.peerlearn.service.ExchangeRequestService;
import com.peerlearn.service.PrivateMessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrivateConversationServiceTest {

    @Mock
    private ExchangeRequestRepository exchangeRequestRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private PrivateMessageRepository privateMessageRepository;

    private Student owner;
    private Student accepter;
    private ExchangeRequest request;

    @BeforeEach
    void setUp() {
        owner = student(1L, "owner@example.edu", Student.Role.ROLE_STUDENT);
        accepter = student(2L, "accepter@example.edu", Student.Role.ROLE_STUDENT);
        request = ExchangeRequest.builder()
                .id(9L)
                .sender(owner)
                .receiver(accepter)
                .teachingSkill("Python")
                .learningSkill("Java")
                .status(ExchangeRequest.RequestStatus.PENDING)
                .build();
    }

    @Test
    void acceptanceNotifiesOnlyOwnerAndDoesNotPublishActivity() {
        when(exchangeRequestRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(request));
        when(exchangeRequestRepository.save(request)).thenReturn(request);

        service().acceptRequest(9L, accepter.getId());

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        Notification notification = notificationCaptor.getValue();
        assertSame(owner, notification.getRecipient());
        assertEquals("REQUEST_ACCEPTED", notification.getType());
        assertEquals(9L, notification.getRelatedRequestId());
        verifyNoInteractions(activityRepository);

        assertThrows(IllegalStateException.class, () -> service().acceptRequest(9L, accepter.getId()));
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void onlyAcceptedRequestParticipantsCanReadOrSendMessages() {
        request.setStatus(ExchangeRequest.RequestStatus.ACCEPTED);
        Student otherStudent = student(3L, "other@example.edu", Student.Role.ROLE_STUDENT);
        Student administrator = student(4L, "admin@example.edu", Student.Role.ROLE_ADMIN);
        when(exchangeRequestRepository.findById(9L)).thenReturn(Optional.of(request));
        when(studentRepository.findByEmailIgnoreCase(owner.getEmail())).thenReturn(Optional.of(owner));
        when(studentRepository.findByEmailIgnoreCase(accepter.getEmail())).thenReturn(Optional.of(accepter));
        when(studentRepository.findByEmailIgnoreCase(otherStudent.getEmail())).thenReturn(Optional.of(otherStudent));
        when(studentRepository.findByEmailIgnoreCase(administrator.getEmail())).thenReturn(Optional.of(administrator));
        when(privateMessageRepository.findByRequest_IdOrderByCreatedAtAsc(9L)).thenReturn(List.of());
        when(privateMessageRepository.save(any(PrivateMessage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PrivateMessageService service = new PrivateMessageService(
                privateMessageRepository, exchangeRequestRepository, studentRepository);

        assertTrue(service.getMessages(owner.getEmail(), 9L).isEmpty());
        assertTrue(service.getMessages(accepter.getEmail(), 9L).isEmpty());
        PrivateMessage sentMessage = service.sendMessage(owner.getEmail(), 9L, "  Hello  ");
        assertSame(owner, sentMessage.getSender());
        assertEquals("Hello", sentMessage.getContent());
        assertThrows(SecurityException.class, () -> service.getMessages(otherStudent.getEmail(), 9L));
        assertThrows(SecurityException.class,
                () -> service.sendMessage(otherStudent.getEmail(), 9L, "Private message"));
        assertThrows(SecurityException.class, () -> service.getMessages(administrator.getEmail(), 9L));
        verify(privateMessageRepository, times(2)).findByRequest_IdOrderByCreatedAtAsc(9L);
        verify(privateMessageRepository, times(1)).save(any(PrivateMessage.class));
    }

    @Test
    void chatRemainsLockedUntilRequestAcceptance() {
        when(exchangeRequestRepository.findById(9L)).thenReturn(Optional.of(request));
        when(studentRepository.findByEmailIgnoreCase(owner.getEmail())).thenReturn(Optional.of(owner));

        PrivateMessageService service = new PrivateMessageService(
                privateMessageRepository, exchangeRequestRepository, studentRepository);

        assertThrows(IllegalStateException.class, () -> service.getMessages(owner.getEmail(), 9L));
        verifyNoInteractions(privateMessageRepository);
    }

    @Test
    void attachmentUploadAndDownloadRemainPrivateToAcceptedParticipants() throws Exception {
        request.setStatus(ExchangeRequest.RequestStatus.ACCEPTED);
        when(exchangeRequestRepository.findById(9L)).thenReturn(Optional.of(request));
        when(studentRepository.findByEmailIgnoreCase(owner.getEmail())).thenReturn(Optional.of(owner));
        when(studentRepository.findByEmailIgnoreCase(accepter.getEmail())).thenReturn(Optional.of(accepter));
        Student otherStudent = student(3L, "other@example.edu", Student.Role.ROLE_STUDENT);
        when(studentRepository.findByEmailIgnoreCase(otherStudent.getEmail())).thenReturn(Optional.of(otherStudent));
        when(privateMessageRepository.save(any(PrivateMessage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PrivateMessageService service = new PrivateMessageService(
                privateMessageRepository, exchangeRequestRepository, studentRepository);
        MockMultipartFile file = new MockMultipartFile(
                "file", "../notes.txt", "text/plain", "private notes".getBytes());

        PrivateMessage uploaded = service.sendAttachment(owner.getEmail(), 9L, file);

        assertEquals("notes.txt", uploaded.getAttachmentName());
        assertArrayEquals("private notes".getBytes(), uploaded.getAttachmentData());
        assertEquals(file.getSize(), uploaded.getAttachmentSize());
        when(privateMessageRepository.findById(uploaded.getId())).thenReturn(Optional.of(uploaded));
        assertSame(uploaded, service.getAttachment(accepter.getEmail(), 9L, uploaded.getId()));
        assertThrows(SecurityException.class,
                () -> service.getAttachment(otherStudent.getEmail(), 9L, uploaded.getId()));
        verify(privateMessageRepository, times(1)).save(any(PrivateMessage.class));
    }

    private ExchangeRequestService service() {
        return new ExchangeRequestService(
                exchangeRequestRepository, studentRepository, activityRepository, notificationRepository);
    }

    private Student student(Long id, String email, Student.Role role) {
        return Student.builder()
                .id(id)
                .fullName(email.substring(0, email.indexOf('@')))
                .email(email)
                .collegeName("PeerLearn College")
                .branch("CSE")
                .academicYear("3rd Year")
                .role(role)
                .build();
    }
}
