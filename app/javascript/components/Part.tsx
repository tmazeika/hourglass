import React, { useContext } from 'react';
import { PartInfo } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import { BodyProps } from '@hourglass/components/Body';
import { FileViewer } from '@hourglass/components/FileViewer';
import { Waypoint } from 'react-waypoint';
import SubmitButton from '@hourglass/containers/SubmitButton';
import { RailsContext } from '@hourglass/context';
import './Part.css';

interface PartProps {
  part: PartInfo;
  qnum: number;
  pnum: number;
  BodyRenderer: React.ComponentType<BodyProps>;
  spyQuestion: (qnum: number, pnum?: number) => void;
  paginated?: boolean;
  selectedQuestion?: number;
  selectedPart?: number;
  separateSubparts?: boolean;
}

const Part: React.FC<PartProps> = (props) => {
  const {
    part,
    qnum,
    pnum,
    BodyRenderer,
    spyQuestion,
    paginated,
    selectedQuestion,
    selectedPart,
    separateSubparts,
  } = props;
  const {
    name,
    reference,
    description,
    points,
    body,
  } = part;
  const {
    railsExam,
  } = useContext(RailsContext);
  let title = `Part ${pnum + 1}`;
  if (name) title += `: ${name}`;
  const subtitle = `(${points} points)`;
  const showSubmit = false;
  const submitClass = showSubmit ? 'text-center' : 'd-none';
  return (
    <div>
      <Waypoint
        fireOnRapidScroll={false}
        onLeave={({ currentPosition, previousPosition }): void => {
          if (paginated && selectedQuestion !== qnum) return;
          if (paginated && separateSubparts && selectedPart !== pnum) return;
          if (currentPosition === Waypoint.above && previousPosition === Waypoint.inside) {
            spyQuestion(qnum, pnum);
          }
        }}
      />
      <h3 id={`question-${qnum}-part-${pnum}`}>
        {title}
        <small className="float-right text-muted">
          {subtitle}
        </small>
      </h3>
      <div><HTML value={description} /></div>
      {reference && <FileViewer references={reference} />}
      <div>
        <div>
          {body.map((b, i) => (
            // Body numbers are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            <div className="p-2 bodyitem" key={i}>
              <BodyRenderer body={b} qnum={qnum} pnum={pnum} bnum={i} />
            </div>
          ))}
        </div>
      </div>
      <Waypoint
        fireOnRapidScroll={false}
        onEnter={({ currentPosition, previousPosition }): void => {
          if (paginated && selectedQuestion !== qnum) return;
          if (paginated && separateSubparts && selectedPart !== pnum) return;
          if (currentPosition === Waypoint.inside && previousPosition === Waypoint.above) {
            spyQuestion(qnum, pnum);
          }
        }}
      />
      <div className={submitClass}>
        <SubmitButton examID={railsExam.id} />
      </div>
    </div>
  );
};

export default Part;
