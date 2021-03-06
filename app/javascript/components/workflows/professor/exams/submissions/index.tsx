import React, { useState, useCallback, useContext } from 'react';
import {
  useParams,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { graphql } from 'react-relay';
import { BsListCheck } from 'react-icons/bs';
import { useQuery, useMutation } from 'relay-hooks';
import {
  AnswersState,
  ContentsState,
  ExamVersion,
} from '@student/exams/show/types';
import ExamViewer from '@proctor/registrations/show';
import { FinalizeDialog, finalizeItemMutation } from '@proctor/exams';
import { AlertContext } from '@hourglass/common/alerts';
import { examsFinalizeItemMutation } from '@proctor/exams/__generated__/examsFinalizeItemMutation.graphql';
import Icon from '@student/exams/show/components/Icon';
import { RenderError } from '@hourglass/common/boundary';
import { CurrentGrading } from '@professor/exams/types';

import { submissionsAllQuery, submissionsAllQueryResponse } from './__generated__/submissionsAllQuery.graphql';
import { submissionsOneQuery } from './__generated__/submissionsOneQuery.graphql';

type Registration = submissionsAllQueryResponse['exam']['registrations'][number];
const ExamSubmissions: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const res = useQuery<submissionsAllQuery>(
    graphql`
    query submissionsAllQuery($examId: ID!) {
      exam(id: $examId) {
        registrations {
          id
          user {
            displayName
          }
          started
          over
          final
        }
      }
    }
    `,
    { examId },
  );
  const [showModal, setShowModal] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<examsFinalizeItemMutation>(
    finalizeItemMutation,
    {
      onCompleted: () => {
        closeModal();
        alert({
          variant: 'success',
          title: 'Finalization successful',
          message: 'Finalized all students\' submissions.',
          autohide: true,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error finalizing all students',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const finalize = (subjectValue) => {
    mutate({
      variables: {
        input: {
          id: subjectValue,
          scope: 'out_of_time',
        },
      },
    });
  };
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.props) {
    return <p>Loading...</p>;
  }
  const {
    registrations,
  } = res.props.exam;
  const groups: {
    notStarted: Registration[],
    started: Registration[],
    over: Registration[],
    final: Registration[],
  } = {
    notStarted: [],
    started: [],
    over: [],
    final: [],
  };
  registrations.forEach((r) => {
    if (r.final) groups.final.push(r);
    else if (r.over) groups.over.push(r);
    else if (r.started) groups.started.push(r);
    else groups.notStarted.push(r);
  });
  const startedButNotFinished = groups.over.length > 0 || groups.started.length > 0;
  return (
    <>
      <h4>Completed submissions</h4>
      {groups.final.length === 0 ? (
        <i>No completed submissions yet</i>
      ) : (
        <ul>
          {groups.final.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {startedButNotFinished && (
        <div>
          <FinalizeDialog
            loading={loading}
            buttonText="Finalize all students' submissions who have run out of time"
            subjectName="all students who have run out of time"
            subjectValue={examId}
            showModal={showModal}
            closeModal={closeModal}
            finalize={finalize}
          />
          <Button
            variant="danger"
            onClick={openModal}
          >
            <Icon I={BsListCheck} />
            Finalize
          </Button>
        </div>
      )}
      {groups.over.length === 0 ? (
        null
      ) : (
        <>
          <h4>Out-of-time submissions</h4>
          <ul>
            {groups.over.map((reg) => (
              <li key={reg.id}>
                <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                  {reg.user.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <h4>Started submissions</h4>
      {groups.started.length === 0 ? (
        <i>No one is currently taking the exam</i>
      ) : (
        <ul>
          {groups.started.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <h4>Not-yet-started submissions</h4>
      {groups.notStarted.length === 0 ? (
        <i>Everyone has started</i>
      ) : (
        <ul>
          {groups.notStarted.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

const ExamSubmission: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const res = useQuery<submissionsOneQuery>(
    graphql`
    query submissionsOneQuery($registrationId: ID!) {
      registration(id: $registrationId) {
        currentAnswers
        currentGrading
        published
        user {
          displayName
        }
        exam { name }
        reviewExam
      }
    }
    `,
    { registrationId },
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.props) {
    return <p>Loading...</p>;
  }
  const { registration } = res.props;
  const {
    reviewExam,
    currentAnswers,
    currentGrading,
    published,
    user,
    exam,
  } = registration;
  if (currentAnswers === null && !published) {
    return (
      <>
        <h1>{`Submission for ${exam.name}`}</h1>
        <p>Your submission is not yet graded, and cannot be viewed at this time.</p>
      </>
    );
  }
  const parsedContents: ContentsState = {
    exam: reviewExam as ExamVersion,
    answers: currentAnswers as AnswersState,
  };
  return (
    <>
      <h1>{`Submission by ${user.displayName}`}</h1>
      <ExamViewer
        contents={parsedContents}
        currentGrading={currentGrading as CurrentGrading}
      />
    </>
  );
};

const Submissions: React.FC = () => (
  <Container>
    <Switch>
      <Route path="/exams/:examId/submissions/:registrationId">
        <ExamSubmission />
      </Route>
      <Route path="/exams/:examId/submissions">
        <ExamSubmissions />
      </Route>
    </Switch>
  </Container>
);

export default Submissions;
