import React from 'react';
import { useParams, Link, Route } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import NewExam from '@professor/exams/new';
import SyncCourse from '@professor/courses/sync';
import DocumentTitle from '@hourglass/common/documentTitle';
import { graphql } from 'react-relay';
import { useFragment, useQuery } from 'relay-hooks';
import { RenderError } from '@hourglass/common/boundary';
import { GroupedOptionsType } from 'react-select';
import { ImpersonateVal, ImpersonateUser } from '@hourglass/workflows/home';

import { showCourseQuery } from './__generated__/showCourseQuery.graphql';
import { show_courseExams$key } from './__generated__/show_courseExams.graphql';

const CourseExams: React.FC<{
  courseExams: show_courseExams$key;
}> = (props) => {
  const {
    courseExams,
  } = props;
  const res = useFragment(
    graphql`
    fragment show_courseExams on Exam @relay(plural: true) {
      id
      name
    }
    `,
    courseExams,
  );
  return (
    <>
      <h2>Exams</h2>
      <ul>
        {res.map((exam) => (
          <li key={exam.id}>
            <Link
              to={`/exams/${exam.id}/admin`}
            >
              {exam.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

const ShowCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const res = useQuery<showCourseQuery>(
    graphql`
    query showCourseQuery($courseId: ID!) {
      course(id: $courseId) {
        title
        id
        students {
          id
          displayName
        }
        staff {
          id
          displayName
        }
        professors {
          id
          displayName
        }
        exams {
          ...show_courseExams
        }
      }
    }
    `,
    { courseId },
  );
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.props) {
    return <Container><p>Loading...</p></Container>;
  }
  const userOptions: GroupedOptionsType<ImpersonateVal> = [
    {
      label: 'Students',
      options: res.props.course.students.map((user) => ({
        label: user.displayName,
        value: user.id,
      })),
    },
    {
      label: 'Staff',
      options: res.props.course.staff.map((user) => ({
        label: user.displayName,
        value: user.id,
      })),
    },
    {
      label: 'Professors',
      options: res.props.course.professors.map((user) => ({
        label: user.displayName,
        value: user.id,
      })),
    },
  ];
  return (
    <Container>
      <div className="d-flex align-items-center justify-content-between">
        <h1>
          {res.props.course.title}
        </h1>
        <div>
          <Link to={`/courses/${courseId}/sync`}>
            <Button
              variant="danger"
            >
              Sync
            </Button>
          </Link>
          <Link to={`/courses/${courseId}/new`} className="ml-1">
            <Button
              variant="success"
            >
              New Exam
            </Button>
          </Link>
        </div>
      </div>
      <Route path="/courses/:courseId" exact>
        <DocumentTitle title={res.props.course.title}>
          <CourseExams courseExams={res.props.course.exams} />
          <ImpersonateUser
            userOptions={userOptions}
            courseId={res.props.course.id}
          />
        </DocumentTitle>
      </Route>
      <Route path="/courses/:courseId/sync" exact>
        <DocumentTitle title={`Sync - ${res.props.course.title}`}>
          <SyncCourse courseId={res.props.course.id} />
        </DocumentTitle>
      </Route>
      <Route path="/courses/:courseId/new" exact>
        <DocumentTitle title={`New Exam - ${res.props.course.title}`}>
          <NewExam courseId={res.props.course.id} />
        </DocumentTitle>
      </Route>
    </Container>
  );
};

export default ShowCourse;
