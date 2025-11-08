import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './CallFavoriteLessonSteps.js';

export default function CallFavoriteLesson(){
  return <GenericLesson steps={steps} backPath="/call/learn" headerTitle="즐겨찾기 등록하기" headerTagline="중요한 연락처를 즐겨찾기에 추가해 보세요." donePath="/call/learn" chapterId={10} />;
}
