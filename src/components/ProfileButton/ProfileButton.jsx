import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfileButton.module.css';
import profileIcon from '../../assets/profilebutton.png';

export default function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={styles.profileButtonContainer} ref={dropdownRef}>
      <button onClick={toggleMenu} className={styles.profileButton}>
        <img src={profileIcon} alt="Profile" />
      </button>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <Link to="/me" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            나의 정보
          </Link>
          <Link to="/settings" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            설정
          </Link>
        </div>
      )}
    </div>
  );
}
