import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  useResponse as examsShow,
} from '@hourglass/common/api/professor/exams/show';
import RegularNavbar from '@hourglass/common/navbar';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Tab,
  Nav,
  Form,
  Card,
  Media,
  Alert,
  Modal,
} from 'react-bootstrap';
import ReadableDate from '@hourglass/common/ReadableDate';
import {
  FaThumbsUp,
  FaThumbsDown,
  FaInbox,
  FaList,
  FaCheck,
} from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import { MdMessage, MdSend, MdPeople } from 'react-icons/md';
import { Anomaly, useResponse as anomaliesIndex } from '@hourglass/common/api/proctor/anomalies';
import { destroyAnomaly } from '@hourglass/common/api/proctor/anomalies/destroy';
import Loading from '@hourglass/common/loading';
import { AlertContext } from '@hourglass/common/alerts';
import TooltipButton from '@hourglass/workflows/student/exams/show/components/TooltipButton';
import { useRefresher, ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  RoomAnnouncement,
  DirectMessage,
  Response,
  useResponse as useExamMessages,
  Question,
  VersionAnnouncement,
  ExamAnnouncement,
  Message,
  MessageType,
} from '@hourglass/common/api/proctor/messages';
import {
  Recipient,
  SplitRecipients,
  useMessageRecipients,
} from '@hourglass/common/api/proctor/messages/recipients';
import { GiBugleCall } from 'react-icons/gi';
import { DateTime } from 'luxon';
import { IconType } from 'react-icons';
import { sendMessage } from '@hourglass/common/api/proctor/messages/create';
import './index.scss';
import { BsListCheck } from 'react-icons/bs';
import { doFinalize } from '@hourglass/common/api/proctor/exams/finalize';

export interface MessageProps {
  icon: IconType;
  iconClass?: string;
  tooltip: string;
  time: DateTime;
  body: React.ReactElement | string;
}

const ShowMessage: React.FC<MessageProps> = (props) => {
  const {
    icon,
    iconClass,
    tooltip,
    time,
    body,
  } = props;
  return (
    <Media>
      <span className="mr-2">
        <Icon I={icon} className={iconClass} />
      </span>
      <Media.Body>
        <p className="m-0">
          <i className="text-muted">
            {`${tooltip} (${time.toLocaleString(DateTime.TIME_SIMPLE)})`}
          </i>
        </p>
        <p>{body}</p>
      </Media.Body>
    </Media>
  );
};


const FinalizeButton: React.FC<{
  examId: number;
  userId: number;
  regFinal: boolean;
  refresh: () => void;
}> = (props) => {
  const {
    examId,
    userId,
    regFinal,
    refresh,
  } = props;
  const { alert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const disabled = loading || regFinal;
  const reason = loading ? 'Loading...' : 'Already final';
  return (
    <Loading loading={loading}>
      <TooltipButton
        disabled={disabled}
        disabledMessage={reason}
        variant="danger"
        onClick={() => {
          setLoading(true);
          doFinalize(examId, {
            type: 'USER',
            id: userId,
          }).then((res) => {
            if (res.success === true) {
              alert({
                variant: 'success',
                message: 'Registration finalized.',
              });
              setLoading(false);
              refresh();
            } else {
              throw new Error(res.reason);
            }
          }).catch((err) => {
            alert({
              variant: 'danger',
              title: 'Error finalizing registration',
              message: err.message,
            });
            setLoading(false);
          });
        }}
      >
        <Icon I={FaThumbsDown} />
        Finalize
      </TooltipButton>
    </Loading>
  );
};

const ClearButton: React.FC<{
  anomalyId: number;
  refresh: () => void;
}> = (props) => {
  const {
    anomalyId,
    refresh,
  } = props;
  const { alert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  return (
    <Loading loading={loading}>
      <TooltipButton
        disabled={loading}
        disabledMessage="Loading..."
        variant="success"
        onClick={() => {
          setLoading(true);
          destroyAnomaly(anomalyId).then((res) => {
            if (res.success === true) {
              alert({
                variant: 'success',
                message: 'Anomaly cleared.',
                autohide: true,
              });
              setLoading(false);
              refresh();
            } else {
              throw new Error(res.reason);
            }
          }).catch((err) => {
            alert({
              variant: 'danger',
              title: 'Error clearing anomaly',
              message: err.message,
            });
            setLoading(false);
          });
        }}
      >
        <Icon I={FaThumbsUp} />
        Clear anomaly
      </TooltipButton>
    </Loading>
  );
};

const ShowAnomalies: React.FC<{
  replyTo: (userId: number) => void;
  examId: number;
  anomalies: Anomaly[];
  refresh: () => void;
}> = (props) => {
  const {
    replyTo,
    examId,
    anomalies,
    refresh,
  } = props;
  useEffect(() => {
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [refresh]);
  return (
    <>
      {anomalies.length === 0 && <tr><td colSpan={4}>No anomalies.</td></tr>}
      {anomalies.map((a) => (
        <tr key={a.id}>
          <td>{a.user.displayName}</td>
          <td><ReadableDate showTime value={a.time} /></td>
          <td>{a.reason}</td>
          <td>
            <FinalizeButton
              examId={examId}
              refresh={refresh}
              userId={a.user.id}
              regFinal={a.reg.final}
            />
            <ClearButton refresh={refresh} anomalyId={a.id} />
            <Button
              variant="info"
              onClick={() => {
                replyTo(a.user.id);
              }}
            >
              <Icon I={MdMessage} />
              Message student
            </Button>
          </td>
        </tr>
      ))}
    </>
  );
};

const formatGroupLabel = (data) => {
  if (data.options.length > 1) {
    return (
      <div className="proctor-groupstyles">
        <span>{data.label}</span>
      </div>
    );
  }
  return <span />;
};

const FinalizeRegs: React.FC<{
  examId: number;
  recipientOptions: RecipientOptions;
}> = (props) => {
  const {
    examId,
    recipientOptions,
  } = props;
  const { alert } = useContext(AlertContext);
  const [selectedRecipient, setSelectedRecipient] = useState<MessageFilterOption>(
    recipientOptions[0].options[0],
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const finalize = () => {
    setLoading(true);
    let type;
    switch (selectedRecipient.value.type) {
      case MessageType.Exam:
        type = 'EXAM';
        break;
      case MessageType.Room:
        type = 'ROOM';
        break;
      case MessageType.Direct:
        type = 'USER';
        break;
      case MessageType.Version:
        type = 'VERSION';
        break;
      default:
        throw new ExhaustiveSwitchError(selectedRecipient.value.type);
    }
    doFinalize(examId, {
      type,
      id: selectedRecipient.value.id,
    }).then((res) => {
      if (res.success !== true) {
        throw new Error(res.reason);
      }
      closeModal();
      setLoading(false);
      alert({
        variant: 'success',
        title: 'Finalization successful',
        message: `Finalized '${selectedRecipient.label}'.`,
      });
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
      alert({
        variant: 'danger',
        title: `Error finalizing '${selectedRecipient.label}'`,
        message: err.message,
      });
    });
  };
  return (
    <>
      <Alert variant="danger">
        <h2>Finalization</h2>
        <Form.Group as={Row} controlId="finalize-target-box">
          <Form.Label column sm="auto">Target:</Form.Label>
          <Col>
            <Select
              placeholder="Choose selection criteria..."
              value={selectedRecipient}
              onChange={(value: MessageFilterOption) => {
                setSelectedRecipient(value);
              }}
              formatGroupLabel={formatGroupLabel}
              options={recipientOptions}
              menuPlacement="auto"
            />
          </Col>
        </Form.Group>
        <Form.Group>
          <Button
            variant="danger"
            onClick={openModal}
          >
            <Icon I={BsListCheck} />
            Finalize
          </Button>
        </Form.Group>
      </Alert>
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          Finalize
        </Modal.Header>
        <Modal.Body>
          <p>
            {'Are you sure you want to finalize '}
            <i>{selectedRecipient.label}</i>
            ?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={loading}
            variant="secondary"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Loading loading={loading}>
            <TooltipButton
              disabled={loading}
              disabledMessage="Loading..."
              variant="danger"
              onClick={finalize}
            >
              Finalize
            </TooltipButton>
          </Loading>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const ExamAnomalies: React.FC<{
  replyTo: (userId: number) => void;
  recipientOptions: RecipientOptions;
  examId: number;
}> = (props) => {
  const {
    replyTo,
    recipientOptions,
    examId,
  } = props;
  const [refresher, refresh] = useRefresher();
  const res = anomaliesIndex(examId, [refresher]);
  return (
    <div className="wrapper h-100">
      <div className="inner-wrapper">
        <h2>Anomalies</h2>
        <div className="content-wrapper">
          <div className="content overflow-auto-y">
            <Loading loading={res.type === 'LOADING'}>
              <Table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Timestamp</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                {res.type === 'ERROR' && (
                  <span className="text-danger">
                    <p>Error</p>
                    <small>{`${res.text} (${res.status})`}</small>
                  </span>
                )}
                <tbody>
                  {res.type === 'RESULT' && (
                    <ShowAnomalies
                      replyTo={replyTo}
                      examId={examId}
                      refresh={refresh}
                      anomalies={res.response.anomalies}
                    />
                  )}
                </tbody>
              </Table>
            </Loading>
          </div>
        </div>
        <div>
          <FinalizeRegs examId={examId} recipientOptions={recipientOptions} />
        </div>
      </div>
    </div>
  );
};

const ShowExamAnnouncement: React.FC<{
  announcement: ExamAnnouncement;
}> = (props) => {
  const {
    announcement,
  } = props;
  const {
    body,
    time,
  } = announcement;
  return (
    <ShowMessage
      icon={GiBugleCall}
      tooltip="Sent to entire exam"
      body={body}
      time={time}
    />
  );
};


const ShowVersionAnnouncement: React.FC<{
  announcement: VersionAnnouncement;
}> = (props) => {
  const {
    announcement,
  } = props;
  const {
    version,
    body,
    time,
  } = announcement;
  return (
    <ShowMessage
      icon={MdPeople}
      tooltip={`Sent to ${version.name}`}
      body={body}
      time={time}
    />
  );
};

const ShowRoomAnnouncement: React.FC<{
  announcement: RoomAnnouncement;
}> = (props) => {
  const {
    announcement,
  } = props;
  const {
    room,
    body,
    time,
  } = announcement;
  return (
    <ShowMessage
      icon={MdPeople}
      tooltip={`Sent to ${room.name}`}
      body={body}
      time={time}
    />
  );
};

const ShowQuestion: React.FC<{
  question: Question;
  replyTo: (userId: number) => void;
}> = (props) => {
  const {
    question,
    replyTo,
  } = props;
  const {
    sender,
    body,
    time,
  } = question;
  const reply = useCallback(() => replyTo(sender.id), [sender.id]);
  return (
    <Readable>
      <div className="d-flex">
        <ShowMessage
          icon={MdMessage}
          tooltip={`Received from ${sender.displayName}`}
          body={body}
          time={time}
        />
        <div className="flex-grow-1" />
        <span className="align-self-center mr-2">
          <Button
            variant="info"
            onClick={reply}
          >
            <Icon I={MdSend} />
            Reply
          </Button>
        </span>
      </div>
    </Readable>
  );
};

const ShowDirectMessage: React.FC<{
  message: DirectMessage;
}> = (props) => {
  const {
    message,
  } = props;
  const {
    sender,
    recipient,
    body,
    time,
  } = message;
  const senderName = `${sender.displayName}${sender.isMe ? ' (you)' : ''}`;
  return (
    <ShowMessage
      icon={MdSend}
      tooltip={`Sent by ${senderName} to ${recipient.displayName}`}
      body={body}
      time={time}
    />
  );
};

const Readable: React.FC = (props) => {
  const { children } = props;
  const [read, setRead] = useState(false);
  return (
    <Card
      border="warning"
      className={read && 'border-0'}
    >
      <div>
        {children}
        <span
          className={`${read ? 'd-none' : ''} float-right align-self-center`}
        >
          <Button
            variant="warning"
            onClick={() => setRead(true)}
          >
            <Icon I={FaCheck} />
            Mark as read
          </Button>
        </span>
      </div>
    </Card>
  );
};

const SingleMessage: React.FC<{
  message: Message;
  replyTo: (userId: number) => void;
}> = (props) => {
  const {
    message,
    replyTo,
  } = props;
  switch (message.type) {
    case MessageType.Direct:
      return <ShowDirectMessage message={message} />;
    case MessageType.Question:
      return <ShowQuestion replyTo={replyTo} question={message} />;
    case MessageType.Room:
      return <ShowRoomAnnouncement announcement={message} />;
    case MessageType.Version:
      return <ShowVersionAnnouncement announcement={message} />;
    case MessageType.Exam:
      return <ShowExamAnnouncement announcement={message} />;
    default:
      throw new ExhaustiveSwitchError(message);
  }
};

type FilterVals = { value: string; label: string; };

const ShowMessages: React.FC<{
  replyTo: (userId: number) => void;
  receivedOnly?: boolean;
  sentOnly?: boolean;
  sent: DirectMessage[];
  questions: Question[];
  version: VersionAnnouncement[];
  room: RoomAnnouncement[];
  exam: ExamAnnouncement[];
}> = (props) => {
  const {
    replyTo,
    receivedOnly = false,
    sentOnly = false,
    questions,
    sent,
    version,
    room,
    exam,
  } = props;
  const [filter, setFilter] = useState<FilterVals>(undefined);
  let all: Array<Message> = [];
  if (!receivedOnly) {
    all = all
      .concat(sent)
      .concat(version)
      .concat(room)
      .concat(exam);
  }
  if (!sentOnly) {
    all = all.concat(questions);
  }

  const filterSet = all.reduce((acc, m) => {
    let option;
    switch (m.type) {
      case MessageType.Direct:
        option = m.recipient.displayName;
        break;
      case MessageType.Question:
        option = m.sender.displayName;
        break;
      case MessageType.Room:
        option = m.room.name;
        break;
      case MessageType.Version:
        option = m.version.name;
        break;
      case MessageType.Exam:
        break;
      default:
        throw new ExhaustiveSwitchError(m);
    }
    if (option) {
      return acc.add(option);
    }
    return acc;
  }, new Set<FilterVals>());
  const filterOptions = [];
  filterSet.forEach((o) => {
    filterOptions.push({ value: o, label: o });
  });

  if (filter) {
    all = all.filter((m) => {
      switch (m.type) {
        case MessageType.Direct:
          return m.recipient.displayName === filter.value;
        case MessageType.Question:
          return m.sender.displayName === filter.value;
        case MessageType.Room:
          return m.room.name === filter.value;
        case MessageType.Version:
          return m.version.name === filter.value;
        case MessageType.Exam:
          return true;
        default:
          throw new ExhaustiveSwitchError(m);
      }
    });
  }
  all.sort((a, b) => b.time.diff(a.time).milliseconds);

  return (
    <>
      <Form.Group className="d-flex" controlId="message-filter">
        <Form.Label column sm="auto" className="pl-0">Filter by:</Form.Label>
        <Col>
          <Select
            classNamePrefix="filterMessages"
            isClearable
            placeholder="Choose selection criteria..."
            value={filter}
            onChange={(value: FilterVals, _action) => {
              setFilter(value);
            }}
            options={filterOptions}
          />
        </Col>
      </Form.Group>
      <div className="content-wrapper h-100">
        <div className="content overflow-auto-y">
          {all.map((m) => (
            <SingleMessage key={`${m.type}-${m.id}`} replyTo={replyTo} message={m} />
          ))}
        </div>
      </div>
    </>
  );
};

enum MessagesTab {
  Timeline = 'timeline',
  Received = 'received',
  Sent = 'sent',
}

const Loaded: React.FC<{
  selectedRecipient: MessageFilterOption;
  setSelectedRecipient: (option: MessageFilterOption) => void;
  messageRef: React.Ref<HTMLTextAreaElement>;
  replyTo: (userId: number) => void;
  refresh: () => void;
  response: Response;
  recipientOptions: RecipientOptions;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    messageRef,
    replyTo,
    refresh,
    response,
    recipientOptions,
  } = props;
  const {
    sent,
    questions,
    version,
    room,
    exam,
  } = response;
  useEffect(() => {
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [refresh]);
  const [tabName, setTabName] = useState<MessagesTab>(MessagesTab.Timeline);

  return (
    <Tab.Container activeKey={tabName}>
      <div className="wrapper h-100">
        <div className="inner-wrapper">
          <h2>Messages</h2>
          <Nav
            variant="tabs"
            activeKey={tabName}
            onSelect={(key) => setTabName(key)}
          >
            <Nav.Item>
              <Nav.Link
                eventKey={MessagesTab.Timeline}
              >
                <Icon I={FaList} />
                <span className="ml-2">
                  Timeline
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey={MessagesTab.Received}
              >
                <Icon I={FaInbox} />
                <span className="ml-2">
                  Received
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey={MessagesTab.Sent}
              >
                <Icon I={MdSend} />
                <span className="ml-2">
                  Sent
                </span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <div className="content-wrapper border border-top-0 rounded-bottom">
            <div className="content h-100">
              <Tab.Content className="p-3 h-100">
                <Tab.Pane eventKey={MessagesTab.Timeline} className="h-100">
                  <div className="wrapper h-100">
                    <div className="inner-wrapper h-100">
                      <ShowMessages
                        replyTo={replyTo}
                        sent={sent}
                        questions={questions}
                        version={version}
                        room={room}
                        exam={exam}
                      />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey={MessagesTab.Received} className="h-100">
                  <div className="wrapper h-100">
                    <div className="inner-wrapper h-100">
                      <ShowMessages
                        replyTo={replyTo}
                        sent={sent}
                        questions={questions}
                        version={version}
                        room={room}
                        exam={exam}
                        receivedOnly
                      />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey={MessagesTab.Sent} className="h-100">
                  <div className="wrapper h-100">
                    <div className="inner-wrapper h-100">
                      <ShowMessages
                        replyTo={replyTo}
                        sent={sent}
                        questions={questions}
                        version={version}
                        room={room}
                        exam={exam}
                        sentOnly
                      />
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </div>
          </div>
          <div>
            <SendMessage
              recipientOptions={recipientOptions}
              selectedRecipient={selectedRecipient}
              setSelectedRecipient={setSelectedRecipient}
              refresh={refresh}
              messageRef={messageRef}
            />
          </div>
        </div>
      </div>
    </Tab.Container>
  );
};

const ExamMessages: React.FC<{
  selectedRecipient: MessageFilterOption;
  setSelectedRecipient: (option: MessageFilterOption) => void;
  messageRef: React.Ref<HTMLTextAreaElement>;
  replyTo: (userId: number) => void;
  recipientOptions: RecipientOptions;
  examId: number;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    messageRef,
    replyTo,
    recipientOptions,
    examId,
  } = props;
  const [refresher, refresh] = useRefresher();
  const res = useExamMessages(examId, [refresher]);
  switch (res.type) {
    case 'ERROR':
      return (
        <div className="text-danger">
          <p>Error</p>
          <small>{res.text}</small>
        </div>
      );
    case 'LOADING':
    case 'RESULT':
      return (
        <Loading loading={res.type === 'LOADING'} className="h-100">
          <Loaded
            recipientOptions={recipientOptions}
            refresh={refresh}
            response={res.type === 'RESULT' ? res.response : {
              sent: [],
              questions: [],
              version: [],
              exam: [],
              room: [],
            }}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            messageRef={messageRef}
            replyTo={replyTo}
          />
        </Loading>
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

interface MessageFilterOption {
  value: Recipient;
  label: string;
}

const SendMessageButton: React.FC<{
  recipient: Recipient;
  message: string;
  refresh: () => void;
  onSuccess: () => void;
}> = (props) => {
  const {
    recipient,
    message,
    refresh,
    onSuccess,
  } = props;
  const { examId } = useParams();
  const { alert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const disabled = message === '' || loading;
  const disabledMessage = loading ? 'Loading...' : 'Enter a message to send';
  return (
    <Loading loading={loading}>
      <TooltipButton
        placement="top"
        disabled={disabled}
        disabledMessage={disabledMessage}
        variant="success"
        onClick={() => {
          setLoading(true);
          sendMessage(examId, recipient, message).then((res) => {
            if (res.success === true) {
              alert({
                variant: 'success',
                message: 'Message sent.',
                autohide: true,
              });
              setLoading(false);
              onSuccess();
              refresh();
            } else {
              throw new Error(res.reason);
            }
          }).catch((err) => {
            alert({
              variant: 'danger',
              title: 'Error sending message',
              message: err.message,
            });
            setLoading(false);
          });
        }}
      >
        <Icon I={MdSend} />
        Send
      </TooltipButton>
    </Loading>
  );
};

type RecipientOptions = {
  label: string;
  options: MessageFilterOption[];
}[]

const SendMessage: React.FC<{
  selectedRecipient: MessageFilterOption;
  setSelectedRecipient: (option: MessageFilterOption) => void;
  recipientOptions: RecipientOptions;
  refresh: () => void;
  messageRef: React.Ref<HTMLTextAreaElement>;
}> = (props) => {
  const {
    selectedRecipient,
    setSelectedRecipient,
    recipientOptions,
    refresh,
    messageRef,
  } = props;
  const [message, setMessage] = useState('');
  const resetVals = useCallback(() => {
    setMessage('');
  }, []);
  return (
    <>
      <h2>Send message</h2>
      <Form.Group as={Row} controlId="message-recipient-box">
        <Form.Label column sm="auto">To:</Form.Label>
        <Col>
          <Select
            placeholder="Choose selection criteria..."
            value={selectedRecipient}
            onChange={(value: MessageFilterOption) => {
              setSelectedRecipient(value);
            }}
            formatGroupLabel={formatGroupLabel}
            options={recipientOptions}
            menuPlacement="auto"
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm="auto">Message:</Form.Label>
        <Col>
          <Form.Control
            ref={messageRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            as="textarea"
          />
        </Col>
      </Form.Group>
      <Form.Group>
        <SendMessageButton
          onSuccess={resetVals}
          refresh={refresh}
          recipient={selectedRecipient.value}
          message={message}
        />
      </Form.Group>
    </>
  );
};

const SplitViewLoaded: React.FC<{
  examId: number;
  recipients: SplitRecipients;
}> = (props) => {
  const {
    examId,
    recipients,
  } = props;
  const { alert } = useContext(AlertContext);
  const messageRef = useRef<HTMLTextAreaElement>();
  const recipientOptions = useMemo<RecipientOptions>(() => ([
    {
      label: 'Entire exam',
      options: [{
        label: 'Entire exam',
        value: {
          type: MessageType.Exam,
          id: -1,
          name: 'Entire exam',
        },
      }],
    },
    {
      label: 'Rooms',
      options: recipients.rooms.map((r) => ({
        label: r.name,
        value: { ...r, type: MessageType.Room },
      })),
    },
    {
      label: 'Versions',
      options: recipients.versions.map((r) => ({
        label: r.name,
        value: { ...r, type: MessageType.Version },
      })),
    },
    {
      label: 'Students',
      options: recipients.students.map((r) => ({
        label: r.name,
        value: { ...r, type: MessageType.Direct },
      })),
    },
  ]), [recipients]);
  const [selectedRecipient, setSelectedRecipient] = useState<MessageFilterOption>(
    recipientOptions[0].options[0],
  );
  const replyTo = (userId: number) => {
    const recip = recipientOptions[3].options.find((option) => option.value.id === userId);
    if (!recip) {
      alert({
        variant: 'danger',
        title: 'Error replying to message',
        message: `Invalid User ID: ${userId}`,
      });
    }
    setSelectedRecipient(recip);
    if (messageRef.current) messageRef.current.focus();
  };
  return (
    <Row className="h-100">
      <Col sm={6}>
        <ExamAnomalies
          recipientOptions={recipientOptions}
          examId={examId}
          replyTo={replyTo}
        />
      </Col>
      <Col sm={6}>
        <ExamMessages
          recipientOptions={recipientOptions}
          examId={examId}
          selectedRecipient={selectedRecipient}
          setSelectedRecipient={setSelectedRecipient}
          messageRef={messageRef}
          replyTo={replyTo}
        />
      </Col>
    </Row>
  );
};

const ProctoringSplitView: React.FC<{
  examId: number;
}> = (props) => {
  const {
    examId,
  } = props;
  const res = useMessageRecipients(examId);
  switch (res.type) {
    case 'ERROR':
      return (
        <div className="text-danger">
          <p>Error</p>
          <small>{res.text}</small>
        </div>
      );
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <SplitViewLoaded
          examId={examId}
          recipients={res.response.recipients}
        />
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

const ExamProctoring: React.FC = () => {
  const {
    examId,
  } = useParams();
  const res = examsShow(examId);
  return (
    <Container fluid>
      <div className="wrapper vh-100">
        <div className="inner-wrapper">
          <RegularNavbar className="row" />
          <Row>
            <Col>
              <Loading loading={res.type !== 'RESULT'}>
                <h1>{res.type === 'RESULT' ? res.response.name : 'Exam'}</h1>
              </Loading>
            </Col>
          </Row>
          <div className="content-wrapper">
            <div className="content h-100">
              <ProctoringSplitView examId={examId} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ExamProctoring;
