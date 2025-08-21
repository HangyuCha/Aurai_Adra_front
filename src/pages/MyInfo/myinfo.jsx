import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './myinfo.module.css';

import avatar20M from '../../assets/20M.png';
import avatar20F from '../../assets/20F.png';
import avatar40M from '../../assets/40M.png';
import avatar40F from '../../assets/40F.png';
import avatar80M from '../../assets/80M.png';
import avatar80F from '../../assets/80F.png';
import avatarDefault from '../../assets/default.png';

const avatarMap = {
  '20M': avatar20M,
  '20F': avatar20F,
  '40M': avatar40M,
  '40F': avatar40F,
  '80M': avatar80M,
  '80F': avatar80F,
};

const parseAgeRange = (ar) => {
  const a = (ar || '').toString().trim();
  if (/^\d{2}대$/.test(a)) return { display: a, band: a.replace('대', '') };
  const m = a.match(/^(\d{2})s$/i);
  if (m) return { display: `${m[1]}대`, band: m[1] };
  if (/^\d{2}$/.test(a)) return { display: `${a}대`, band: a };
  return { display: '—', band: '' };
};
const parseGender = (gd) => {
  const g = (gd || '').toString().trim().toLowerCase();
  if (g === 'm' || g === 'male' || g === '남' || g === '남성') return 'M';
  if (g === 'f' || g === 'female' || g === '여' || g === '여성') return 'F';
  return '';
};

export default function MyInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [nickname, setNickname] = useState('');
  const [ageDisplay, setAgeDisplay] = useState('—'); // "20대"
  const [ageBand, setAgeBand] = useState('');        // "20"
  const [gender, setGender] = useState('');          // "M" | "F"

  const readFromStorage = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('권한이 없습니다.');
      navigate('/login', { replace: true });
      return;
    }
    const nn = localStorage.getItem('nickname') || '';
    // ageRange, age, signup_ageRange 순서로 우선순위
    const ar =
      localStorage.getItem('ageRange') ||
      localStorage.getItem('age') ||
      localStorage.getItem('signup_ageRange') ||
      '';
    const gd =
      localStorage.getItem('gender') ||
      localStorage.getItem('signup_gender') ||
      'male';

    const age = parseAgeRange(ar);
    setNickname(nn);
    setAgeDisplay(age.display);
    setAgeBand(age.band);
    setGender(parseGender(gd));
  }, [navigate]);

  useEffect(() => {
    readFromStorage();
    const onSync = () => readFromStorage();
    window.addEventListener('auth-change', onSync);
    window.addEventListener('storage', onSync);
    return () => {
      window.removeEventListener('auth-change', onSync);
      window.removeEventListener('storage', onSync);
    };
  }, [readFromStorage, location]);

  const avatarKey = ageBand && gender ? `${ageBand}${gender}` : 'default';
  const avatarSrc = useMemo(() => avatarMap[avatarKey] || avatarDefault, [avatarKey]);

  return (
    <div className={styles.stage}>
      <div className={styles.canvas}>
        {/* 배경 레이어 */}
        <div className={styles.bgMain} />

        {/* 타이틀 */}
        <div className={styles.title}>나의 정보</div>

        {/* 별칭/나이 라벨 & 값 */}
        <div className={`${styles.label} ${styles.labelNick}`}>별칭</div>
        <div className={`${styles.value} ${styles.valueNick}`}>{nickname || '—'}</div>

        <div className={`${styles.label} ${styles.labelAge}`}>나이</div>
        <div className={`${styles.value} ${styles.valueAge}`}>{ageDisplay}</div>

        {/* 캐릭터 */}
        <img
          className={styles.bigAvatar}
          src={avatarSrc}
          alt="사용자 캐릭터"
          onError={(e) => { e.currentTarget.src = avatarDefault; }}
        />

        {/* 버튼/구분선/탈퇴 */}
        <div className={styles.shareBtn}><div>미션 자랑하기</div></div>
        <div className={`${styles.divider} ${styles.divider1}`} />
        <div className={`${styles.divider} ${styles.divider2}`} />
        <div className={styles.withdraw}>회원 탈퇴하기</div>
      </div>
    </div>
  );
}
