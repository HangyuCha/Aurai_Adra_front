// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import StartPage from './pages/Start/Start.jsx';
import LoginPage from './pages/Login/Login.jsx';
import KakaoCallback from './pages/Login/KakaoCallback.jsx';
import LoadingPage from './pages/Loading/loading.jsx';
import SignupPage from './pages/Signup/Signup.jsx';
import SignupExtraPage from './pages/Signup/SignupStep2.jsx'; // 2단계
import FindInfoPage from './pages/Find/Findinfo.jsx';
import FindInfoResultPage from './pages/Find/FindInfoResult.jsx'; // ✅ Step2
import Home from './pages/Home/Home.jsx';
import PostLogin from './pages/PostLogin/PostLogin.jsx';
import SettingsPage from './pages/Settings/setting.jsx';
import SuggestionPage from './pages/Suggestion/Suggestion.jsx';
import WritePage from './pages/Write/Write.jsx';
import SuggestionDetailPage from './pages/SuggestionDetail/SuggestionDetail.jsx';
import MyInfoPage from './pages/MyInfo/myinfo.jsx';
import PasswordChangePage from './pages/PasswordChange/PasswordChange.jsx';
import MissionShare from './pages/MissionShare/missionshare.jsx'; // 추가
import SmsLearn from './pages/Sms/SmsLearn.jsx';
import SmsPractice from './pages/Sms/SmsPractice.jsx';
import PracticeLesson from './pages/Practice/PracticeLesson.jsx';
import SmsMsendLesson from './pages/Sms/SmsMsendLesson.jsx';
import SmsMsendPractice from './pages/Sms/SmsMsendPractice.jsx';
import SmsMphotoLesson from './pages/Sms/SmsMphotoLesson.jsx';
import SmsMphotoPractice from './pages/Sms/SmsMphotoPractice.jsx';
import SmsMdeleteLesson from './pages/Sms/SmsMdeleteLesson.jsx';
import SmsMdeletePractice from './pages/Sms/SmsMdeletePractice.jsx';
import SmsMdeliverLesson from './pages/Sms/SmsMdeliverLesson.jsx';
import SmsMsearchLesson from './pages/Sms/SmsMsearchLesson.jsx';
import CallCallingLesson from './pages/Call/CallCallingLesson.jsx';
import CallCallingPractice from './pages/Call/CallCallingPractice.jsx';
import CallSavePractice from './pages/Call/CallSavePractice.jsx';
import CallSaveLesson from './pages/Call/CallSaveLesson.jsx';
import CallFixLesson from './pages/Call/CallFixLesson.jsx';
import CallFixPractice from './pages/Call/CallFixPractice.jsx';
import CallFaceLesson from './pages/Call/CallFaceLesson.jsx';
import CallFacePractice from './pages/Call/CallFacePractice.jsx';
import GptWhatLesson from './pages/Gpt/GptWhatLesson.jsx';
import GptAskLesson from './pages/Gpt/GptAskLesson.jsx';
import GptFollowLesson from './pages/Gpt/GptFollowLesson.jsx';
import GptSafetyLesson from './pages/Gpt/GptSafetyLesson.jsx';
import GptLimitsLesson from './pages/Gpt/GptLimitsLesson.jsx';
import KakaoUiLesson from './pages/Kakao/KakaoUiLesson.jsx';
import KakaoUiPractice from './pages/Kakao/KakaoUiPractice.jsx';
import KakaoAddBYldPractice from './pages/Kakao/KakaoAddBYldPractice.jsx';
import KakaoAddByIdPractice from './pages/Kakao/KakaoAddByIdPractice.jsx';
import KakaoAddByPhonePractice from './pages/Kakao/KakaoAddByPhonePractice.jsx';
import KakaoFriendLesson from './pages/Kakao/KakaoFriendLesson.jsx';
import KakaoFriendNumLesson from './pages/Kakao/KakaoFriendNumLesson.jsx';
import KakaoRoomLesson from './pages/Kakao/KakaoRoomLesson.jsx';
import KakaoMediaLesson from './pages/Kakao/KakaoMediaLesson.jsx';
import KakaoMediaPractice from './pages/Kakao/KakaoMediaPractice.jsx';
import CallLearn from './pages/Call/CallLearn.jsx';
import CallPractice from './pages/Call/CallPractice.jsx';
import GptLearn from './pages/Gpt/GptLearn.jsx';
import GptPractice from './pages/Gpt/GptPractice.jsx';
import KakaoLearn from './pages/Kakao/KakaoLearn.jsx';
import KakaoPractice from './pages/Kakao/KakaoPractice.jsx';
import AgePreview from './pages/Age/AgePreview.jsx';
import { markAppProgress } from './lib/appProgressApi.js';

// 인증이 필요한 경로 감싸기
function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// 진입: 무조건 로그인 화면 (처음 로딩 스플래시 경험 안 했으면 스플래시 -> 로그인)
function EntryRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/home', { replace: true });
    } else {
      navigate('/loading', { replace: true });
    }
  }, [navigate]);
  return null;
}

export default function App() {
  // Global completion capture: when any Learn page's "완료" button is pressed, mark per-session done
  useEffect(() => {
    function inferFromPath(pathname){
      try{
        const parts = (pathname || '/').split('/').filter(Boolean);
        const appId = parts[0] || null;
        const section = parts[1] || null;
        if(section !== 'learn') return null;
        const rest = parts.slice(2).join('/');
        if(!appId || !rest) return null;
        if(appId === 'kakao'){
          if(rest === 'friend') return { appId, sessionKeys: ['addById'] };
          if(rest === 'friend/num') return { appId, sessionKeys: ['addByPhone'] };
          if(rest === 'room') return { appId, sessionKeys: ['inviteRoom', 'leaveGroup'] };
          return { appId, sessionKeys: [rest] };
        }
        return { appId, sessionKeys: [rest] };
      } catch { return null; }
    }
    async function onPointerDown(e){
      try{
        const btn = e.target.closest('button');
        if(!btn) return;
        const txt = (btn.textContent || '').trim();
        if(txt !== '완료') return;
        const { pathname } = window.location;
        const info = inferFromPath(pathname);
        if(!info) return;
        const { appId, sessionKeys } = info;
        if(!appId || !Array.isArray(sessionKeys)) return;
        for(const key of sessionKeys){
          try { await markAppProgress(appId, 'learn', key, null); } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    }
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, []);
  return (
    <Routes>
      <Route path="/" element={<EntryRoute />} />

      {/* ✅ 레이아웃 하위는 '상대 경로'로 */}
      <Route element={<Layout />}>
        <Route path="loading" element={<LoadingPage />} />
        <Route path="start" element={<StartPage />} />
        <Route
          path="intro" /* 로그인 직후 노출될 새 페이지 */
          element={
            <PrivateRoute>
              <PostLogin />
            </PrivateRoute>
          }
        />
        <Route
          path="home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
  <Route path="login/kakao/callback" element={<KakaoCallback />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="signup/extra" element={<SignupExtraPage />} />
        {/* 레이아웃 영역 내에서만 잡히는 catch-all */}
        <Route path="find" element={<FindInfoPage />} />
        {/* ✅ 정보 찾기 */}
        <Route path="find/step2" element={<FindInfoResultPage />} />
        {/* ✅ 추가 */}
        <Route path="settings" element={<SettingsPage />} />
        {/* ✅ 설정 */}
        <Route path="suggestion" element={<SuggestionPage />} />
        <Route path="suggestion/write" element={<WritePage />} />
        <Route path="suggestion/:id" element={<SuggestionDetailPage />} />
  {/* 상대 경로로 수정하여 Layout (BackButton, ProfileButton) 적용 */}
  <Route path="me" element={<MyInfoPage />} />
  <Route path="mission-share" element={<MissionShare />} />
  <Route path="sms/learn" element={<SmsLearn />} />
  <Route path="sms/learn/msend" element={<SmsMsendLesson />} />
  <Route path="sms/learn/mphoto" element={<SmsMphotoLesson />} />
  <Route path="sms/learn/mdelete" element={<SmsMdeleteLesson />} />
  <Route path="sms/practice/mdelete" element={<SmsMdeletePractice />} />
  <Route path="sms/practice/mphoto" element={<SmsMphotoPractice />} />
  <Route path="sms/learn/mdeliver" element={<SmsMdeliverLesson />} />
  <Route path="sms/learn/msearch" element={<SmsMsearchLesson />} />
  <Route path="call/learn/calling" element={<CallCallingLesson />} />
  <Route path="call/learn/save" element={<CallSaveLesson />} />
  <Route path="call/learn/fix" element={<CallFixLesson />} />
  <Route path="call/practice/fix" element={<CallFixPractice />} />
  <Route path="call/learn/face" element={<CallFaceLesson />} />
  <Route path="call/practice/face" element={<CallFacePractice />} />
  {/* favorite 레슨 제거 */}
  <Route path="gpt/learn/what" element={<GptWhatLesson />} />
  <Route path="gpt/learn/ask" element={<GptAskLesson />} />
  <Route path="gpt/learn/follow" element={<GptFollowLesson />} />
  <Route path="gpt/learn/safety" element={<GptSafetyLesson />} />
  <Route path="gpt/learn/limits" element={<GptLimitsLesson />} />
  <Route path="kakao/learn/ui" element={<KakaoUiLesson />} />
  <Route path="kakao/learn/friend" element={<KakaoFriendLesson />} />
  <Route path="kakao/learn/friend/num" element={<KakaoFriendNumLesson />} />
  <Route path="kakao/learn/room" element={<KakaoRoomLesson />} />
  <Route path="kakao/learn/media" element={<KakaoMediaLesson />} />
  <Route path="kakao/practice/media" element={<KakaoMediaPractice />} />
  <Route path="sms/practice" element={<SmsPractice />} />
  <Route path="sms/practice/msend" element={<SmsMsendPractice />} />
  <Route path="sms/practice/:topic" element={<PracticeLesson />} />
  <Route path="call/learn" element={<CallLearn />} />
  <Route path="call/practice/calling" element={<CallCallingPractice />} />
  <Route path="call/practice/save" element={<CallSavePractice />} />
  <Route path="call/practice" element={<CallPractice />} />
  <Route path="call/practice/:topic" element={<PracticeLesson />} />
  <Route path="gpt/learn" element={<GptLearn />} />
  <Route path="gpt/practice" element={<GptPractice />} />
  <Route path="gpt/practice/:topic" element={<PracticeLesson />} />
  <Route path="kakao/learn" element={<KakaoLearn />} />
  <Route path="kakao/practice" element={<KakaoPractice />} />
  <Route path="kakao/practice/ui" element={<KakaoUiPractice />} />
  <Route path="kakao/practice/addBYld" element={<KakaoAddBYldPractice />} />
  <Route path="kakao/practice/addById" element={<KakaoAddByIdPractice />} />
  <Route path="kakao/practice/addByPhone" element={<KakaoAddByPhonePractice />} />
  <Route path="kakao/practice/:topic" element={<PracticeLesson />} />
  <Route path="avatar/aging" element={<PrivateRoute><AgePreview /></PrivateRoute>} />
  <Route path="password-change" element={<PasswordChangePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

// 이중연 시도

