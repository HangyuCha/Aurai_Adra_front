import React, { useMemo } from 'react';
import GenericLesson from '../common/GenericLesson';
import { buildCallLessonConfig, topicMeta } from './callDynamicSteps.js';

export default function CallFixLesson(){
  const { steps, screens } = useMemo(() => buildCallLessonConfig('fix'), []);
  const meta = topicMeta.fix;
  return (
    <GenericLesson
      steps={steps}
      images={{ screens }}
      backPath="/call/learn"
      headerTitle={meta.title}
      headerTagline={meta.tagline}
      donePath="/call/learn"
      chapterId={9}
    />
  );
}
