package com.metaverse.aurai_adra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeScoreItem {
    private Integer chapterId;
    private Integer total; // 0~100
    private String at;     // ISO8601 timestamp of the attempt
}
