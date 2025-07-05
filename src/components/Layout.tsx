import React from 'react';
import { User, LogOut, Users, Home, Utensils, Eye } from 'lucide-react';
import { userStorage } from '../utils/storage';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: any;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onLogout, 
  currentPage, 
  onNavigate 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b-2 border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-teal-500 rounded-full flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-teal-600 bg-clip-text text-transparent">
                  FoodMate
                </h1>
                <p className="text-xs text-gray-500 -mt-1">모두가 만족하는 식사 선택</p>
              </div>
            </div>

            {/* 네비게이션 */}
            <nav className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      currentPage === 'dashboard'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>대시보드</span>
                  </button>
                  
                  <button
                    onClick={() => onNavigate('participant-groups')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      currentPage === 'participant-groups'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>참여한 그룹</span>
                  </button>
                  
                  <button
                    onClick={() => onNavigate('preferences')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      currentPage === 'preferences'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>내 취향</span>
                  </button>
                </>
              )}
            </nav>

            {/* 사용자 정보 */}
            {currentUser && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-teal-500 rounded-full flex items-center justify-center">
                <Utensils className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-orange-500 to-teal-600 bg-clip-text text-transparent">
                FoodMate
              </span>
            </div>
            <p className="text-sm">
              모든 팀원이 만족하는 식사 시간을 위해 💛
            </p>
            <p className="text-xs mt-2 text-gray-500">
              함께 먹으면 더 맛있어요!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;