import React, { useState, useEffect } from 'react';
import { QrCode, Share2, Users, RefreshCw, Copy, Check, Utensils, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { sessionStorage } from '../utils/storage';
import { Session, Participant } from '../types';
import { getRecommendedMenu, getAvailableMenuCount } from '../utils/menuRecommendation';
import GroupRestrictions from './GroupRestrictions';

interface SessionManagerProps {
  sessionId: string;
  onNavigate: (page: string) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ sessionId, onNavigate }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [recommendedMenu, setRecommendedMenu] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'restrictions'>('overview');

  useEffect(() => {
    const loadSession = () => {
      const foundSession = sessionStorage.findSession(sessionId);
      if (foundSession) {
        setSession(foundSession);
        // QR 코드 URL 생성 (현재 URL + 세션 ID)
        const baseUrl = window.location.origin + window.location.pathname;
        const joinUrl = `${baseUrl}?join=${sessionId}`;
        setQrCodeUrl(joinUrl);
        
        if (foundSession.recommendedMenu) {
          setRecommendedMenu(foundSession.recommendedMenu);
        }
      }
    };

    loadSession();
    
    // 주기적으로 세션 업데이트 확인
    const interval = setInterval(loadSession, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const generateRecommendation = () => {
    if (!session) return;
    
    const menu = getRecommendedMenu(session.participants);
    if (menu) {
      const updatedSession = { ...session, recommendedMenu: menu };
      sessionStorage.saveSession(updatedSession);
      setSession(updatedSession);
      setRecommendedMenu(menu);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  const startEditing = () => {
    if (session) {
      setEditForm({ name: session.name, description: session.description });
      setIsEditing(true);
    }
  };

  const saveEdit = () => {
    if (!session) return;
    
    const updatedSession = {
      ...session,
      name: editForm.name,
      description: editForm.description
    };
    
    sessionStorage.saveSession(updatedSession);
    setSession(updatedSession);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: '', description: '' });
  };

  const availableMenuCount = session ? getAvailableMenuCount(session.participants) : 0;

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">세션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 세션 정보 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="그룹명을 입력하세요"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="그룹 설명을 입력하세요"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={saveEdit}
                    className="flex items-center space-x-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center space-x-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>취소</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-gray-900">{session.name}</h2>
                  <button
                    onClick={startEditing}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">{session.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(session.createdAt).toLocaleDateString('ko-KR')}에 생성됨
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {session.participants.length}
            </span>
            <span className="text-gray-600">명</span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-orange-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab('restrictions')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'restrictions'
                ? 'bg-white text-orange-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            제한사항 종합
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* 참가자 목록 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">참가자</h3>
              {session.participants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {session.participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-medium text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {participant.name || `참가자 ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.isRegistered ? '등록된 사용자' : '일회성 참가'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        제한: {participant.preferences.allergies.length + participant.preferences.dislikes.length}개
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">아직 참가자가 없습니다</p>
              )}
            </div>
          </div>
        ) : (
          <GroupRestrictions sessionId={sessionId} />
        )}
      </div>

      {/* QR 코드 및 링크 공유 */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">팀원 초대하기</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR 코드 */}
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">QR 코드</p>
                  <p className="text-xs text-gray-500">실제 구현 시 QR 코드 생성</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                QR 코드를 스캔하여 참가할 수 있습니다
              </p>
            </div>

            {/* 링크 공유 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  참가 링크
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={qrCodeUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(qrCodeUrl)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(qrCodeUrl)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>링크 복사</span>
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💡 <strong>사용 방법:</strong> 팀원들에게 링크를 공유하거나 QR 코드를 보여주세요. 
                  앱에 가입하지 않아도 일회성으로 참가할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메뉴 추천 */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">메뉴 추천</h3>
            <div className="text-sm text-gray-600">
              사용 가능한 메뉴: <span className="font-medium text-teal-600">{availableMenuCount}개</span>
            </div>
          </div>

          {session.participants.length > 0 ? (
            <div className="space-y-4">
              {session.recommendedMenu ? (
                <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-orange-400 rounded-full flex items-center justify-center">
                      <Utensils className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900">
                        {session.recommendedMenu.name}
                      </h4>
                      <p className="text-gray-600 mt-1">
                        {session.recommendedMenu.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm bg-teal-100 text-teal-700 px-2 py-1 rounded">
                          {session.recommendedMenu.category}
                        </span>
                        <span className="text-sm font-medium text-orange-600">
                          {session.recommendedMenu.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">아직 메뉴가 추천되지 않았습니다</p>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={generateRecommendation}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>메뉴 추천받기</span>
                </button>
              </div>

              {availableMenuCount === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    ⚠️ 현재 설정으로는 추천할 수 있는 메뉴가 없습니다. 
                    참가자들의 제한사항을 다시 확인해보세요.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                팀원들이 참가한 후 메뉴를 추천받을 수 있습니다
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionManager;