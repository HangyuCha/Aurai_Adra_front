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

  // TODO: 실제 API로 별칭/비밀번호(또는 재설정 링크) 조회
  const demoNickname = `${form.name.trim()}님`;
  const demoPassword = "demo-1234";

  // ✅ Step2로 값 전달
  navigate("/find/step2", {
    replace: false,
    state: {
      name: form.name,
      birth: form.birth,
      nickname: demoNickname,
      password: demoPassword,
    },
  });
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
