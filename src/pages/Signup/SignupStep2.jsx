// src/pages/Signup/SignupStep2.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SignupStep2.module.css";

export default function SignupStep2() {
  const { state: prev } = useLocation(); // 1단계에서 넘어온 값: { name, birth, gender }
  const navigate = useNavigate();

  // 직접 접근 방지: 1단계 값 없으면 되돌리기
  useEffect(() => {
    if (!prev) navigate("/signup", { replace: true });
  }, [prev, navigate]);

  const [vals, setVals] = useState({
    nickname: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  const match = useMemo(
    () => vals.password.length > 0 && vals.password === vals.confirm,
    [vals.password, vals.confirm]
  );

  const allFilled = useMemo(
    () => vals.nickname.trim() && vals.password && vals.confirm,
    [vals]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVals((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allFilled) return setError("모든 항목을 입력해 주세요.");
    if (!match) return setError("비밀번호가 일치하지 않습니다.");
    // 여기서 서버 전송/회원 생성 로직을 넣을 수 있음.
    const payload = { ...prev, nickname: vals.nickname, password: vals.password };
    console.log("가입 데이터:", payload);
    // 완료 후 이동 경로 (원하는 페이지로 변경 가능)
    navigate("/login", { replace: true });
  };

  return (
    <div className={styles.s2_wrap}>
      <form className={styles.s2_form} onSubmit={handleSubmit}>
        <h1 className={styles.s2_title}>나의 정보</h1>

        <div className={styles.s2_field}>
          <label htmlFor="nickname" className={styles.s2_label}>별칭</label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            className={styles.s2_input}
            placeholder="별칭을 입력하세요"
            value={vals.nickname}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.s2_field}>
          <label htmlFor="password" className={styles.s2_label}>비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            className={styles.s2_input}
            placeholder="비밀번호를 입력하세요"
            value={vals.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.s2_field}>
          <label htmlFor="confirm" className={styles.s2_label}>비밀번호 확인</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            className={styles.s2_input}
            placeholder="비밀번호를 다시 입력하세요"
            value={vals.confirm}
            onChange={handleChange}
            required
          />
        </div>

        {/* 에러 메시지 */}
        <div className={styles.s2_error} role="alert" aria-live="polite">
          {error || (vals.confirm && !match ? "비밀번호가 일치하지 않습니다." : "")}
        </div>

        <button
          type="submit"
          className={styles.s2_confirmBtn}
          disabled={!allFilled || !match}
          aria-disabled={!allFilled || !match}
        >
          확인
        </button>
      </form>
    </div>
  );
}
