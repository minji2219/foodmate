import React, { useState } from 'react';
import { Save, X, Plus, Trash2, AlertCircle, Heart, Search } from 'lucide-react';
import { popularMenus, allergyIngredients, dietaryOptions } from '../data/menuData';
import { userStorage } from '../utils/storage';
import { FoodPreferences } from '../types';

interface PreferencesFormProps {
  currentUser: any;
  onSave: (preferences: FoodPreferences) => void;
  isTemporary?: boolean;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ 
  currentUser, 
  onSave, 
  isTemporary = false 
}) => {
  const [preferences, setPreferences] = useState<FoodPreferences>({
    dislikes: currentUser?.preferences?.dislikes || [],
    allergies: currentUser?.preferences?.allergies || [],
    dietary: currentUser?.preferences?.dietary || [],
  });

  const [customItem, setCustomItem] = useState('');
  const [customType, setCustomType] = useState<'dislikes' | 'allergies'>('dislikes');
  const [searchTerm, setSearchTerm] = useState('');

  const handleMenuToggle = (menu: string, type: keyof FoodPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [type]: prev[type].includes(menu)
        ? prev[type].filter(item => item !== menu)
        : [...prev[type], menu]
    }));
  };

  const handleCustomAdd = () => {
    if (!customItem.trim()) return;
    
    setPreferences(prev => ({
      ...prev,
      [customType]: [...prev[customType], customItem.trim()]
    }));
    setCustomItem('');
  };

  const handleCustomRemove = (item: string, type: keyof FoodPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== item)
    }));
  };

  const handleSave = () => {
    if (!isTemporary && currentUser) {
      userStorage.updateUserPreferences(currentUser.id, preferences);
    }
    onSave(preferences);
  };

  // 검색 필터링
  const filteredMenus = popularMenus.filter(menu => 
    menu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllergies = allergyIngredients.filter(ingredient => 
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isTemporary ? '음식 취향 설정' : '내 음식 취향 관리'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isTemporary 
                ? '이번 모임에서 사용할 음식 취향을 설정해주세요'
                : '좋아하지 않는 메뉴와 알레르기 정보를 설정하면 더 나은 추천을 받을 수 있어요'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="메뉴나 식재료를 검색해보세요..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 알레르기 정보 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">알레르기 정보</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          알레르기가 있는 식재료를 선택해주세요. 이 정보는 메뉴 추천 시 최우선으로 고려됩니다.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {(searchTerm ? filteredAllergies : allergyIngredients).map(ingredient => (
            <button
              key={ingredient}
              onClick={() => handleMenuToggle(ingredient, 'allergies')}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                preferences.allergies.includes(ingredient)
                  ? 'bg-red-100 text-red-700 border-2 border-red-200 transform scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:scale-105'
              }`}
            >
              {ingredient}
            </button>
          ))}
        </div>

        {/* 커스텀 알레르기 추가 */}
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={customType === 'allergies' ? customItem : ''}
            onChange={(e) => {
              setCustomItem(e.target.value);
              setCustomType('allergies');
            }}
            placeholder="기타 알레르기 식재료 입력"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={handleCustomAdd}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 커스텀 알레르기 표시 */}
        {preferences.allergies.filter(item => !allergyIngredients.includes(item)).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {preferences.allergies.filter(item => !allergyIngredients.includes(item)).map(item => (
              <span
                key={item}
                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleCustomRemove(item, 'allergies')}
                  className="hover:text-red-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 싫어하는 메뉴 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">싫어하는 메뉴</h3>
        <p className="text-sm text-gray-600 mb-4">
          선호하지 않는 메뉴를 선택해주세요. 가능한 한 피해서 추천해드립니다.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {(searchTerm ? filteredMenus : popularMenus).map(menu => (
            <button
              key={menu}
              onClick={() => handleMenuToggle(menu, 'dislikes')}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                preferences.dislikes.includes(menu)
                  ? 'bg-orange-100 text-orange-700 border-2 border-orange-200 transform scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:scale-105'
              }`}
            >
              {menu}
            </button>
          ))}
        </div>

        {/* 커스텀 싫어하는 메뉴 추가 */}
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={customType === 'dislikes' ? customItem : ''}
            onChange={(e) => {
              setCustomItem(e.target.value);
              setCustomType('dislikes');
            }}
            placeholder="기타 싫어하는 메뉴 입력"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={handleCustomAdd}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 커스텀 싫어하는 메뉴 표시 */}
        {preferences.dislikes.filter(item => !popularMenus.includes(item)).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {preferences.dislikes.filter(item => !popularMenus.includes(item)).map(item => (
              <span
                key={item}
                className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleCustomRemove(item, 'dislikes')}
                  className="hover:text-orange-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 식단 제한사항 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">식단 제한사항</h3>
        <p className="text-sm text-gray-600 mb-4">
          특별한 식단을 따르고 계신다면 선택해주세요.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {dietaryOptions.map(option => (
            <button
              key={option}
              onClick={() => handleMenuToggle(option, 'dietary')}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                preferences.dietary.includes(option)
                  ? 'bg-teal-100 text-teal-700 border-2 border-teal-200 transform scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:scale-105'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 항목 요약 */}
      {(preferences.dislikes.length > 0 || preferences.allergies.length > 0 || preferences.dietary.length > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-teal-50 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">선택 요약</h3>
          <div className="space-y-3">
            {preferences.allergies.length > 0 && (
              <div>
                <span className="text-sm font-medium text-red-700">알레르기: </span>
                <span className="text-sm text-red-600">{preferences.allergies.join(', ')}</span>
              </div>
            )}
            {preferences.dislikes.length > 0 && (
              <div>
                <span className="text-sm font-medium text-orange-700">싫어하는 메뉴: </span>
                <span className="text-sm text-orange-600">{preferences.dislikes.join(', ')}</span>
              </div>
            )}
            {preferences.dietary.length > 0 && (
              <div>
                <span className="text-sm font-medium text-teal-700">식단 제한: </span>
                <span className="text-sm text-teal-600">{preferences.dietary.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
        >
          <Save className="w-5 h-5" />
          <span>{isTemporary ? '설정 완료' : '저장하기'}</span>
        </button>
      </div>
    </div>
  );
};

export default PreferencesForm;