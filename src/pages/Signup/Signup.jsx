// src/pages/Signup/Signup.jsx
import React, { useState } from "react";
import styles from "./Signup.css"; // ✅ CSS 모듈 import

export default function Signup({ onNext }) {
  const [form, setForm] = useState({ name: "", birth: "", gender: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNext) onNext(form);
    else console.log("Signup form:", form);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>나의 정보</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* 이름 */}
          <div className={styles.row}>
            <label htmlFor="name" className={styles.label}>이름</label>
            <input
              id="name"
              name="name"
              type="text"
              className={styles.input}
              placeholder="이름을 입력하세요"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* 생년월일 */}
          <div className={styles.row}>
            <label htmlFor="birth" className={styles.label}>생년월일</label>
            <input
              id="birth"
              name="birth"
              type="date"
              className={styles.input}
              value={form.birth}
              onChange={handleChange}
              required
            />
          </div>

          {/* 성별 */}
          <div className={styles.row}>
            <label htmlFor="gender" className={styles.label}>성별</label>
            <select
              id="gender"
              name="gender"
              className={styles.input}
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

          {/* 다음 버튼 */}
          <div className={styles.actions}>
            <button type="submit" className={styles.nextBtn}>다음 →</button>
          </div>
        </form>
      </div>
    </div>
  );
}
