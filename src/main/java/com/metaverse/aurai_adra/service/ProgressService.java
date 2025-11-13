package com.metaverse.aurai_adra.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.metaverse.aurai_adra.domain.PracticeAttempt;
import com.metaverse.aurai_adra.domain.UserChapterSuccess;
import com.metaverse.aurai_adra.domain.UserChapterSuccessId;
import com.metaverse.aurai_adra.dto.ProgressSnapshotDto;
import com.metaverse.aurai_adra.dto.PracticeScoreItem;
import com.metaverse.aurai_adra.dto.PracticeScoresResponse;
import com.metaverse.aurai_adra.repository.PracticeAttemptRepository;
import com.metaverse.aurai_adra.repository.UserChapterSuccessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final UserChapterSuccessRepository repo;
    // 총 챕터 수: 서비스 정책상 20으로 고정
    private static final int TOTAL_CHAPTERS = 20;

    private final PracticeAttemptRepository attemptRepo;
    private final ObjectMapper objectMapper;

    public ProgressService(UserChapterSuccessRepository repo, PracticeAttemptRepository attemptRepo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.attemptRepo = attemptRepo;
        this.objectMapper = objectMapper;
    }

    public int getTotalChapters() { return TOTAL_CHAPTERS; }

    @Transactional(readOnly = true)
    public ProgressSnapshotDto getSnapshot(String userId) {
        var list = repo.findByIdUserIdOrderByIdChapterIdAsc(userId);
        var successes = list.stream()
                .map(e -> e.getId().getChapterId())
                .sorted(Comparator.naturalOrder())
                .toList();
        return new ProgressSnapshotDto(userId, TOTAL_CHAPTERS, successes);
    }

    @Transactional
    public ProgressSnapshotDto markSuccess(String userId, Integer chapterId, String atIso8601, Map<String, Object> score, Map<String, Object> meta, Boolean success) {
        validateChapterId(chapterId);
        Instant at = parseInstantOrNow(atIso8601);

        // 1) store attempt record (always) for analytics
        try {
            String scoreJson = score != null ? objectMapper.writeValueAsString(score) : null;
            String metaJson = meta != null ? objectMapper.writeValueAsString(meta) : null;
            var attempt = PracticeAttempt.of(userId, chapterId, at, scoreJson, metaJson);
            attemptRepo.save(attempt);
        } catch (JsonProcessingException e) {
            // serialization failed -> still continue without JSON
            var attempt = PracticeAttempt.of(userId, chapterId, at, null, null);
            attemptRepo.save(attempt);
        }

        // 2) If success flagged, record summary (only first-time success)
        if (Boolean.TRUE.equals(success)) {
            var id = new UserChapterSuccessId(userId, chapterId);
            if (!repo.existsById(id)) {
                repo.save(UserChapterSuccess.of(userId, chapterId, at)); // 최초 성공만 기록
            }
        }
        return getSnapshot(userId);
    }

    @Transactional
    public ProgressSnapshotDto removeSuccess(String userId, Integer chapterId) {
        validateChapterId(chapterId);
        var id = new UserChapterSuccessId(userId, chapterId);
        repo.findById(id).ifPresent(repo::delete);
        return getSnapshot(userId);
    }

    @Transactional(readOnly = true)
    public PracticeScoresResponse getLatestPracticeScores(String userId, String appId) {
        // Map appId to chapter range: sms=1..5, call=6..10, gpt=11..15, kakao=16..20
        final String app = appId == null ? "" : appId.trim().toLowerCase();
        int start = 1, end = 20;
        if ("sms".equals(app)) { start = 1; end = 5; }
        else if ("call".equals(app)) { start = 6; end = 10; }
        else if ("gpt".equals(app)) { start = 11; end = 15; }
        else if ("kakao".equals(app)) { start = 16; end = 20; }

        final int s = start, e = end;
        var attempts = attemptRepo.findByUserId(userId).stream()
                .filter(a -> a.getChapterId() != null && a.getChapterId() >= s && a.getChapterId() <= e)
                .collect(Collectors.groupingBy(PracticeAttempt::getChapterId));

        var items = attempts.entrySet().stream()
                .map(entry -> {
                    // pick latest by timestamp
                    var list = entry.getValue();
                    PracticeAttempt latest = list.stream()
                            .filter(a -> a.getAt() != null)
                            .max(Comparator.comparing(PracticeAttempt::getAt))
                            .orElseGet(() -> list.stream().findFirst().orElse(null));
                    if (latest == null) return null;
                    Integer total = null;
                    try {
                        if (latest.getScoreJson() != null) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> score = objectMapper.readValue(latest.getScoreJson(), Map.class);
                            Object t = score != null ? score.get("total") : null;
                            if (t instanceof Number) total = ((Number) t).intValue();
                            else if (t != null) total = Integer.parseInt(String.valueOf(t));
                        }
                    } catch (Exception ignore) { /* ignore malformed JSON */ }
                    String atIso = latest.getAt() != null ? latest.getAt().toString() : null;
                    return new PracticeScoreItem(entry.getKey(), total, atIso);
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(PracticeScoreItem::getChapterId))
                .toList();

        return new PracticeScoresResponse(userId, app, items);
    }

    private void validateChapterId(Integer chapterId) {
        if (chapterId == null || chapterId < 1 || chapterId > TOTAL_CHAPTERS) {
            throw new IllegalArgumentException("chapterId must be between 1 and " + TOTAL_CHAPTERS);
        }
    }

    private Instant parseInstantOrNow(String iso) {
        if (iso == null || iso.isBlank()) return Instant.now();
        try { return Instant.parse(iso); } catch (DateTimeParseException e) { return Instant.now(); }
    }
}
