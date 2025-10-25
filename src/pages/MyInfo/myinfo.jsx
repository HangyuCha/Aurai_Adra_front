import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import styles from './myinfo.module.css';
import BackButton from '../../components/BackButton/BackButton';

import avatar20M from '../../assets/20M.png';
import avatar20F from '../../assets/20F.png';
import avatar30M from '../../assets/30M.png';
import avatar30F from '../../assets/30F.png';
import avatar40M from '../../assets/40M.png';
import avatar40F from '../../assets/40F.png';
import avatar50M from '../../assets/50M.png';
import avatar50F from '../../assets/50F.png';
import avatar60M from '../../assets/60M.png';
import avatar60F from '../../assets/60F.png';
import avatar70M from '../../assets/70M.png';
import avatar70F from '../../assets/70F.png';
import avatar80M from '../../assets/80M.png';
import avatar80F from '../../assets/80F.png';
import avatarDefault from '../../assets/default.png';

const avatarMap = {
  '20M': avatar20M, '20F': avatar20F,
  '30M': avatar30M, '30F': avatar30F,
  '40M': avatar40M, '40F': avatar40F,
  '50M': avatar50M, '50F': avatar50F,
  '60M': avatar60M, '60F': avatar60F,
  '70M': avatar70M, '70F': avatar70F,
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
  if (['m','male','남','남성','남자'].includes(g)) return 'M';
  if (['f','female','여','여성','여자'].includes(g)) return 'F';
  return '';
}

export default function MyInfoPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [ageDisplay, setAgeDisplay] = useState('—');
  const [ageBand, setAgeBand] = useState('');
  const [gender, setGender] = useState('');
  const [learningAge, setLearningAge] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Intro 팝업 상태
  const [showIntro, setShowIntro] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  // 나이 변화 팝업 상태/데이터
  const [showHistory, setShowHistory] = useState(false);
  const [ageHistory, setAgeHistory] = useState([]);
  // 선택된 연령대(10·20···80)
  const [selectedDecade, setSelectedDecade] = useState(null);

  const readFromStorage = useCallback(() => {
    const nn = localStorage.getItem('nickname') || '';
    const ar = localStorage.getItem('ageRange') || localStorage.getItem('age') || localStorage.getItem('signup_ageRange') || '';
    const gd = localStorage.getItem('gender') || localStorage.getItem('signup_gender') || '';
    const la = localStorage.getItem('learningAge') || '';
    const age = parseAgeRange(ar);
    setNickname(nn);
    setAgeDisplay(age.display);
    setAgeBand(age.band);
    setGender(parseGender(gd));
    // 학습 나이(배움 나이) 값이 없으면 기본적으로 동일 나이 표시
    setLearningAge(la || age.display);
  }, []);
  useEffect(() => { readFromStorage(); }, [readFromStorage]);
  // 첫 진입시 안내 팝업 노출 여부 체크
  useEffect(() => {
    try {
      const key = 'myinfoIntroHideUntil';
      const raw = localStorage.getItem(key);
      const until = raw ? parseInt(raw, 10) : 0;
      const now = Date.now();
      if (!until || Number.isNaN(until) || now >= until) {
        setShowIntro(true);
      } else {
        setShowIntro(false);
      }
    } catch {
      // storage 접근 이슈시 안전하게 보여주기
      setShowIntro(true);
    }
  }, []);

  const endOfTodayTs = useCallback(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return end.getTime();
  }, []);

  const handleCloseIntro = useCallback(() => {
    try {
      if (dontShowToday) {
        localStorage.setItem('myinfoIntroHideUntil', String(endOfTodayTs()));
      }
    } catch {
      // ignore
    }
    setShowIntro(false);
  }, [dontShowToday, endOfTodayTs]);

  // 아바타는 '배움 나이' 기준으로 우선 적용, 없으면 기존 나이대 사용
  const learningParsed = useMemo(() => parseAgeRange(learningAge), [learningAge]);
  const effectiveBand = learningParsed.band || ageBand;
  const avatarKey = effectiveBand && gender ? `${effectiveBand}${gender}` : 'default';
  const avatarSrc = useMemo(() => avatarMap[avatarKey] || avatarDefault, [avatarKey]);

  // "나의 나이" 변화 기록을 로컬에 적립 (중복 방지)
  useEffect(() => {
    if (!ageDisplay || ageDisplay === '—') return;
    try {
      const key = 'ageHistory';
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const last = arr[arr.length - 1];
      if (!last || last.ageDisplay !== ageDisplay) {
        const next = [...arr, { ageDisplay, at: Date.now() }];
        localStorage.setItem(key, JSON.stringify(next));
        setAgeHistory(next);
      } else {
        setAgeHistory(arr);
      }
    } catch {
      // 무시 (파싱 실패 등)
    }
  }, [ageDisplay]);

  // 연령대 숫자 추출 ("40대" → 40)
  const ageDisplayToDecade = useCallback((text) => {
    const p = parseAgeRange(text);
    return p.band ? Number(p.band) : null;
  }, []);

  const openHistory = useCallback(() => {
    if (confirmOpen || showIntro) return; // 다른 모달 열릴 때 방지
    try {
      const raw = localStorage.getItem('ageHistory');
      const arr = raw ? JSON.parse(raw) : [];
      setAgeHistory(arr);
      // 기본 선택: 최근 기록의 연령대
      if (arr.length) {
        const last = arr[arr.length - 1];
        const d = ageDisplayToDecade(last?.ageDisplay);
        if (d) setSelectedDecade(d);
        else setSelectedDecade(80);
      } else {
        setSelectedDecade(80);
      }
    } catch {
      setAgeHistory([]);
      setSelectedDecade(80);
    }
    setShowHistory(true);
  }, [confirmOpen, showIntro, ageDisplayToDecade]);

  const closeHistory = useCallback(() => setShowHistory(false), []);

  // 선택된 연령대의 기록만 보여주기
  const displayedHistory = useMemo(() => {
    if (!selectedDecade) return ageHistory;
    const s = String(selectedDecade);
    return (ageHistory || []).filter(it => parseAgeRange(it.ageDisplay).band === s);
  }, [ageHistory, selectedDecade]);

  const countFor = useCallback((dec) => {
    const s = String(dec);
    return (ageHistory || []).filter(it => parseAgeRange(it.ageDisplay).band === s).length;
  }, [ageHistory]);

  // 서버 삭제(단일 요청)
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      // const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

      // 토큰에 실수로 들어간 양끝의 " 제거
      const raw = localStorage.getItem('accessToken');
      const token = raw?.replace(/^"|"$/g, '');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await api.delete('/users/me', { headers: { Authorization: `Bearer ${token}` } });

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
  <BackButton />
      <div className={styles.canvas}>
        <div className={styles.title}>나의 정보</div>
        <div className={styles.profileCluster}>
          <div
            className={styles.avatarBox}
            onClick={openHistory}
            role="button"
            tabIndex={0}
            onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openHistory(); } }}
            aria-label="성장 일기 열기"
          >
            <img className={styles.bigAvatar} src={avatarSrc} alt="avatar"
                 onError={(e)=>{ e.currentTarget.src = avatarDefault; }} />
            <div className={styles.avatarBadge}>
              <span>{ageDisplay !== '—' ? ageDisplay : '나이 미입력'}</span>
            </div>
            <div className={styles.avatarHint} aria-hidden>눌러서 성장 일기 보기</div>
          </div>
          <section className={styles.infoPanel}>
            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>별칭</div>
                <div className={styles.metaValue}>{nickname || '—'}</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>나의 나이</div>
                <div className={styles.metaValue}>{ageDisplay}</div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>배움 나이</div>
                <div className={styles.metaValue}>{learningAge || '—'}</div>
              </div>
            </div>
            <div className={styles.panelActions}>
              <button className={styles.sharePrimary} onClick={() => navigate('/mission-share')}>미션 자랑하기</button>
              <div className={styles.inlineActions}>
                <button className={styles.withdrawLink} onClick={()=> navigate('/password-change')}>비밀번호 바꾸기</button>
                <span className={styles.vertBar}>|</span>
                <button className={styles.withdrawLink} onClick={() => setConfirmOpen(true)}>회원 탈퇴하기</button>
              </div>
            </div>
          </section>
        </div>
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

      {showIntro && (
        <div className={styles.modalBackdrop} onClick={handleCloseIntro}>
          <div className={styles.modal} onClick={(e)=>e.stopPropagation()}>
            <div className={styles.modalTitle}>안녕하세요.ADRA입니다.</div>
            <div className={styles.modalMsg}>
              {/* 여기에 팝업 내용을 채워주세요. 필요 시 줄바꿈/이미지 가능 */}
              <p>ADRA는 나이를 배움나이와 실제나이로 구분하고있습니다.</p>
              <p>여러 학습을 통해 점점 젊어지는 모습을</p>
              <p>'배움나이'와 '캐릭터'의 모습으로 확인하실수 있습니다.</p>
              
            </div>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e)=>setDontShowToday(e.target.checked)}
              />
              <span>오늘 하루동안 보지않기</span>
            </label>
            <div className={styles.modalActions}>
              <button className={styles.btnNo} onClick={handleCloseIntro}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className={styles.bookBackdrop} onClick={closeHistory}>
          <div className={styles.book} onClick={(e)=>e.stopPropagation()} role="dialog" aria-label="성장 일기">
            <button className={styles.bookClose} onClick={closeHistory} aria-label="닫기">닫기</button>
            <div className={styles.bookSpine} aria-hidden />
            <section className={styles.bookPageLeft}>
              <h2 className={styles.bookTitle}>성장 일기</h2>
              <div className={styles.bookSummary}></div>
              <div className={styles.bookGuide}>
                <p>아래 기록은 '배움 나이'의 변화 과정을 시간 순으로 보여줍니다.</p>
                <p>'배움 나이'란 여러분들의 실제 나이에서 여러가지 학습을 하며,</p>
                <p>점점 젊어지는 모습을 확인할 수 있는 지표입니다.</p>
              </div>
              <div className={styles.bookChoices}>
                {[80,70,60,50,40,30,20,10].map((dec) => {
                  const active = selectedDecade === dec;
                  const cnt = countFor(dec);
                  const disabled = cnt === 0;
                  return (
                    <button
                      key={dec}
                      type="button"
                      className={[
                        styles.choiceItem,
                        active ? styles.choiceActive : '',
                        disabled ? styles.choiceDisabled : ''
                      ].join(' ')}
                      onClick={() => setSelectedDecade(dec)}
                      disabled={disabled}
                    >
                      <span className={styles.choiceLabel}>내가 {dec}대가 되던 때에…</span>
                      <span className={styles.choiceCount}>{cnt}</span>
                    </button>
                  );
                })}
              </div>
              
            </section>
            <section className={styles.bookPageRight}>
              {(!displayedHistory || displayedHistory.length === 0) ? (
                <div className={styles.historyEmpty}>기록이 아직 없습니다.</div>
              ) : (
                <ul className={styles.entryList}>
                  {displayedHistory.map((it, idx) => (
                    <li key={idx} className={styles.entryItem}>
                      <div className={styles.entryDate}>{new Date(it.at).toLocaleString('ko-KR')}</div>
                      <div className={styles.entryText}>나의 나이: <strong>{it.ageDisplay}</strong></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
