import React from 'react';
import { HTML } from './questions/HTML';
import Code from '../containers/questions/Code';
import YesNoInput from '../containers/questions/YesNo';
import CodeTag from '../containers/questions/CodeTag';
import Text from '../containers/questions/Text';
import Matching from '../containers/questions/Matching';
import MultipleChoice from '../containers/questions/MultipleChoice';
import AllThatApply from '../containers/questions/AllThatApply';
import { BodyItem } from '../types';

export interface BodyProps {
  body: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function Body(props: BodyProps) {
  const {
    body, qnum, pnum, bnum,
  } = props;
  switch (body.type) {
    case 'HTML':
      return <HTML value={body.value} />;
    case 'Code':
      return <Code info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'AllThatApply':
      return <AllThatApply info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'CodeTag':
      return <CodeTag info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'TrueFalse':
      return <YesNoInput info={body} qnum={qnum} pnum={pnum} bnum={bnum} yesLabel="True" noLabel="False " />;
    case 'YesNo':
      return <YesNoInput info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'MultipleChoice':
      return <MultipleChoice info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'Text':
      return <Text info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'Matching':
      return <Matching info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    default:
      throw new Error('invalid question type');
  }
}
