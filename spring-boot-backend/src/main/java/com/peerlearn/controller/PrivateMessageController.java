package com.peerlearn.controller;

import com.peerlearn.model.PrivateMessage;
import com.peerlearn.service.PrivateMessageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/requests/{requestId}/messages")
public class PrivateMessageController {

    private final PrivateMessageService privateMessageService;

    public PrivateMessageController(PrivateMessageService privateMessageService) {
        this.privateMessageService = privateMessageService;
    }

    @GetMapping
    public ResponseEntity<?> getMessages(
            @PathVariable Long requestId,
            Principal principal) {
        try {
            return ResponseEntity.ok(privateMessageService.getMessages(principal.getName(), requestId)
                    .stream()
                    .map(PrivateMessageDto::from)
                    .toList());
        } catch (Exception exception) {
            return errorResponse(exception);
        }
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @PathVariable Long requestId,
            @Valid @RequestBody SendMessageRequest payload,
            Principal principal) {
        try {
            PrivateMessage saved = privateMessageService.sendMessage(
                    principal.getName(), requestId, payload.content());
            return ResponseEntity.ok(PrivateMessageDto.from(saved));
        } catch (Exception exception) {
            return errorResponse(exception);
        }
    }

    @PostMapping("/attachments")
    public ResponseEntity<?> sendAttachment(
            @PathVariable Long requestId,
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        try {
            PrivateMessage saved = privateMessageService.sendAttachment(principal.getName(), requestId, file);
            return ResponseEntity.ok(PrivateMessageDto.from(saved));
        } catch (Exception exception) {
            return errorResponse(exception);
        }
    }

    @GetMapping("/{messageId}/attachment")
    public ResponseEntity<?> getAttachment(
            @PathVariable Long requestId,
            @PathVariable Long messageId,
            Principal principal) {
        try {
            PrivateMessage message = privateMessageService.getAttachment(principal.getName(), requestId, messageId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                            .filename(message.getAttachmentName(), StandardCharsets.UTF_8)
                            .build()
                            .toString())
                    .header("X-Content-Type-Options", "nosniff")
                    .contentLength(message.getAttachmentSize())
                    .body(new ByteArrayResource(message.getAttachmentData()));
        } catch (Exception exception) {
            return errorResponse(exception);
        }
    }

    private ResponseEntity<String> errorResponse(Exception exception) {
        HttpStatus status = exception instanceof SecurityException
                ? HttpStatus.FORBIDDEN
                : exception instanceof IllegalArgumentException
                        ? HttpStatus.NOT_FOUND
                        : HttpStatus.CONFLICT;
        return ResponseEntity.status(status).body(exception.getMessage());
    }

    public record SendMessageRequest(
            @NotBlank @Size(max = 4000) String content) {
    }

    public record PrivateMessageDto(
            Long id,
            Long requestId,
            Long senderId,
            String senderName,
            String content,
            LocalDateTime createdAt,
            String attachmentName,
            Long attachmentSize) {

        private static PrivateMessageDto from(PrivateMessage message) {
            return new PrivateMessageDto(
                    message.getId(),
                    message.getRequest().getId(),
                    message.getSender().getId(),
                    message.getSender().getFullName(),
                    message.getContent(),
                    message.getCreatedAt(),
                    message.getAttachmentName(),
                    message.getAttachmentSize());
        }
    }
}
