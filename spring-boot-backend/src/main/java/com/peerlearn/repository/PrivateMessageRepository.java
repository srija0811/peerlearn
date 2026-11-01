package com.peerlearn.repository;

import com.peerlearn.model.PrivateMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, Long> {
    List<PrivateMessage> findByRequest_IdOrderByCreatedAtAsc(Long requestId);
}
