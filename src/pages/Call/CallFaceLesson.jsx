import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';

export default function CallFaceLesson(){
  const { steps, screens } = useMemo(() => buildCallLessonConfig('face'), []);
  const meta = topicMeta.face;
  return (
    <GenericLesson
      steps={steps}
      images={{ screens }}
      backPath="/call/learn"
      headerTitle={meta.title}
      headerTagline={meta.tagline}
      donePath="/call/learn"
      chapterId={14}
    />
  );
}
