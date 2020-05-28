import React from 'react';
import {
  Form,
  Card,
  Alert,
  Row,
  Col,
} from 'react-bootstrap';
import 'react-widgets/dist/css/react-widgets.css';
// import { NumberPicker } from 'react-widgets';
import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import ShowBodyItems from '@professor/exams/new/editor/containers/ShowBodyItems';
import { MovePartAction } from '../../types';
import { movePart } from '../../actions';


export interface PartProps {
  qnum: number;
  pnum: number;
  numParts: number;
  name: string;
  description: string;
  points: number;
  onChange: (name: string, description: string, points: number) => void;
}

const Part: React.FC<PartProps> = (props) => {
  const {
    qnum,
    pnum,
    numParts,
    name,
    description,
    points,
    onChange,
  } = props;
  return (
    <Card border="secondary">
      <Alert variant="secondary">
        <Card.Title>
          <MoveItem
            enableUp={pnum > 0}
            enableDown={pnum + 1 < numParts}
            onUp={(): MovePartAction => movePart(qnum, pnum, pnum - 1)}
            onDown={(): MovePartAction => movePart(qnum, pnum, pnum + 1)}
          />
          {`Part ${String.fromCharCode(65 + pnum)}`}
        </Card.Title>
        <Card.Subtitle>
          <Form.Group as={Row} controlId={`${qnum}-${pnum}-name`}>
            <Form.Label column sm="2">Part name</Form.Label>
            <Col sm="10">
              <Form.Control
                type="input"
                value={name}
                onChange={(e): void => onChange(e.target.value, description, points)}
                placeholder="Give a short (optional) descriptive name for the question"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-${pnum}-desc`}>
            <Form.Label column sm="2">Description:</Form.Label>
            <Col sm="10">
              <Form.Control
                type="input"
                value={description}
                onChange={(e): void => onChange(name, e.target.value, points)}
                placeholder="Give a longer description of the question"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-${pnum}-points`}>
            <Form.Label column sm="2">Points</Form.Label>
            <Col sm="10">
              <Form.Control
                type="number"
                value={points}
                placeholder="Points for this part"
                min={0}
                max={100}
                step={0.5}
                onChange={(e): void => {
                  if (e.target.value === '') {
                    onChange(name, description, 0);
                  } else {
                    const newVal = Number.parseFloat(e.target.value);
                    const actual = (Number.isFinite(newVal) ? newVal : points);
                    onChange(name, description, actual);
                  }
                }}
              />
              {/* <NumberPicker
                placeholder="Points for this part"
                value={points}
                onChange={(newVal): void => onChange(name, description, newVal)}
                min={0}
                max={100}
                step={0.5}
                format="#.#"
              /> */}
            </Col>
          </Form.Group>
        </Card.Subtitle>
      </Alert>
      <Card.Body>
        <ShowBodyItems qnum={qnum} pnum={pnum} />
      </Card.Body>
    </Card>
  );
};

export default Part;
