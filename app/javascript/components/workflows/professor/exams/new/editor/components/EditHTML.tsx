import React from 'react';
import {
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';

export interface HTMLProps {
  qnum: number;
  pnum: number;
  bnum: number;
  value: string;
  onChange: (content: string) => void;
}

const EditHTML: React.FC<HTMLProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    value,
    onChange,
  } = props;
  return (
    <>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-content`}>
        <Form.Label column sm={2}>Prompt</Form.Label>
        <Col sm={10}>
          <CustomEditor
            className="bg-white"
            value={value}
            placeholder="Body item..."
            onChange={(newVal, _delta, source, _editor): void => {
              if (source === 'user') onChange(newVal);
            }}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default EditHTML;