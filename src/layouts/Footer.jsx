// src/layouts/Footer.jsx
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand font-jua">
          <img src={logo} alt="Aurai logo" className="footer-logo" />
          <span>© {new Date().getFullYear()} Aurai_ADRA App · Team <strong>Aurai</strong></span>
        </div>

        <div className="footer-mails">
          <a href="mailto:abc@naver.com">abc@naver.com</a>
          <a href="mailto:cde@naver.com">cde@naver.com</a>
          <a href="mailto:ddwq@naver.com">ddwq@naver.com</a>
          <a href="mailto:2ewd@naver.com">2ewd@naver.com</a>
        </div>
      </div>
    </footer>
  );
}
