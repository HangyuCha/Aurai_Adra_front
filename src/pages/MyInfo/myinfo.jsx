import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './myinfo.module.css';

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
};

export default function MyInfoPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [ageDisplay, setAgeDisplay] = useState('—');
  const [ageBand, setAgeBand] = useState('');
  const [gender, setGender] = useState('');

  const readFromStorage = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const nn = localStorage.getItem('nickname') || '';
    const ar =
      localStorage.getItem('ageRange') ||
      localStorage.getItem('age') ||
      localStorage.getItem('signup_ageRange') || '';
    const gd =
      localStorage.getItem('gender') ||
      localStorage.getItem('signup_gender') || '';

    const age = parseAgeRange(ar);
    setNickname(nn);
    setAgeDisplay(age.display);
    setAgeBand(age.band);
    setGender(parseGender(gd));
  }, []);

  useEffect(() => { readFromStorage(); }, [readFromStorage]);

  const avatarKey = ageBand && gender ? `${ageBand}${gender}` : 'default';
  const avatarSrc = useMemo(() => avatarMap[avatarKey] || avatarDefault, [avatarKey]);

  const handleWithdraw = () => {
    // TODO: 실제 탈퇴 로직 연결
    alert('회원 탈퇴하기 클릭됨');
  };

  return (
    <div className={styles.stage}>
      <div className={styles.canvas}>
        <div className={styles.bgMain} />
        {/* 회색 상단 바 숨김: <div className={styles.bgTopBar} /> 생략 */}

        <div className={styles.title}>나의 정보</div>

        {/* 왼쪽 아바타 */}
        <img className={styles.bigAvatar} src={avatarSrc} alt="avatar"
             onError={(e)=>{ e.currentTarget.src = avatarDefault; }} />

        {/* 오른쪽 정보 패널: 별칭 → 나이 → 버튼(나이 밑) */}
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
            <button
              className={styles.sharePrimary}
              onClick={() => navigate('/mission-share')}
            >
              미션 자랑하기
            </button>
            <button className={styles.withdrawLink} onClick={handleWithdraw}>
              회원 탈퇴하기
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
