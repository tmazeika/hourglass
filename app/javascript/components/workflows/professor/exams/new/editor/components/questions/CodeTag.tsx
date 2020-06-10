import React, { useEffect, useState, useContext } from 'react';
import { FileRef, CodeTagInfo, CodeTagState } from '@student/exams/show/types';
import {
  Form,
  Row,
  Col,
  Modal,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { ControlledFileViewer } from '@student/exams/show/components/FileViewer';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import {
  ExamContext,
  ExamFilesContext,
  QuestionFilesContext,
  PartFilesContext,
} from '@student/exams/show/context';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { getFilesForRefs, countFiles } from '@student/exams/show/files';

interface CodeTagValProps {
  value: CodeTagState;
  hideFile?: boolean;
}

const CodeTagVal: React.FC<CodeTagValProps> = (props) => {
  const { value, hideFile = false } = props;
  return (
    <div>
      {hideFile || (
        <span className="mr-2">
          <b className="mr-2">File:</b>
          {value?.selectedFile
            ? (
              <Button disabled size="sm" variant="outline-dark">
                {value.selectedFile}
              </Button>
          )
            : <i>Unanswered</i>}
        </span>
      )}
      <span>
        <b className="mr-2">Line:</b>
        {value?.lineNumber
          ? (
            <Button disabled size="sm" variant="outline-dark">
              {value.lineNumber}
            </Button>
        )
          : <i>Unanswered</i>}
      </span>
    </div>
  );
};

export { CodeTagVal };

interface FileModalProps {
  references: FileRef[];
  show: boolean;
  onClose: () => void;
  onSave: (newState: CodeTagState) => void;
  startValue: CodeTagState;
  disabled: boolean;
}

const FileModal: React.FC<FileModalProps> = (props) => {
  const {
    show,
    onClose,
    onSave,
    references,
    startValue,
    disabled,
  } = props;
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  // Modal has its own state so the user can manipulate it before saving.
  const [selected, setSelected] = useState(startValue);
  const [refresher, setRefresher] = useState(false);
  const refreshCodeMirror = (): void => setRefresher((b) => !b);
  useEffect(() => {
    // Reset my starting state when outer state changes.
    setSelected(startValue);
  }, [startValue]);
  const saveEnabled = selected?.selectedFile && selected?.lineNumber;
  const saveButtonDisabled = disabled || !saveEnabled;
  const disabledMessage = disabled
    ? 'Lost connection to server...'
    : 'Please choose a file and line to save.';
  return (
    <Modal
      show={show}
      onEscapeKeyDown={onClose}
      onHide={onClose}
      onEntering={refreshCodeMirror}
      dialogClassName="w-100 mw-100 m-2"
      centered
      keyboard
    >
      <Modal.Header closeButton>
        <Modal.Title>Choose a line</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ControlledFileViewer
          refreshProps={[refresher]}
          references={references}
          selection={selected}
          onChangeFile={(newFile): void => {
            setSelected({
              selectedFile: newFile,
              lineNumber: undefined,
            });
          }}
          onChangeLine={(newLine): void => {
            setSelected((old) => ({
              selectedFile: old.selectedFile,
              lineNumber: newLine,
            }));
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="mr-auto">
          <CodeTagVal value={selected} hideFile={countFiles(filteredFiles) === 1} />
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <TooltipButton
          disabled={saveButtonDisabled}
          disabledMessage={disabledMessage}
          variant="primary"
          onClick={(): void => onSave(selected)}
        >
          Save Changes
        </TooltipButton>
      </Modal.Footer>
    </Modal>
  );
};

interface CodeTagProps {
  qnum: number;
  pnum: number;
  bnum: number;
  info: CodeTagInfo;
  value: CodeTagState;
  onChange: (newInfo: CodeTagInfo, newVal: CodeTagState) => void;
  disabled: boolean;
}

const CodeTag: React.FC<CodeTagProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    info,
    value,
    onChange,
    disabled,
  } = props;
  const { choices, prompt } = info;
  const [showModal, setShowModal] = useState(false);
  const examReferences = useContext(ExamFilesContext);
  const questionReferences = useContext(QuestionFilesContext);
  const partReferences = useContext(PartFilesContext);
  let references: FileRef[];
  switch (choices) {
    case 'exam':
      references = examReferences.references;
      break;
    case 'question':
      references = questionReferences.references;
      break;
    case 'part':
      references = partReferences.references;
      break;
    default:
      throw new ExhaustiveSwitchError(choices);
  }
  const { fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, references);
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        prompt={prompt.value}
        onChange={(newPrompt): void => {
          if (onChange) {
            onChange({ ...info, prompt: { type: 'HTML', value: newPrompt } }, value);
          }
        }}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-source`}>
        <Form.Label column sm={2}>Files source</Form.Label>
        <Col sm={10}>
          <ButtonGroup>
            <Button
              variant={choices === 'exam' ? 'secondary' : 'outline-secondary'}
              active={choices === 'exam'}
              onClick={(): void => {
                onChange({ ...info, choices: 'exam' }, undefined);
              }}
            >
              Files for full exam
            </Button>
            <Button
              variant={choices === 'question' ? 'secondary' : 'outline-secondary'}
              active={choices === 'question'}
              onClick={(): void => {
                onChange({ ...info, choices: 'question' }, undefined);
              }}
            >
              Files for current question
            </Button>
            <Button
              variant={choices === 'part' ? 'secondary' : 'outline-secondary'}
              active={choices === 'part'}
              onClick={(): void => {
                onChange({ ...info, choices: 'part' }, undefined);
              }}
            >
              Files for current part
            </Button>
          </ButtonGroup>
        </Col>
      </Form.Group>
      <Form.Group
        as={Row}
        controlId={`${qnum}-${pnum}-${bnum}-answer`}
        className="align-items-baseline"
      >
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={6}>
          <CodeTagVal value={value} hideFile={countFiles(filteredFiles) === 1} />
        </Col>
        <Col sm={4}>
          <Button
            disabled={disabled}
            onClick={(): void => setShowModal(true)}
          >
            Choose line
          </Button>
          <FileModal
            disabled={disabled}
            references={references}
            show={showModal}
            onClose={(): void => setShowModal(false)}
            onSave={(newState): void => {
              setShowModal(false);
              onChange(info, newState);
            }}
            startValue={value}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default CodeTag;
