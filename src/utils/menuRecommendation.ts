import { MenuItem } from '../types';
import { menuItems } from '../data/menuData';
import { Participant } from '../types';

// 메뉴 추천 알고리즘 - 실제 메뉴 기반으로 수정
export const getRecommendedMenu = (participants: Participant[]): MenuItem | null => {
  if (participants.length === 0) return null;

  // 모든 참가자의 제한사항 합치기
  const allDislikes = new Set<string>();
  const allAllergies = new Set<string>();
  const allDietary = new Set<string>();

  participants.forEach(participant => {
    participant.preferences.dislikes.forEach(item => allDislikes.add(item));
    participant.preferences.allergies.forEach(item => allAllergies.add(item));
    participant.preferences.dietary.forEach(item => allDietary.add(item));
  });

  // 필터링된 메뉴 찾기
  const availableMenus = menuItems.filter(menu => {
    // 1. 직접적으로 싫어하는 메뉴 체크
    if (allDislikes.has(menu.name)) return false;

    // 2. 알레르기 식재료 체크 (가장 중요)
    const hasAllergy = menu.tags.some(tag => allAllergies.has(tag));
    if (hasAllergy) return false;

    // 3. 싫어하는 식재료 체크
    const hasDislikedIngredient = menu.tags.some(tag => allDislikes.has(tag));
    if (hasDislikedIngredient) return false;

    // 4. 식단 제한사항 체크
    if (allDietary.has('비건')) {
      const nonVeganTags = ['돼지고기', '소고기', '닭고기', '해산물', '생선', '달걀', '우유', '치즈', '버터'];
      if (menu.tags.some(tag => nonVeganTags.includes(tag))) return false;
    }

    if (allDietary.has('베지테리안')) {
      const nonVegetarianTags = ['돼지고기', '소고기', '닭고기', '해산물', '생선'];
      if (menu.tags.some(tag => nonVegetarianTags.includes(tag))) return false;
    }

    if (allDietary.has('글루텐프리')) {
      const glutenTags = ['밀가루', '면류'];
      if (menu.tags.some(tag => glutenTags.includes(tag))) return false;
    }

    if (allDietary.has('유당불내증')) {
      const lactoseTags = ['우유', '치즈', '버터', '요거트'];
      if (menu.tags.some(tag => lactoseTags.includes(tag))) return false;
    }

    if (allDietary.has('할랄')) {
      const nonHalalTags = ['돼지고기'];
      if (menu.tags.some(tag => nonHalalTags.includes(tag))) return false;
    }

    return true;
  });

  // 랜덤하게 메뉴 선택
  if (availableMenus.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableMenus.length);
  return availableMenus[randomIndex];
};

// 사용 가능한 메뉴 개수 반환
export const getAvailableMenuCount = (participants: Participant[]): number => {
  if (participants.length === 0) return menuItems.length;

  const allDislikes = new Set<string>();
  const allAllergies = new Set<string>();
  const allDietary = new Set<string>();

  participants.forEach(participant => {
    participant.preferences.dislikes.forEach(item => allDislikes.add(item));
    participant.preferences.allergies.forEach(item => allAllergies.add(item));
    participant.preferences.dietary.forEach(item => allDietary.add(item));
  });

  return menuItems.filter(menu => {
    // 직접적으로 싫어하는 메뉴 체크
    if (allDislikes.has(menu.name)) return false;

    // 알레르기 체크
    const hasAllergy = menu.tags.some(tag => allAllergies.has(tag));
    if (hasAllergy) return false;

    // 싫어하는 식재료 체크
    const hasDislikedIngredient = menu.tags.some(tag => allDislikes.has(tag));
    if (hasDislikedIngredient) return false;

    // 식단 제한사항 체크
    if (allDietary.has('비건')) {
      const nonVeganTags = ['돼지고기', '소고기', '닭고기', '해산물', '생선', '달걀', '우유', '치즈', '버터'];
      if (menu.tags.some(tag => nonVeganTags.includes(tag))) return false;
    }

    if (allDietary.has('베지테리안')) {
      const nonVegetarianTags = ['돼지고기', '소고기', '닭고기', '해산물', '생선'];
      if (menu.tags.some(tag => nonVegetarianTags.includes(tag))) return false;
    }

    if (allDietary.has('글루텐프리')) {
      const glutenTags = ['밀가루', '면류'];
      if (menu.tags.some(tag => glutenTags.includes(tag))) return false;
    }

    if (allDietary.has('유당불내증')) {
      const lactoseTags = ['우유', '치즈', '버터', '요거트'];
      if (menu.tags.some(tag => lactoseTags.includes(tag))) return false;
    }

    if (allDietary.has('할랄')) {
      const nonHalalTags = ['돼지고기'];
      if (menu.tags.some(tag => nonHalalTags.includes(tag))) return false;
    }

    return true;
  }).length;
};

// 추천 불가능한 이유 분석
export const getRecommendationBlockers = (participants: Participant[]): string[] => {
  if (participants.length === 0) return [];

  const blockers: string[] = [];
  const allDislikes = new Set<string>();
  const allAllergies = new Set<string>();
  const allDietary = new Set<string>();

  participants.forEach(participant => {
    participant.preferences.dislikes.forEach(item => allDislikes.add(item));
    participant.preferences.allergies.forEach(item => allAllergies.add(item));
    participant.preferences.dietary.forEach(item => allDietary.add(item));
  });

  if (allAllergies.size > 0) {
    blockers.push(`알레르기: ${Array.from(allAllergies).join(', ')}`);
  }

  if (allDislikes.size > 0) {
    blockers.push(`싫어하는 음식: ${Array.from(allDislikes).join(', ')}`);
  }

  if (allDietary.size > 0) {
    blockers.push(`식단 제한: ${Array.from(allDietary).join(', ')}`);
  }

  return blockers;
};