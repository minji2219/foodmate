import React, { useState } from 'react';
import { QrCode, Users, Plus, Calendar, Target, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { sessionStorage, generateId } from '../utils/storage';
import { Session } from '../types';

interface DashboardProps {
  currentUser: any;
  onNavigate: (page: string, sessionId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onNavigate }) => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    return sessionStorage.getSessions().filter(s => s.createdBy === currentUser.id);
  });

  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const createNewSession = () => {
    const newSession: Session = {
      id: generateId(),
      name: `식사 모임 ${new Date().toLocaleDateString('ko-KR')}`,
      description: '오늘의 메뉴를 함께 정해요!',
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      participants: [],
    };

    sessionStorage.saveSession(newSession);
    setSessions([...sessions, newSession]);
    onNavigate('session', newSession.id);
  };

  const startEditing = (session: Session) => {
    setEditingSession(session.id);
    setEditForm({ name: session.name, description: session.description });
  };

  const saveEdit = (sessionId: string) => {
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        const updatedSession = {
          ...session,
          name: editForm.name,
          description: editForm.description
        };
        sessionStorage.saveSession(updatedSession);
        return updatedSession;
      }
      return session;
    });
    
    setSessions(updatedSessions);
    setEditingSession(null);
  };

  const cancelEdit = () => {
    setEditingSession(null);
    setEditForm({ name: '', description: '' });
  };

  const handleDelete = (sessionId: string) => {
    sessionStorage.deleteSession(sessionId);
    setSessions(sessions.filter(s => s.id !== sessionId));
    setDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* 웰컴 메시지 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-teal-500 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              안녕하세요, {currentUser.name}님! 👋
            </h2>
            <p className="text-gray-600 mt-1">
              모든 팀원이 만족하는 식사 시간을 만들어보세요!
            </p>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">새 그룹 만들기</h3>
              <p className="text-sm text-gray-600">팀원들을 초대해서 메뉴를 정해보세요</p>
            </div>
          </div>
          <button
            onClick={createNewSession}
            className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-105"
          >
            그룹 만들기
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">내 취향 설정</h3>
              <p className="text-sm text-gray-600">좋아하는 음식과 피해야 할 음식을 설정하세요</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('preferences')}
            className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
          >
            설정하기
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">만든 그룹</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{sessions.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">총 참가자</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessions.reduce((total, session) => total + session.participants.length, 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">활성 그룹</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessions.filter(s => s.participants.length > 0).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 최근 세션 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 만든 그룹</h3>
        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {editingSession === session.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        onClick={() => saveEdit(session.id)}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : deleteConfirm === session.id ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">정말로 이 그룹을 삭제하시겠습니까?</p>
                      <p className="text-red-600 text-sm mt-1">
                        "{session.name}" 그룹과 모든 참가자 정보가 영구적으로 삭제됩니다.
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{session.name}</h4>
                          <button
                            onClick={() => startEditing(session)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(session.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(session.createdAt)} • {session.participants.length}명 참여
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('session', session.id)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      관리하기
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 만든 그룹이 없어요</p>
            <p className="text-sm text-gray-400 mt-1">
              첫 번째 그룹을 만들어서 팀원들과 함께해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;