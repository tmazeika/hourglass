import React from 'react';
import { Question } from '@hourglass/types';
import { Part } from './Part';
import { HTML } from './questions/HTML';
import { FileViewer } from './FileViewer';

interface ShowQuestionProps {
  question: Question;
  qnum: number;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    question,
    qnum,
  } = props;
  const {
    name,
    reference,
    description,
    separateSubparts, // TODO
    parts,
  } = question;
  return (
    <div id={`question-${qnum}`} className={`question no-gutters ${separateSubparts ? 'paginated' : ''}`}>
      <h1>{`Question ${qnum + 1}: ${name}`}</h1>
      <HTML value={description} />
      {reference && <FileViewer references={reference} />}
      {parts.map((p, i) => (
        <Part
          part={p}
          pnum={i}
          qnum={qnum}
          key={i}
        />
      ))}
    </div>
  );
};
export default ShowQuestion;
