import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Start.module.css';
import logo from '../../assets/logo.png';

export default function Start() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className={styles.content}>
      <img src={logo} alt="아드라 로고" className={styles.logo} />
      <button onClick={handleStart} className={styles.startButton}>
        회춘하기
      </button>
    </div>
  );
}
