import React, { useState, useEffect } from 'react';
import { User } from './types';
import { userStorage } from './utils/storage';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import PreferencesForm from './components/PreferencesForm';
import SessionManager from './components/SessionManager';
import JoinSession from './components/JoinSession';
import ParticipantGroups from './components/ParticipantGroups';

type Page = 'login' | 'dashboard' | 'preferences' | 'session' | 'join' | 'participant-groups';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // URL에서 세션 참가 정보 확인
    const urlParams = new URLSearchParams(window.location.search);
    const joinSessionId = urlParams.get('join');
    
    if (joinSessionId) {
      setCurrentSessionId(joinSessionId);
      setCurrentPage('join');
    }

    // 로그인 상태 확인
    const savedUser = userStorage.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      if (!joinSessionId) {
        setCurrentPage('dashboard');
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    userStorage.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentPage('login');
    setCurrentSessionId(null);
  };

  const handleNavigate = (page: Page, sessionId?: string) => {
    setCurrentPage(page);
    if (sessionId) {
      setCurrentSessionId(sessionId);
    }
  };

  const handlePreferencesSave = () => {
    // 프로필 저장 후 대시보드로 이동
    setCurrentPage('dashboard');
  };

  const handleJoinComplete = () => {
    // 참가 완료 후 대시보드로 이동 (로그인된 사용자) 또는 로그인 페이지로 이동
    if (currentUser) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
    // URL 파라미터 제거
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 세션 참가 페이지 (로그인 없이도 접근 가능)
  if (currentPage === 'join' && currentSessionId) {
    return (
      <Layout
        currentUser={currentUser}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      >
        <JoinSession
          sessionId={currentSessionId}
          currentUser={currentUser}
          onJoinComplete={handleJoinComplete}
        />
      </Layout>
    );
  }

  // 로그인하지 않은 경우
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // 로그인된 사용자 인터페이스
  return (
    <Layout
      currentUser={currentUser}
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {currentPage === 'dashboard' && (
        <Dashboard
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentPage === 'preferences' && (
        <PreferencesForm
          currentUser={currentUser}
          onSave={handlePreferencesSave}
        />
      )}
      
      {currentPage === 'participant-groups' && (
        <ParticipantGroups
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentPage === 'session' && currentSessionId && (
        <SessionManager
          sessionId={currentSessionId}
          onNavigate={handleNavigate}
        />
      )}
    </Layout>
  );
}

export default App;