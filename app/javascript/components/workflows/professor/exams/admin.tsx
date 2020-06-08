import React, { useState, useEffect, useContext } from 'react';
import {
  Switch,
  Route,
  Link,
  useParams,
  useHistory,
} from 'react-router-dom';
import { useResponse as examsShow, Response as ShowResponse, Version } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError, useRefresher } from '@hourglass/common/helpers';
import {
  Card,
  Collapse,
  Button,
  InputGroup,
  ButtonGroup,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import ExamViewer from '@proctor/registrations/show';
import { RailsExam, ContentsState } from '@student/exams/show/types';
import { Editor as CodeMirrorEditor } from 'codemirror';
import LinkButton from '@hourglass/common/linkbutton';
import ReadableDate from '@hourglass/common/ReadableDate';
import { hitApi } from '@hourglass/common/types/api';
import { AlertContext } from '@hourglass/common/alerts';
import DateTimePicker from '@professor/exams/new/DateTimePicker';

export const ExamAdmin: React.FC = () => {
  const { examId } = useParams();
  const [refresher, refresh] = useRefresher();
  const response = examsShow(examId, [refresher]);
  switch (response.type) {
    case 'ERROR':
      return (
        <span
          className="text-danger"
        >
          {response.text}
        </span>
      );
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <>
          <Switch>
            <Route path="/exams/:examId/admin/edit">
              <ExamInfoEditor
                response={response.response}
                onSuccess={refresh}
              />
            </Route>
            <Route path="/exams/:examId/admin">
              <ExamInfoViewer response={response.response} />
            </Route>
          </Switch>
          <VersionInfo versions={response.response.versions} examName={response.response.name} />
          <ProctoringInfo examId={examId} />
        </>
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

const ProctoringInfo: React.FC<{
  examId: number;
}> = (props) => {
  const {
    examId,
  } = props;
  return (
    <>
      <h2>Proctoring Arrangements</h2>
      <Form.Group>
        <Link to={`/exams/${examId}/seating`}>
          <Button
            variant="info"
          >
            Assign seating
          </Button>
        </Link>
        <Link to={`/exams/${examId}/allocate-versions`}>
          <Button
            variant="info"
            className="ml-2"
          >
            Allocate versions
          </Button>
        </Link>
      </Form.Group>
    </>
  );
};

const ExamInfoViewer: React.FC<{
  response: ShowResponse;
}> = (props) => {
  const {
    examId,
  } = useParams();
  const {
    response,
  } = props;
  const {
    start,
    end,
    duration,
  } = response;
  return (
    <>
      <h1>{response.name}</h1>
      <p>
        Starts&nbsp;
        <ReadableDate value={start} showTime />
      </p>
      <p>
        Ends&nbsp;
        <ReadableDate value={end} showTime />
      </p>
      <p>{`Duration: ${duration} minutes`}</p>
      <LinkButton to={`/exams/${examId}/admin/edit`}>
        Edit
      </LinkButton>
    </>
  );
};


export const ExamInfoEditor: React.FC<{
  response: ShowResponse;
  onSuccess: () => void;
}> = (props) => {
  const {
    response,
    onSuccess,
  } = props;
  const {
    examId,
  } = useParams();
  const history = useHistory();
  const { alert } = useContext(AlertContext);
  const [name, setName] = useState(response.name);
  const [start, setStart] = useState(response.start.toISO());
  const [end, setEnd] = useState(response.end.toISO());
  const [duration, setDuration] = useState(response.duration);

  const submitForm = (): void => {
    const formInfo = {
      exam: {
        name,
        start,
        end,
        duration,
      },
    };
    hitApi<{
      updated: boolean;
    }>(`/api/professor/exams/${examId}`, {
      method: 'PATCH',
      body: JSON.stringify(formInfo),
    }).then(({ updated }) => {
      history.push(`/exams/${examId}/admin`);
      if (updated) {
        alert({
          variant: 'success',
          message: 'Exam info saved.',
        });
        onSuccess();
      } else {
        throw new Error('API failure');
      }
    }).catch((err) => {
      history.push(`/exams/${examId}/admin`);
      alert({
        variant: 'danger',
        title: 'Error saving exam info.',
        message: err.message,
      });
    });
  };

  const cancelEditing = (): void => {
    history.push(`/exams/${examId}/admin`);
  };

  return (
    <Card>
      <Card.Body>
        <Form.Group as={Row} controlId="examTitle">
          <Form.Label column sm={2}>Exam name:</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="input"
              value={name}
              onChange={(e): void => setName(e.target.value)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examStartTime">
          <Form.Label column sm={2}>Start time:</Form.Label>
          <Col sm={10}>
            <p>{start}</p>
            <DateTimePicker
              maxIsoValue={end}
              isoValue={start}
              onChange={(newStart): void => {
                // console.log(start, newStart.toISO());
                setStart(newStart.toISO());
              }}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examEndTime">
          <Form.Label column sm={2}>End time:</Form.Label>
          <Col sm={10}>
            <p>{end}</p>
            <DateTimePicker
              isoValue={end}
              minIsoValue={start}
              onChange={(newEnd): void => setEnd(newEnd.toISO())}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examDuration">
          <Form.Label column sm={2}>Duration (minutes):</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="number"
              value={duration}
              onChange={(e): void => setDuration(Number(e.target.value))}
            />
          </Col>
        </Form.Group>
        <Form.Group className="float-right">
          <Button
            variant="danger"
            onClick={cancelEditing}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            className="ml-2"
            onClick={submitForm}
          >
            Save
          </Button>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

const VersionInfo: React.FC<{
  examName: string;
  versions: Version[];
}> = (props) => {
  const {
    examName,
    versions,
  } = props;
  return (
    <>
      <h2>Versions</h2>
      <ul>
        {versions.map((v) => (
          <li key={v.id}>
            <ShowVersion
              version={v}
              examName={examName}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

const ShowVersion: React.FC<{
  version: Version;
  examName: string;
}> = (props) => {
  const {
    version,
    examName,
  } = props;
  const { examId } = useParams();
  const [preview, setPreview] = useState(false);
  return (
    <>
      <InputGroup>
        <h3 className="flex-grow-1">{version.name}</h3>
        <InputGroup.Append>
          <ButtonGroup>
            <Button
              variant="info"
            >
              Grade
            </Button>
            <LinkButton
              variant="info"
              to={`/exams/${examId}/versions/${version.id}/edit`}
            >
              Edit
            </LinkButton>
            <Button
              variant="primary"
              onClick={(): void => setPreview((o) => !o)}
            >
              Preview Version
              {preview ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
            </Button>
          </ButtonGroup>
        </InputGroup.Append>
      </InputGroup>
      <PreviewVersion
        open={preview}
        railsExam={{
          id: examId,
          name: examName,
          policies: version.policies,
        }}
        contents={version.contents}
      />
    </>
  );
};

export default ExamAdmin;

interface CodeMirroredElement extends Element {
  CodeMirror: CodeMirrorEditor;
}

const PreviewVersion: React.FC<{
  open: boolean;
  contents: ContentsState;
  railsExam: RailsExam;
}> = (props) => {
  const {
    open,
    contents,
    railsExam,
  } = props;
  useEffect(() => {
    if (!open) return;
    document.querySelectorAll('.CodeMirror').forEach((cm) => {
      setTimeout(() => (cm as CodeMirroredElement).CodeMirror.refresh());
    });
  }, [open]);
  return (
    <Collapse in={open}>
      <div className="border p-2">
        <ExamViewer
          railsExam={railsExam}
          contents={contents}
        />
      </div>
    </Collapse>
  );
};