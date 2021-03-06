import React, { useState } from 'react';
import {
  Rubric,
  Preset,
  isRubricPresets,
  RubricPresets,
  RubricAll,
  RubricAny,
  RubricOne,
} from '@professor/exams/types';
import { ExhaustiveSwitchError, pluralize } from '@hourglass/common/helpers';
import {
  Alert,
  Row,
  Col,
  Button,
  Collapse,
} from 'react-bootstrap';
import HTML from '@student/exams/show/components/HTML';
import Icon from '@student/exams/show/components/Icon';
import { variantForPoints, iconForPoints } from '@grading/index';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { ShowPresetSummary } from '@grading/UseRubrics';

const ShowPreset: React.FC<{
  preset: Preset;
  direction: RubricPresets['direction'];
}> = (props) => {
  const {
    preset,
    direction,
  } = props;
  const {
    label,
    graderHint,
    studentFeedback,
    points,
  } = preset;
  return (
    <Alert variant={direction === 'credit' ? 'success' : 'danger'} className="p-0">
      <Button
        disabled
        variant={variantForPoints(points)}
        size="sm"
        className="mr-2 align-self-center"
      >
        <Icon I={iconForPoints(points)} className="mr-2" />
        {pluralize(points, 'point', 'points')}
      </Button>
      {label && <span className="mr-2">{`[${label}]`}</span>}
      <span>{graderHint}</span>
      {studentFeedback && (
        <Row className="p-2">
          <Col sm="2">
            <i className="mr-2">Sample student message:</i>
          </Col>
          <Col className="border border-info bg-white rounded mr-3">
            {studentFeedback}
          </Col>
        </Row>
      )}
    </Alert>
  );
};

const ShowRubricPresets: React.FC<{ choices: RubricPresets }> = (props) => {
  const { choices } = props;
  const {
    direction,
    presets,
  } = choices;
  return (
    <Row>
      <Col>
        {presets.map((p, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <ShowPreset direction={direction} preset={p} key={index} />
        ))}
      </Col>
    </Row>
  );
};

const ShowRubricAll: React.FC<{ rubric: RubricAll }> = (props) => {
  const { rubric } = props;
  const { description, choices } = rubric;
  const [open, setOpen] = useState(false);
  let summary;
  let body;
  if (isRubricPresets(choices)) {
    const { direction, label, mercy } = choices;
    summary = (
      <span className="ml-auto">
        <ShowPresetSummary
          direction={direction}
          label={label}
          mercy={mercy}
        />
      </span>
    );
    body = <ShowRubricPresets choices={choices} />;
  } else {
    body = (
      <>
        {choices.map((c, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <ShowRubric key={index} rubric={c} />
        ))}
      </>
    );
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      <span
        role="button"
        onClick={() => setOpen((o) => !o)}
        onKeyPress={() => setOpen((o) => !o)}
        tabIndex={0}
      >
        Choose something from
        <i className="mx-1">all</i>
        entries
        <Icon className="ml-2" I={open ? FaChevronUp : FaChevronDown} />
      </span>
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <div className="rubric">
      <Alert className="card" variant="dark">
        {heading}
        <Collapse in={open}>
          <div>
            <HTML value={description} />
            {body}
          </div>
        </Collapse>
      </Alert>
    </div>
  );
};

const ShowRubricAny: React.FC<{ rubric: RubricAny }> = (props) => {
  const { rubric } = props;
  const { points, description, choices } = rubric;
  const [open, setOpen] = useState(false);
  const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
  let summary;
  let body;
  if (isRubricPresets(choices)) {
    const { direction, label, mercy } = choices;
    summary = (
      <span className="ml-auto">
        <ShowPresetSummary
          direction={direction}
          label={label}
          mercy={mercy}
          pointsMsg={pointsMsg}
        />
      </span>
    );
    body = <ShowRubricPresets choices={choices} />;
  } else {
    summary = <span className="ml-auto">{pointsMsg}</span>;
    body = (
      <>
        {choices.map((c, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <ShowRubric key={index} rubric={c} />
        ))}
      </>
    );
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      <span
        role="button"
        onClick={() => setOpen((o) => !o)}
        onKeyPress={() => setOpen((o) => !o)}
        tabIndex={0}
      >
        Choose something from
        <i className="mx-1">any</i>
        entries
        <Icon className="ml-2" I={open ? FaChevronUp : FaChevronDown} />
      </span>
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <div className="rubric">
      <Alert className="card" variant="dark">
        {heading}
        <Collapse in={open}>
          <div>
            <HTML value={description} />
            {body}
          </div>
        </Collapse>
      </Alert>
    </div>
  );
};

const ShowRubricOne: React.FC<{ rubric: RubricOne }> = (props) => {
  const { rubric } = props;
  const { points, description, choices } = rubric;
  const [open, setOpen] = useState(false);
  const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
  let summary;
  let body;
  if (isRubricPresets(choices)) {
    const { direction, label, mercy } = choices;
    summary = (
      <span className="ml-auto">
        <ShowPresetSummary
          direction={direction}
          label={label}
          mercy={mercy}
          pointsMsg={pointsMsg}
        />
      </span>
    );
    body = <ShowRubricPresets choices={choices} />;
  } else {
    summary = <span className="ml-auto">{pointsMsg}</span>;
    body = (
      <>
        {choices.map((c, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <ShowRubric key={index} rubric={c} />
        ))}
      </>
    );
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      <span
        role="button"
        onClick={() => setOpen((o) => !o)}
        onKeyPress={() => setOpen((o) => !o)}
        tabIndex={0}
      >
        Choose something from
        <i className="mx-1">exactly one</i>
        entry
        <Icon className="ml-2" I={open ? FaChevronUp : FaChevronDown} />
      </span>
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <div className="rubric">
      <Alert className="card" variant="dark">
        {heading}
        <Collapse in={open}>
          <div>
            <HTML value={description} />
            {body}
          </div>
        </Collapse>
      </Alert>
    </div>
  );
};

const ShowRubric: React.FC<{ rubric: Rubric }> = (props) => {
  const { rubric } = props;
  switch (rubric.type) {
    case 'none': return <div><i>No rubric</i></div>;
    case 'all': return <ShowRubricAll rubric={rubric} />;
    case 'any': return <ShowRubricAny rubric={rubric} />;
    case 'one': return <ShowRubricOne rubric={rubric} />;
    default:
      throw new ExhaustiveSwitchError(rubric);
  }
};

export default ShowRubric;
