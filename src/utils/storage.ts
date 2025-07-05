import { User, Session, FoodPreferences } from '../types';

// 로컬 스토리지 키 상수
const STORAGE_KEYS = {
  USERS: 'lunch_app_users',
  CURRENT_USER: 'lunch_app_current_user',
  SESSIONS: 'lunch_app_sessions',
} as const;

// 사용자 관련 스토리지 함수
export const userStorage = {
  // 모든 사용자 가져오기
  getUsers: (): User[] => {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  // 사용자 저장
  saveUser: (user: User): void => {
    const users = userStorage.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // 사용자 찾기
  findUser: (email: string, password: string): User | null => {
    const users = userStorage.getUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  },

  // 현재 사용자 저장
  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // 현재 사용자 가져오기
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  // 사용자 설정 업데이트
  updateUserPreferences: (userId: string, preferences: FoodPreferences): void => {
    const users = userStorage.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
      users[userIndex].preferences = preferences;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      // 현재 사용자도 업데이트
      const currentUser = userStorage.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.preferences = preferences;
        userStorage.setCurrentUser(currentUser);
      }
    }
  },
};

// 세션 관련 스토리지 함수
export const sessionStorage = {
  // 모든 세션 가져오기
  getSessions: (): Session[] => {
    const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return sessions ? JSON.parse(sessions) : [];
  },

  // 세션 저장
  saveSession: (session: Session): void => {
    const sessions = sessionStorage.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  // 세션 찾기
  findSession: (id: string): Session | null => {
    const sessions = sessionStorage.getSessions();
    return sessions.find(s => s.id === id) || null;
  },

  // 세션 삭제
  deleteSession: (id: string): void => {
    const sessions = sessionStorage.getSessions();
    const filteredSessions = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filteredSessions));
  },
};

// 유틸리티 함수
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateSessionCode = (): string => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};