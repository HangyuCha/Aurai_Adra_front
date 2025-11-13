package com.metaverse.aurai_adra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeScoresResponse {
    private String userId;
    private String appId; // sms | call | gpt | kakao
    private List<PracticeScoreItem> scores; // latest by chapter
}
