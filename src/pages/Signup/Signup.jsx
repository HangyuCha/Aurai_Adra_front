import React, { useState } from "react";
import styles from "./Signup.module.css"; // ✅ CSS Module

export default function Signup({ onNext }) {
  const [form, setForm] = useState({ name: "", birth: "", gender: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNext) onNext(form);
    else console.log("Signup form:", form);
  };

  return (
    <div className={styles.su_wrap}>
      <form className={styles.su_form} onSubmit={handleSubmit}>
        <h1 className={styles.su_title}>나의 정보</h1>

        {/* 이름 */}
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

        {/* 생년월일 */}
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

        {/* 성별 */}
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

        <button type="submit" className={styles.su_nextBtn}>다음 →</button>
      </form>
    </div>
  );
}
