import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './myinfo.module.css';
import BackButton from '../../components/BackButton/BackButton';

import avatar20M from '../../assets/20M.png';
import avatar20F from '../../assets/20F.png';
import avatar40M from '../../assets/40M.png';
import avatar40F from '../../assets/40F.png';
import avatar80M from '../../assets/80M.png';
import avatar80F from '../../assets/80F.png';
import avatarDefault from '../../assets/default.png';

const avatarMap = {
  '20M': avatar20M, '20F': avatar20F,
  '40M': avatar40M, '40F': avatar40F,
  '80M': avatar80M, '80F': avatar80F,
  default: avatarDefault,
};

// 유틸 복구
const parseAgeRange = (ar) => {
  const a = (ar || '').toString().trim();
  if (/^\d{2}대$/.test(a)) return { display: a, band: a.replace('대','') };
  const m = a.match(/^(\d{2})s$/i);
  if (m) return { display: `${m[1]}대`, band: m[1] };
  if (/^\d{2}$/.test(a)) return { display: `${a}대`, band: a };
  return { display: '—', band: '' };
};
const parseGender = (gd) => {
  const g = (gd || '').toString().trim().toLowerCase();
  if (['m','male','남','남성'].includes(g)) return 'M';
  if (['f','female','여','여성'].includes(g)) return 'F';
  return '';
}

export default function MyInfoPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [ageDisplay, setAgeDisplay] = useState('—');
  const [ageBand, setAgeBand] = useState('');
  const [gender, setGender] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const readFromStorage = useCallback(() => {
    const nn = localStorage.getItem('nickname') || '';
    const ar = localStorage.getItem('ageRange') || localStorage.getItem('age') || localStorage.getItem('signup_ageRange') || '';
    const gd = localStorage.getItem('gender') || localStorage.getItem('signup_gender') || '';
    const age = parseAgeRange(ar);
    setNickname(nn);
    setAgeDisplay(age.display);
    setAgeBand(age.band);
    setGender(parseGender(gd));
  }, []);
  useEffect(() => { readFromStorage(); }, [readFromStorage]);

  const avatarKey = ageBand && gender ? `${ageBand}${gender}` : 'default';
  const avatarSrc = useMemo(() => avatarMap[avatarKey] || avatarDefault, [avatarKey]);

  // 서버 삭제(단일 요청)
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

      // 토큰에 실수로 들어간 양끝의 " 제거
      const raw = localStorage.getItem('accessToken');
      const token = raw?.replace(/^"|"$/g, '');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await axios.delete('/api/users/me', {
        baseURL,
        headers: { Authorization: `Bearer ${token}` },
      });

      // 성공 처리
      localStorage.clear();
      window.dispatchEvent(new Event('auth-change'));
      setConfirmOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('탈퇴 실패', err);
      alert('탈퇴 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.stage}>
      <div className={styles.headBack}>
        <BackButton variant="inside" />
      </div>
      <div className={styles.canvas}>
        <div className={styles.bgMain} />
        <div className={styles.title}>나의 정보</div>

        <img className={styles.bigAvatar} src={avatarSrc} alt="avatar"
             onError={(e)=>{ e.currentTarget.src = avatarDefault; }} />

        <section className={styles.infoPanel}>
          <div className={styles.row}>
            <div className={styles.label}>별칭</div>
            <span className={styles.divider} />
            <div className={styles.value}>{nickname || '—'}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>나이</div>
            <span className={styles.divider} />
            <div className={styles.value}>{ageDisplay}</div>
          </div>
          <div className={styles.panelActions}>
            <button className={styles.sharePrimary} onClick={() => navigate('/mission-share')}>
              미션 자랑하기
            </button>
            <button className={styles.withdrawLink} onClick={() => setConfirmOpen(true)}>
              회원 탈퇴하기
            </button>
          </div>
        </section>
      </div>

      {confirmOpen && (
        <div className={styles.modalBackdrop} onClick={() => !deleting && setConfirmOpen(false)}>
          <div className={styles.modal} onClick={(e)=>e.stopPropagation()}>
            <div className={styles.modalTitle}>정말 회원 탈퇴하시겠습니까?</div>
            <div className={styles.modalMsg}>탈퇴 시 계정 정보가 삭제됩니다.</div>
            <div className={styles.modalActions}>
              <button className={styles.btnYes} onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? '처리중...' : '예'}
              </button>
              <button className={styles.btnNo} onClick={()=>setConfirmOpen(false)} disabled={deleting}>
                아니요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
