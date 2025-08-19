// src/pages/Find/FindInfo.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Findinfo.module.css";

export default function FindInfoPage() {
  const [form, setForm] = useState({ name: "", birth: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const filled = useMemo(
    () => form.name.trim() && form.birth,
    [form]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!filled) return setError("모든 항목을 입력해 주세요.");
    // TODO: 여기서 실제 조회 API 호출 가능
    console.log("정보 찾기 요청:", form);
    alert("입력하신 정보로 계정 찾기를 진행합니다."); // 임시
    navigate("/login", { replace: true }); // 필요 시 다른 경로로 변경
  };

  return (
    <div className={styles.fi_wrap}>
      <form className={styles.fi_form} onSubmit={onSubmit}>
        <h1 className={styles.fi_title}>정보 찾기</h1>

        {/* 이름 */}
        <div className={styles.fi_field}>
          <label htmlFor="name" className={styles.fi_label}>이름</label>
          <input
            id="name"
            name="name"
            type="text"
            className={styles.fi_input}
            placeholder="이름을 입력하세요"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>

        {/* 생년월일 */}
        <div className={styles.fi_field}>
          <label htmlFor="birth" className={styles.fi_label}>생년월일</label>
          <input
            id="birth"
            name="birth"
            type="date"
            className={styles.fi_input}
            value={form.birth}
            onChange={onChange}
            required
          />
        </div>

        {/* 에러 영역 */}
        <div className={styles.fi_error} role="alert" aria-live="polite">
          {error}
        </div>

        <button
          type="submit"
          className={styles.fi_submit}
          disabled={!filled}
          aria-disabled={!filled}
        >
          찾아보기
        </button>
      </form>
    </div>
  );
}
