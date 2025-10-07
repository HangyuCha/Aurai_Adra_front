import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ProfileButton.module.css';
import profileIcon from '../../assets/profilebutton.png';

export default function ProfileButton() {
  // isOpen: 시각적 '열림' 상태, isVisible: DOM 마운트 제어 (닫힘 애니메이션 완료 후 언마운트)
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const openMenu = () => {
    setIsVisible(true);
    // 다음 프레임에 open 적용하여 트랜지션 발동
    requestAnimationFrame(() => setIsOpen(true));
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const toggleMenu = () => {
    if (isOpen) closeMenu(); else openMenu();
  };

  const handleLogout = () => {
    // 토큰 제거 후 초기 진입 플로우 (loading -> start -> login) 재실행
    localStorage.removeItem('accessToken');
    closeMenu();
    navigate('/loading', { replace: true });
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeMenu();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={styles.profileButtonContainer} ref={dropdownRef}>
      <button onClick={toggleMenu} className={styles.profileButton} aria-haspopup="true" aria-expanded={isOpen}>
        <img src={profileIcon} alt="Profile" />
      </button>
      {isVisible && (
        <div
          className={[
            styles.dropdownMenu,
            isOpen ? styles.open : styles.closing,
          ].join(' ')}
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && !isOpen) {
              // 닫힘 애니메이션 끝난 후 언마운트
              setIsVisible(false);
            }
          }}
        >
          <Link to="/me" className={styles.dropdownItem} onClick={closeMenu}>나의 정보</Link>
          <Link to="/settings" className={styles.dropdownItem} onClick={closeMenu}>설정</Link>
          <Link to="/suggestion" className={styles.dropdownItem} onClick={closeMenu}>건의사항</Link>
          <button onClick={handleLogout} className={styles.dropdownItem}>로그아웃</button>
        </div>
      )}
    </div>
  );
}
