package com.metaverse.aurai_adra.controller;

import com.metaverse.aurai_adra.dto.MarkChapterRequest;
import com.metaverse.aurai_adra.dto.ProgressSnapshotDto;
import com.metaverse.aurai_adra.dto.RemoveChapterRequest;
import com.metaverse.aurai_adra.dto.LearningAgeResponse;
import com.metaverse.aurai_adra.service.ProgressService;
import com.metaverse.aurai_adra.util.LearningAgeUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    // GET /api/progress/chapters/{userId}
    @GetMapping("/chapters/{userId}")
    public ResponseEntity<ProgressSnapshotDto> getProgress(@PathVariable String userId) {
        var snap = progressService.getSnapshot(userId);
        return ResponseEntity.ok(snap);
    }

    // GET /api/progress/chapters/me
    @GetMapping("/chapters/me")
    public ResponseEntity<ProgressSnapshotDto> getMyProgress(Principal principal) {
        final String tokenUserId = principal != null ? principal.getName() : null;
        if (tokenUserId == null) return ResponseEntity.status(401).build();
        var snap = progressService.getSnapshot(tokenUserId);
        return ResponseEntity.ok(snap);
    }

    // POST /api/progress/chapters
    // Accepts score/meta and always records an attempt; if success=true and not previously recorded,
    // the chapter success summary is created.
    @PostMapping("/chapters")
    public ResponseEntity<ProgressSnapshotDto> markChapter(@RequestBody MarkChapterRequest req, Principal principal) {
        final String tokenUserId = principal != null ? principal.getName() : req.getUserId();
        if (tokenUserId == null) return ResponseEntity.status(401).build();

        // allow recording attempts even when success is false/absent; service will handle logic.
        var snap = progressService.markSuccess(tokenUserId, req.getChapterId(), req.getAt(), req.getScore(), req.getMeta(), req.getSuccess());
        return ResponseEntity.ok(snap);
    }

    // DELETE /api/progress/chapters
    public ResponseEntity<ProgressSnapshotDto> deleteChapter(@RequestBody RemoveChapterRequest req, Principal principal) {
        final String tokenUserId = principal != null ? principal.getName() : req.getUserId();
        if (tokenUserId == null) return ResponseEntity.status(401).build();
        var snap = progressService.removeSuccess(tokenUserId, req.getChapterId());
        return ResponseEntity.ok(snap);
    }

    // (선택) GET /api/progress/learning-age/{userId}?actualAge=67
    @GetMapping("/learning-age/{userId}")
    public ResponseEntity<LearningAgeResponse> getLearningAge(
            @PathVariable String userId,
            @RequestParam("actualAge") int actualAgeYears
    ) {
        var snap = progressService.getSnapshot(userId);
        int decade = LearningAgeUtil.getLearningDecade(actualAgeYears, snap.getSuccessCount(), snap.getTotalChapters());
        String label = LearningAgeUtil.getLearningAgeLabel(decade);
        int percent = LearningAgeUtil.getProgressPercent(snap.getSuccessCount(), snap.getTotalChapters());
        return ResponseEntity.ok(new LearningAgeResponse(userId, decade, label, percent, snap.getSuccessCount(), snap.getTotalChapters()));
    }
}
