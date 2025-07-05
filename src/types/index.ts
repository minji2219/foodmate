// 사용자 및 메뉴 관련 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  preferences: FoodPreferences;
}

export interface FoodPreferences {
  dislikes: string[];
  allergies: string[];
  dietary: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  price: string;
  image?: string;
}

export interface Session {
  id: string;
  name: string; // 그룹명 추가
  description: string; // 그룹 설명 추가
  createdBy: string;
  createdAt: string;
  participants: Participant[];
  recommendedMenu?: MenuItem;
}

export interface Participant {
  id: string;
  name?: string;
  preferences: FoodPreferences;
  isRegistered: boolean;
}

export interface AppState {
  currentUser: User | null;
  currentSession: Session | null;
  isLoading: boolean;
}