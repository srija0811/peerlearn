package com.peerlearn.dto;

import com.peerlearn.model.Notification;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        String title,
        String message,
        String type,
        Long relatedRequestId,
        Boolean read,
        LocalDateTime createdAt) {

    public static NotificationDto from(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getRelatedRequestId(),
                notification.getRead(),
                notification.getCreatedAt());
    }
}
