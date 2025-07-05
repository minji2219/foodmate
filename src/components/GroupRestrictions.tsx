import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, X, Search, Filter } from 'lucide-react';
import { sessionStorage } from '../utils/storage';
import { Session, Participant } from '../types';
import { popularMenus, allergyIngredients, dietaryOptions } from '../data/menuData';

interface GroupRestrictionsProps {
  sessionId: string;
}

const GroupRestrictions: React.FC<GroupRestrictionsProps> = ({ sessionId }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'allergies' | 'dislikes' | 'dietary'>('all');

  useEffect(() => {
    const loadSession = () => {
      const foundSession = sessionStorage.findSession(sessionId);
      if (foundSession) {
        setSession(foundSession);
      }
    };

    loadSession();
    const interval = setInterval(loadSession, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">그룹 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 모든 참가자의 제한사항 수집
  const allRestrictions = {
    allergies: new Map<string, string[]>(),
    dislikes: new Map<string, string[]>(),
    dietary: new Map<string, string[]>(),
  };

  session.participants.forEach(participant => {
    participant.preferences.allergies.forEach(item => {
      if (!allRestrictions.allergies.has(item)) {
        allRestrictions.allergies.set(item, []);
      }
      allRestrictions.allergies.get(item)!.push(participant.name || '익명');
    });

    participant.preferences.dislikes.forEach(item => {
      if (!allRestrictions.dislikes.has(item)) {
        allRestrictions.dislikes.set(item, []);
      }
      allRestrictions.dislikes.get(item)!.push(participant.name || '익명');
    });

    participant.preferences.dietary.forEach(item => {
      if (!allRestrictions.dietary.has(item)) {
        allRestrictions.dietary.set(item, []);
      }
      allRestrictions.dietary.get(item)!.push(participant.name || '익명');
    });
  });

  // 필터링 함수
  const getFilteredItems = (items: Map<string, string[]>) => {
    const itemsArray = Array.from(items.entries());
    if (!searchTerm) return itemsArray;
    
    return itemsArray.filter(([item]) => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getDisplayItems = () => {
    switch (filterType) {
      case 'allergies':
        return { allergies: getFilteredItems(allRestrictions.allergies) };
      case 'dislikes':
        return { dislikes: getFilteredItems(allRestrictions.dislikes) };
      case 'dietary':
        return { dietary: getFilteredItems(allRestrictions.dietary) };
      default:
        return {
          allergies: getFilteredItems(allRestrictions.allergies),
          dislikes: getFilteredItems(allRestrictions.dislikes),
          dietary: getFilteredItems(allRestrictions.dietary),
        };
    }
  };

  const displayItems = getDisplayItems();
  const totalRestrictions = allRestrictions.allergies.size + allRestrictions.dislikes.size + allRestrictions.dietary.size;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">그룹 제한사항 종합</h3>
              <p className="text-gray-600">모든 참가자의 음식 제한사항을 한눈에 확인하세요</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{totalRestrictions}</div>
            <div className="text-sm text-gray-600">총 제한사항</div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제한사항 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">전체</option>
              <option value="allergies">알레르기</option>
              <option value="dislikes">싫어하는 음식</option>
              <option value="dietary">식단 제한</option>
            </select>
          </div>
        </div>
      </div>

      {/* 알레르기 정보 */}
      {displayItems.allergies && displayItems.allergies.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="text-lg font-semibold text-gray-900">알레르기 정보</h4>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium">
              {displayItems.allergies.length}개
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.allergies.map(([item, participants]) => (
              <div key={item} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-800">{item}</span>
                  <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full">
                    {participants.length}명
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {participants.map((participant, index) => (
                    <span key={index} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 싫어하는 음식 */}
      {displayItems.dislikes && displayItems.dislikes.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <X className="w-5 h-5 text-orange-500" />
            <h4 className="text-lg font-semibold text-gray-900">싫어하는 음식</h4>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-medium">
              {displayItems.dislikes.length}개
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.dislikes.map(([item, participants]) => (
              <div key={item} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-orange-800">{item}</span>
                  <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full">
                    {participants.length}명
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {participants.map((participant, index) => (
                    <span key={index} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 식단 제한사항 */}
      {displayItems.dietary && displayItems.dietary.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-teal-500" />
            <h4 className="text-lg font-semibold text-gray-900">식단 제한사항</h4>
            <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-sm font-medium">
              {displayItems.dietary.length}개
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.dietary.map(([item, participants]) => (
              <div key={item} className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-teal-800">{item}</span>
                  <span className="text-xs bg-teal-200 text-teal-700 px-2 py-1 rounded-full">
                    {participants.length}명
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {participants.map((participant, index) => (
                    <span key={index} className="text-xs bg-teal-100 text-teal-600 px-2 py-1 rounded">
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 제한사항이 없는 경우 */}
      {totalRestrictions === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 제한사항이 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">
              참가자들이 음식 취향을 설정하면 여기에 표시됩니다
            </p>
          </div>
        </div>
      )}

      {/* 검색 결과가 없는 경우 */}
      {searchTerm && Object.values(displayItems).every(items => items.length === 0) && totalRestrictions > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-8">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-400 mt-1">
              다른 검색어를 시도해보세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupRestrictions;