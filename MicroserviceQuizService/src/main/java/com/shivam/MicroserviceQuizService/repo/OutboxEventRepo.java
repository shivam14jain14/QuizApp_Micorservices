package com.shivam.MicroserviceQuizService.repo;

import com.shivam.MicroserviceQuizService.model.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OutboxEventRepo extends JpaRepository<OutboxEvent, Long> {
    List<OutboxEvent> findTop50ByStatusInOrderByCreatedAtAsc(Collection<String> statuses);
}
