import React from 'react';
import {
  Row,
  Col,
  Container,
  Form,
} from 'react-bootstrap';
import {
  Exam,
  RailsExam,
  ExamFile,
  AnswersState,
} from '@student/exams/show/types';
import Instructions from '@hourglass/workflows/professor/exams/new/editor/containers/Instructions';
import Policies from '@professor/exams/new/editor/containers/Policies';
import ShowQuestions from './ShowQuestions';

export interface ExamEditorProps {
  exam: Exam;
  railsExam: RailsExam;
  files: ExamFile[];
  answers: AnswersState;
}

const Editor: React.FC<ExamEditorProps> = (props) => {
  const {
    exam,
    railsExam,
  } = props;
  const {
    questions,
  } = exam;
  const { name } = railsExam;
  return (
    <Container fluid className="flex-fill">
      <Form>
        <Form.Group as={Row} controlId="examTitle">
          <Form.Label column sm="3"><h2>Exam name:</h2></Form.Label>
          <Col>
            <Form.Control
              size="lg"
              type="text"
              placeholder="Enter an exam name"
              defaultValue={name}
            />
          </Col>
        </Form.Group>
        <Policies />
      </Form>

      <Instructions />
      <ShowQuestions questions={questions} />
    </Container>
  );
};

export default Editor;
