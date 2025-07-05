import React, { useState, useEffect } from 'react';
import { Users, Calendar, Eye, Clock, AlertCircle } from 'lucide-react';
import { sessionStorage } from '../utils/storage';
import { Session } from '../types';

interface ParticipantGroupsProps {
  currentUser: any;
  onNavigate: (page: string, sessionId?: string) => void;
}

const ParticipantGroups: React.FC<ParticipantGroupsProps> = ({ currentUser, onNavigate }) => {
  const [participatedSessions, setParticipatedSessions] = useState<Session[]>([]);

  useEffect(() => {
    const loadParticipatedSessions = () => {
      const allSessions = sessionStorage.getSessions();
      const userSessions = allSessions.filter(session => 
        session.participants.some(participant => 
          currentUser && participant.id === currentUser.id
        )
      );
      setParticipatedSessions(userSessions);
    };

    loadParticipatedSessions();
  }, [currentUser]);

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
      {/* 헤더 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">참여한 그룹</h2>
            <p className="text-gray-600 mt-1">
              내가 참여한 모든 그룹을 확인할 수 있어요
            </p>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">참여한 그룹</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{participatedSessions.length}</p>
            </div>
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">최근 참여</h3>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {participatedSessions.length > 0 
                  ? formatDate(participatedSessions[participatedSessions.length - 1].createdAt)
                  : '참여 기록 없음'
                }
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 참여한 그룹 목록 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">참여한 그룹 목록</h3>
        {participatedSessions.length > 0 ? (
          <div className="space-y-4">
            {participatedSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{session.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-xs text-gray-500">
                          {formatDate(session.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.participants.length}명 참여
                        </p>
                        {session.recommendedMenu && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            메뉴 추천됨
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('session', session.id)}
                    className="flex items-center space-x-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>보기</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 참여한 그룹이 없어요</p>
            <p className="text-sm text-gray-400 mt-1">
              다른 사람이 만든 그룹에 참여해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantGroups;