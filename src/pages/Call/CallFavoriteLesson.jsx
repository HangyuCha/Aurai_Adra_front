import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';

export default function CallFavoriteLesson(){
  const { steps, screens } = useMemo(() => buildCallLessonConfig('favorite'), []);
  const meta = topicMeta.favorite;
  return (
    <GenericLesson
      steps={steps}
      images={{ screens }}
      backPath="/call/learn"
      headerTitle={meta.title}
      headerTagline={meta.tagline}
      donePath="/call/learn"
      chapterId={10}
    />
  );
}
