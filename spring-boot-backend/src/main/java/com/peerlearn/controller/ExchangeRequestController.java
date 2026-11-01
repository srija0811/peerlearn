package com.peerlearn.controller;

import com.peerlearn.model.ExchangeRequest;
import com.peerlearn.dto.ExchangeRequestDto;
import com.peerlearn.service.ExchangeRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/requests")
public class ExchangeRequestController {

    @Autowired
    private ExchangeRequestService exchangeRequestService;

    @PostMapping
    public ResponseEntity<?> sendRequest(@Valid @RequestBody SendRequestPayload payload, Principal principal) {
        try {
            ExchangeRequest created = exchangeRequestService.sendRequest(
                    principal.getName(),
                    payload.receiverId(),
                    payload.teachingSkill(),
                    payload.learningSkill(),
                    payload.message(),
                    payload.preferredMode());
            return ResponseEntity.ok(ExchangeRequestDto.from(created));
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id, Principal principal) {
        try {
            ExchangeRequest accepted = exchangeRequestService.acceptRequest(principal.getName(), id);
            return ResponseEntity.ok(ExchangeRequestDto.from(accepted));
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, Principal principal) {
        try {
            ExchangeRequest rejected = exchangeRequestService.rejectRequest(principal.getName(), id);
            return ResponseEntity.ok(ExchangeRequestDto.from(rejected));
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long id, Principal principal) {
        try {
            ExchangeRequest cancelled = exchangeRequestService.cancelRequest(principal.getName(), id);
            return ResponseEntity.ok(ExchangeRequestDto.from(cancelled));
        } catch (Exception e) {
            return errorResponse(e);
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ExchangeRequestDto>> getMine(Principal principal) {
        return ResponseEntity.ok(exchangeRequestService.getRequestsForStudent(principal.getName())
                .stream()
                .map(ExchangeRequestDto::from)
                .toList());
    }

    @GetMapping("/incoming/{studentId}")
    public ResponseEntity<?> getIncoming(@PathVariable Long studentId, Principal principal) {
        if (!isCurrentStudent(studentId, principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(exchangeRequestService.getIncomingPendingRequests(studentId)
                .stream().map(ExchangeRequestDto::from).toList());
    }

    @GetMapping("/sent/{studentId}")
    public ResponseEntity<?> getSent(@PathVariable Long studentId, Principal principal) {
        if (!isCurrentStudent(studentId, principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(exchangeRequestService.getSentPendingRequests(studentId)
                .stream().map(ExchangeRequestDto::from).toList());
    }

    @GetMapping("/accepted/{studentId}")
    public ResponseEntity<?> getAccepted(@PathVariable Long studentId, Principal principal) {
        if (!isCurrentStudent(studentId, principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(exchangeRequestService.getAcceptedConnections(studentId)
                .stream().map(ExchangeRequestDto::from).toList());
    }

    private boolean isCurrentStudent(Long studentId, Principal principal) {
        return exchangeRequestService.getStudentIdForEmail(principal.getName()).equals(studentId);
    }

    private ResponseEntity<String> errorResponse(Exception exception) {
        HttpStatus status = exception instanceof SecurityException
                ? HttpStatus.FORBIDDEN
                : exception instanceof IllegalArgumentException
                        ? HttpStatus.BAD_REQUEST
                        : HttpStatus.CONFLICT;
        return ResponseEntity.status(status).body(exception.getMessage());
    }

    public record SendRequestPayload(
            Long receiverId,
            @NotBlank String teachingSkill,
            @NotBlank String learningSkill,
            String message,
            String preferredMode) {
    }
}
