package com.peerlearn.service;

import com.peerlearn.dto.NotificationDto;
import com.peerlearn.model.Notification;
import com.peerlearn.model.Student;
import com.peerlearn.repository.NotificationRepository;
import com.peerlearn.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            StudentRepository studentRepository) {
        this.notificationRepository = notificationRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getForStudent(String email) {
        Student student = getStudent(email);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(NotificationDto::from)
                .toList();
    }

    public NotificationDto markRead(String email, Long notificationId) {
        Student student = getStudent(email);
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, student.getId())
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));
        notification.setRead(true);
        return NotificationDto.from(notificationRepository.save(notification));
    }

    private Student getStudent(String email) {
        return studentRepository.findByEmailIgnoreCase(email)
                .filter(student -> student.getRole() == Student.Role.ROLE_STUDENT)
                .orElseThrow(() -> new SecurityException("Student access is required."));
    }
}
