package com.metaverse.aurai_adra.repository;

import com.metaverse.aurai_adra.domain.PracticeAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PracticeAttemptRepository extends JpaRepository<PracticeAttempt, Long> {
    List<PracticeAttempt> findByUserId(String userId);
    List<PracticeAttempt> findByUserIdAndChapterId(String userId, Integer chapterId);
}
