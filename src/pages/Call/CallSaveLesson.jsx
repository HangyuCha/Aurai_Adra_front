import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';

export default function CallSaveLesson(){
  const { steps, screens } = useMemo(() => buildCallLessonConfig('save'), []);
  const meta = topicMeta.save;
  return (
    <GenericLesson
      steps={steps}
      images={{ screens }}
      backPath="/call/learn"
      headerTitle={meta.title}
      headerTagline={meta.tagline}
      donePath="/call/learn"
      chapterId={7}
    />
  );
}
