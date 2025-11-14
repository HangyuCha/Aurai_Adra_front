import React from 'react';
import GenericLesson from '../common/GenericLesson';
import steps from './GptWhatLessonSteps.js';

export default function GptWhatLesson(){
  return (
    <GenericLesson
      steps={steps}
      backPath="/gpt/learn"
      headerTitle="GPT란?"
      headerTagline="소개와 접속·로그인 안내"
      donePath="/gpt/learn"
      showSubmittedBubble={false}
    />
  );
}
