package com.peerlearn.dto;

import com.peerlearn.model.ExchangeRequest;

import java.time.LocalDateTime;

public record ExchangeRequestDto(
        Long id,
        Long senderId,
        String senderName,
        String senderCollege,
        Long receiverId,
        String receiverName,
        String receiverCollege,
        String teachingSkill,
        String learningSkill,
        String message,
        String preferredMode,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static ExchangeRequestDto from(ExchangeRequest request) {
        return new ExchangeRequestDto(
                request.getId(),
                request.getSender().getId(),
                request.getSender().getFullName(),
                request.getSender().getCollegeName(),
                request.getReceiver().getId(),
                request.getReceiver().getFullName(),
                request.getReceiver().getCollegeName(),
                request.getTeachingSkill(),
                request.getLearningSkill(),
                request.getMessage(),
                request.getPreferredMode(),
                request.getStatus().name(),
                request.getCreatedAt(),
                request.getUpdatedAt());
    }
}
