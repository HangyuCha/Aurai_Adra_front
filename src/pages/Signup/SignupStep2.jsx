// src/pages/Signup/SignupStep2.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";                                   // 추가
import styles from "./SignupStep2.module.css";

// birth(yyyy-mm-dd) → "20s"|"30s"...
function toAgeRange(birth) {
  try {
    const y = parseInt(String(birth).slice(0, 4), 10);
    if (!y || Number.isNaN(y)) return "";
    const nowY = new Date().getFullYear();
    const age = Math.max(0, nowY - y);                       // 단순 만나이
    const decade = Math.floor(age / 10) * 10;                // 0,10,20,...
    if (decade < 10) return "10s";
    if (decade > 80) return "80s";
    return `${decade}s`;
  } catch {
    return "";
  }
}

function normGender(g) {
  const s = String(g || "").toLowerCase();
  if (["m", "male", "남", "남성"].includes(s)) return "male";
  if (["f", "female", "여", "여성"].includes(s)) return "female";
  return "male";
}

export default function SignupStep2() {
  const { state: prev } = useLocation(); // { name, birth, gender }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allFilled) return setError("모든 항목을 입력해 주세요.");
    if (!match) return setError("비밀번호가 일치하지 않습니다.");
    if (!prev)   return setError("1단계 정보가 없습니다. 처음부터 진행해 주세요.");

    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const payload = {
      nickname: vals.nickname.trim(),
      password: vals.password,
      gender:   normGender(prev.gender),
      ageRange: toAgeRange(prev.birth),
    };

    try {
      await axios.post("/api/users/register", payload, { baseURL });

      // 로그인 단계 보완용으로 기본값 저장(없으면 로그인 때 불러옵니다)
      localStorage.setItem("signup_gender", payload.gender);
      localStorage.setItem("signup_ageRange", payload.ageRange);

      alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err?.response?.data || err?.message || "가입 중 오류가 발생했습니다.";
      setError(typeof msg === "string" ? msg : "가입 중 오류가 발생했습니다.");
    }
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
