// src/pages/Signup/Signup.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

export default function Signup({ onNext }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", birth: "", gender: "" });

  // Prefill from OAuth pending/profile if exists
  useEffect(() => {
    try {
      const pending = JSON.parse(sessionStorage.getItem('oauth_pending') || 'null');
      const pre = state || {};
      const name = pre.name || pending?.profile?.nickname || "";
      const gender = pre.gender || pending?.profile?.gender || "";
      setForm((p)=> ({ ...p, name, gender }));
  } catch { /* ignore prefill errors */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const isFilled = useMemo(
    () => form.name.trim() && form.birth && form.gender,
    [form]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFilled) return;
    // 2단계로 이동하며 1단계 값 전달
  // Pass along OAuth flag so step2 can include provider/access token
  const pending = sessionStorage.getItem('oauth_pending');
  const isOAuth = !!pending;
  navigate("/signup/extra", { state: { ...form, oauth: isOAuth } });
    if (onNext) onNext(form);
  };

  return (
    <div className={styles.su_wrap}>
      <form className={styles.su_form} onSubmit={handleSubmit}>
        <h1 className={styles.su_title}>나의 정보</h1>

        <div className={styles.su_field}>
          <label htmlFor="name" className={styles.su_label}>이름</label>
          <input
            id="name"
            name="name"
            type="text"
            className={styles.su_input}
            placeholder="이름을 입력하세요"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.su_field}>
          <label htmlFor="birth" className={styles.su_label}>생년월일</label>
          <input
            id="birth"
            name="birth"
            type="date"
            className={styles.su_input}
            value={form.birth}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.su_field}>
          <label htmlFor="gender" className={styles.su_label}>성별</label>
          <select
            id="gender"
            name="gender"
            className={styles.su_input}
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="" disabled>성별 선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
            <option value="na">선택 안 함</option>
          </select>
        </div>

        <button
          type="submit"
          className={styles.su_nextBtn}
          disabled={!isFilled}
          aria-disabled={!isFilled}
        >
          다음 →
        </button>
      </form>
    </div>
  );
}
