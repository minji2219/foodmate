import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { sessionStorage, generateId } from '../utils/storage';
import { Session, Participant, FoodPreferences } from '../types';
import PreferencesForm from './PreferencesForm';

interface JoinSessionProps {
  sessionId: string;
  currentUser: any;
  onJoinComplete: () => void;
}

const JoinSession: React.FC<JoinSessionProps> = ({ sessionId, currentUser, onJoinComplete }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<'loading' | 'info' | 'preferences' | 'complete'>('loading');
  const [participantName, setParticipantName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSession = () => {
      const foundSession = sessionStorage.findSession(sessionId);
      if (foundSession) {
        setSession(foundSession);
        
        // 이미 참가한 사용자인지 확인
        const alreadyJoined = foundSession.participants.some(p => 
          (currentUser && p.id === currentUser.id) || 
          (!currentUser && p.name === participantName)
        );
        
        if (alreadyJoined) {
          setStep('complete');
        } else {
          setStep('info');
        }
      } else {
        setError('존재하지 않는 그룹입니다.');
        setStep('info');
      }
    };

    loadSession();
  }, [sessionId, currentUser, participantName]);

  const handleJoin = () => {
    if (!session) return;

    if (!currentUser && !participantName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    // 중복 참가 확인
    const alreadyJoined = session.participants.some(p => 
      (currentUser && p.id === currentUser.id) || 
      (!currentUser && p.name === participantName.trim())
    );

    if (alreadyJoined) {
      setError('이미 참가한 사용자입니다.');
      return;
    }

    setError('');
    setStep('preferences');
  };

  const handlePreferencesSubmit = (preferences: FoodPreferences) => {
    if (!session) return;

    const newParticipant: Participant = {
      id: currentUser ? currentUser.id : generateId(),
      name: currentUser ? currentUser.name : participantName,
      preferences,
      isRegistered: !!currentUser,
    };

    const updatedSession = {
      ...session,
      participants: [...session.participants, newParticipant],
    };

    sessionStorage.saveSession(updatedSession);
    setSession(updatedSession);
    setStep('complete');
  };

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">그룹 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={onJoinComplete}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">참가 완료!</h3>
          <p className="text-green-600 mb-4">
            성공적으로 "{session?.name}" 그룹에 참가했습니다. 메뉴 추천을 기다려주세요.
          </p>
          <button
            onClick={onJoinComplete}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preferences') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            "{session?.name}" 그룹 참가
          </h2>
          <p className="text-gray-600">
            음식 취향을 설정하여 그룹에 참가해주세요.
          </p>
        </div>
        <PreferencesForm
          currentUser={currentUser}
          onSave={handlePreferencesSubmit}
          isTemporary={true}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* 세션 정보 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            그룹 참가하기
          </h2>
          <p className="text-gray-600 mt-2">
            "{session?.name}"에 참가하시겠습니까?
          </p>
        </div>

        {/* 세션 상세 정보 */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">그룹명</span>
            <span className="text-sm text-gray-600 text-right max-w-48 truncate">
              {session?.name}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">설명</span>
            <span className="text-sm text-gray-600 text-right max-w-48 truncate">
              {session?.description}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">생성일</span>
            <span className="text-sm text-gray-600">
              {session && new Date(session.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">현재 참가자</span>
            <span className="text-sm text-gray-600">
              {session?.participants.length || 0}명
            </span>
          </div>
        </div>

        {/* 참가자 정보 입력 */}
        {!currentUser && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              참가자 이름
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        )}

        {currentUser && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{currentUser.name}</strong>님으로 참가합니다. 
              저장된 음식 취향 정보를 사용하거나 새로 설정할 수 있습니다.
            </p>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">다음 단계</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            참가 후 음식 취향을 설정하게 됩니다. 
            {currentUser ? ' 기존 설정을 사용하거나 이번 모임용으로 새로 설정할 수 있습니다.' : ' 설정한 정보는 이번 모임에서만 사용됩니다.'}
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 버튼 */}
        <button
          onClick={handleJoin}
          disabled={!currentUser && !participantName.trim()}
          className="w-full bg-gradient-to-r from-orange-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          참가하기
        </button>
      </div>
    </div>
  );
};

export default JoinSession;