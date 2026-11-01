package com.peerlearn;

import com.peerlearn.model.ExchangeRequest;
import com.peerlearn.model.LearningSession;
import com.peerlearn.model.Notification;
import com.peerlearn.model.PrivateMessage;
import com.peerlearn.model.Student;
import com.peerlearn.repository.NotificationRepository;
import com.peerlearn.repository.PrivateMessageRepository;
import com.peerlearn.service.ExchangeRequestService;
import com.peerlearn.service.LearningSessionService;
import com.peerlearn.service.PrivateMessageService;
import com.peerlearn.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class ExchangeRequestAndSessionTest {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ExchangeRequestService exchangeRequestService;

    @Autowired
    private LearningSessionService learningSessionService;

    @Autowired
    private PrivateMessageService privateMessageService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PrivateMessageRepository privateMessageRepository;

    private Student sender;
    private Student receiver;

    @BeforeEach
    void setUp() {
        sender = studentService.registerStudent(Student.builder()
                .fullName("Sender Student")
                .email("sender@example.edu")
                .password("pass123")
                .collegeName("Sender College")
                .branch("CSE")
                .academicYear("3rd Year")
                .build());

        receiver = studentService.registerStudent(Student.builder()
                .fullName("Receiver Student")
                .email("receiver@example.edu")
                .password("pass123")
                .collegeName("Receiver College")
                .branch("IT")
                .academicYear("3rd Year")
                .build());
    }

    @Test
    @DisplayName("Scenario 9: Send exchange request & prevent duplicates")
    void testSendRequestAndDuplicatePrevention() {
        ExchangeRequest request = exchangeRequestService.sendRequest(
                sender.getId(), receiver.getId(), "Python", "Java", "Let's exchange!", "Online");

        assertNotNull(request.getId());
        assertEquals(ExchangeRequest.RequestStatus.PENDING, request.getStatus());

        // Duplicate request attempt must throw IllegalStateException
        assertThrows(IllegalStateException.class, () ->
                exchangeRequestService.sendRequest(sender.getId(), receiver.getId(), "Python", "Java", "Duplicate", "Online"));
    }

    @Test
    @DisplayName("Scenario 10: Accept and reject exchange request")
    void testAcceptAndRejectRequests() {
        ExchangeRequest req1 = exchangeRequestService.sendRequest(
                sender.getId(), receiver.getId(), "Python", "Java", "Proposal 1", "Online");

        // Only receiver can accept
        assertThrows(SecurityException.class, () ->
                exchangeRequestService.acceptRequest(req1.getId(), sender.getId()));

        ExchangeRequest accepted = exchangeRequestService.acceptRequest(req1.getId(), receiver.getId());
        assertEquals(ExchangeRequest.RequestStatus.ACCEPTED, accepted.getStatus());
    }

    @Test
    @DisplayName("Acceptance notifies only the request owner")
    void testAcceptNotifiesOnlyRequestOwner() {
        ExchangeRequest request = exchangeRequestService.sendRequest(
                sender.getId(), receiver.getId(), "Python", "Java", "Proposal", "Online");
        long senderNotificationsBefore = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(sender.getId()).size();
        long receiverNotificationsBefore = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(receiver.getId()).size();

        exchangeRequestService.acceptRequest(request.getId(), receiver.getId());

        List<Notification> ownerNotifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(sender.getId());
        List<Notification> accepterNotifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(receiver.getId());

        assertEquals(senderNotificationsBefore + 1, ownerNotifications.size());
        assertEquals(receiverNotificationsBefore, accepterNotifications.size());
        assertEquals("REQUEST_ACCEPTED", ownerNotifications.get(0).getType());
        assertEquals(sender.getId(), ownerNotifications.get(0).getRecipient().getId());
        assertEquals(request.getId(), ownerNotifications.get(0).getRelatedRequestId());
        assertThrows(IllegalStateException.class, () ->
                exchangeRequestService.acceptRequest(request.getId(), receiver.getId()));
        assertEquals(senderNotificationsBefore + 1,
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(sender.getId()).size());
    }

    @Test
    @DisplayName("Private messages are limited to accepted request participants")
    void testPrivateMessageAuthorization() {
        ExchangeRequest request = exchangeRequestService.sendRequest(
                sender.getId(), receiver.getId(), "Python", "Java", "Proposal", "Online");

        assertThrows(IllegalStateException.class, () ->
                privateMessageService.getMessages(sender.getEmail(), request.getId()));

        exchangeRequestService.acceptRequest(request.getId(), receiver.getId());
        PrivateMessage message = privateMessageService.sendMessage(sender.getEmail(), request.getId(), "Hello");

        assertNotNull(message.getId());
        assertEquals(1, privateMessageService.getMessages(sender.getEmail(), request.getId()).size());
        assertEquals(1, privateMessageService.getMessages(receiver.getEmail(), request.getId()).size());

        Student thirdStudent = studentService.registerStudent(Student.builder()
                .fullName("Third Student")
                .email("third@example.edu")
                .password("pass123")
                .collegeName("Third College")
                .branch("CSE")
                .academicYear("2nd Year")
                .build());

        assertThrows(SecurityException.class, () ->
                privateMessageService.getMessages(thirdStudent.getEmail(), request.getId()));
        assertThrows(SecurityException.class, () ->
                privateMessageService.sendMessage(thirdStudent.getEmail(), request.getId(), "Not allowed"));
        assertEquals(1, privateMessageRepository.findByRequest_IdOrderByCreatedAtAsc(request.getId()).size());
    }

    @Test
    @DisplayName("Scenario 11: Schedule session only after accepted connection, then complete session & award XP")
    void testSessionSchedulingAndCompletion() {
        // Unconnected attempt must fail
        assertThrows(IllegalStateException.class, () ->
                learningSessionService.scheduleSession(
                        sender.getId(), receiver.getId(), "Python",
                        LocalDate.now().plusDays(2), LocalTime.of(17, 0),
                        60, "Online", "https://meet.google.com/test", "Intro to Python"));

        // Accept connection first
        ExchangeRequest req = exchangeRequestService.sendRequest(
                sender.getId(), receiver.getId(), "Python", "Java", "Proposal", "Online");
        exchangeRequestService.acceptRequest(req.getId(), receiver.getId());

        // Schedule session now succeeds
        LearningSession session = learningSessionService.scheduleSession(
                sender.getId(), receiver.getId(), "Python",
                LocalDate.now().plusDays(2), LocalTime.of(17, 0),
                60, "Online", "https://meet.google.com/test", "Intro to Python");

        assertNotNull(session.getId());
        assertEquals(LearningSession.SessionStatus.UPCOMING, session.getStatus());

        int initialMentorXp = sender.getXpPoints();

        // Mark completed
        LearningSession completed = learningSessionService.completeSession(session.getId(), 5, "Great session!");
        assertEquals(LearningSession.SessionStatus.COMPLETED, completed.getStatus());

        // Verify mentor XP increased by +100
        Student updatedMentor = studentService.getStudentById(sender.getId()).orElseThrow();
        assertEquals(initialMentorXp + 100, updatedMentor.getXpPoints(), "Mentor must receive exactly +100 XP");
        assertEquals(1, updatedMentor.getCompletedSessionsCount());
    }
}
