package com.metaverse.aurai_adra.dto;

import lombok.Data;
import java.util.Map;

@Data
public class MarkChapterRequest {
    // optional (will be ignored when a token principal is available)
    private String userId;

    private Integer chapterId;
    private Boolean success;
    private String at;
    private Map<String, Object> score;
    private Map<String, Object> meta;
}
