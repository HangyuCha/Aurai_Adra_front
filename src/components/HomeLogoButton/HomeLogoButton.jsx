import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomeLogoButton.module.css';
import logo from '../../assets/logo.png';

export default function HomeLogoButton({ size=48, to='/home' }){
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={styles.logoBtn}
      style={{ width: size, height: size, '--logo-size': `${size}px` }}
      onClick={() => navigate(to, { replace: false })}
      aria-label="홈으로 이동"
    >
      <img src={logo} alt="홈" />
    </button>
  );
}
