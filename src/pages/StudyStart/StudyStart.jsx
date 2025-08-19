import React from 'react';

// 추후 라우팅 경로 확정 시 onClick 내 navigate 로직 추가 (TODO)
export default function StudyStart() {
  return (
    <div className="study-start-page">
      {/* 타이틀 영역 */}
      <div className="study-title-row">
        <div className="phone-icon" aria-hidden="true">
          {/* 전화 아이콘 SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
            <g filter="url(#filter0_d_185_1293)">
              <path d="M0 13.1556C0 8.55068 0 6.24824 0.896169 4.48941C1.68446 2.9423 2.9423 1.68446 4.48941 0.896169C6.24824 0 8.55068 0 13.1556 0H23.8444C28.4493 0 30.7518 0 32.5106 0.896169C34.0577 1.68446 35.3155 2.9423 36.1038 4.48941C37 6.24824 37 8.55068 37 13.1556V23.8444C37 28.4493 37 30.7518 36.1038 32.5106C35.3155 34.0577 34.0577 35.3155 32.5106 36.1038C30.7518 37 28.4493 37 23.8444 37H13.1556C8.55068 37 6.24824 37 4.48941 36.1038C2.9423 35.3155 1.68446 34.0577 0.896169 32.5106C0 30.7518 0 28.4493 0 23.8444V13.1556Z" fill="url(#paint0_linear_185_1293)"/>
              <path d="M7.45691 13.4832C5.9302 9.37691 8.56223 7.55572 10.4637 7.02649C10.7862 6.93673 11.1199 7.08206 11.3113 7.35669L14.7719 12.3219C14.9967 12.6444 14.9723 13.0751 14.7403 13.3925C13.9488 14.4749 13.6632 15.3934 13.5607 16.1084C13.4758 16.7001 13.6869 17.288 14.0422 17.7688C16.7629 21.4504 19.7063 24.2191 21.1512 24.2868C22.2102 24.3365 23.5032 23.5158 24.2083 22.9976C24.5232 22.7662 24.9539 22.7389 25.279 22.9557L30.3435 26.332C30.6216 26.5174 30.7728 26.8495 30.7017 27.1761C29.7775 31.4267 25.7812 30.9751 23.8251 30.1765C14.6473 25.9128 9.55261 19.1199 7.45691 13.4832Z" fill="#FEFEFE"/>
            </g>
            <defs>
              <filter id="filter0_d_185_1293" x="0" y="0" width="45" height="45" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="4" dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_185_1293"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_185_1293" result="shape"/>
              </filter>
              <linearGradient id="paint0_linear_185_1293" x1="18.5" y1="0" x2="18.5" y2="37" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5AF575"/>
                <stop offset="1" stopColor="#08BD2B"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="study-title font-jua">전화</h1>
      </div>

      {/* 버튼 영역 */}
      <div className="study-buttons">
        <button className="study-btn font-jua" type="button">배우기</button>
        <button className="study-btn font-jua" type="button">연습하기</button>
      </div>

      {/* Page 전용 스타일 (필요시 index.css로 이전 가능) */}
      <style>{`
        .study-start-page{ width:100%; max-width:1440px; margin:0 auto; position:relative; }
        .study-title-row{ display:flex; align-items:center; gap:12px; margin-top:8px; }
        .phone-icon{ width:45px; height:45px; display:flex; align-items:center; justify-content:center; }
        .study-title{ margin:0; font-size:40px; font-weight:400; line-height:40px; letter-spacing:-0.23px; color:#000; text-shadow:0 4px 4px rgba(0,0,0,.25); }
        .study-buttons{ width:100%; display:flex; flex-direction:column; align-items:center; gap:96px; margin-top:140px; }
        .study-btn{ width:771px; max-width:90%; height:109px; flex-shrink:0; border:0; border-radius:10px; background:#FFF; box-shadow:4px 4px 4px rgba(0,0,0,0.25); font-size:48px; line-height:1; cursor:pointer; transition: transform .12s ease, box-shadow .2s ease; }
        .study-btn:hover{ transform:translateY(-2px); }
        .study-btn:active{ transform:translateY(0); box-shadow:2px 2px 4px rgba(0,0,0,0.25); }
        @media (max-width:860px){ .study-buttons{ gap:56px; margin-top:100px; } .study-btn{ font-size:40px; height:96px; } .study-title{ font-size:34px; } }
        @media (max-width:520px){ .study-btn{ font-size:34px; height:88px; } .study-title{ font-size:30px; } }
      `}</style>
    </div>
  );
}
