// src/pages/Find/FindInfoResult.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./FindInfo.module.css"; // ✅ 기존 스타일 재사용

export default function FindInfoResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  // 직접 접근 방지: 이전 스텝 값이 없으면 /find로 돌려보냄
  useEffect(() => {
    if (!state || (!state.nickname && !state.password)) {
      navigate("/find", { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  return (
    <div className={styles.fi_wrap}>
      <form
        className={styles.fi_form}
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/login", { replace: true }); // ✅ 확인 → 로그인으로
        }}
      >
        <h1 className={styles.fi_title}>정보 찾기</h1>

        {/* 별칭 (읽기 전용) */}
        <div className={styles.fi_field}>
          <label className={styles.fi_label}>별칭</label>
          <input
            className={styles.fi_input}
            type="text"
            value={state.nickname ?? ""}
            readOnly
          />
        </div>

        {/* 비밀번호 (읽기 전용 + 보기/숨기기 토글) */}
        <div className={styles.fi_field}>
          <label className={styles.fi_label}>비밀번호</label>
          <div style={{ position: "relative" }}>
            <input
              className={styles.fi_input}
              type={showPw ? "text" : "password"}
              value={state.password ?? ""}
              readOnly
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label="비밀번호 표시 전환"
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                height: 36,
                padding: "0 10px",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                font: "inherit",
                color: "#555",
              }}
            >
              {showPw ? "숨기기" : "보기"}
            </button>
          </div>
        </div>

        {/* 에러 영역은 없음(표시만) */}

        <button type="submit" className={styles.fi_submit}>
          확인
        </button>
      </form>
    </div>
  );
}
