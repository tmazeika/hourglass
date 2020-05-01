import {
  ExamTakerState,
  SnapshotFailure,
  SnapshotSuccess,
  SnapshotSaveResult,
  SnapshotSaving,
  AnswersState,
  StatePath,
  AnswerState,
  UpdateAnswerAction,
  ContentsState,
  StartExamAction,
} from '@hourglass/types';
import { getCSRFToken } from '@hourglass/helpers';
import Routes from '@hourglass/routes';
import { lock } from '@hourglass/lockdown';

export function startExam(contents: ContentsState): StartExamAction {
  return {
    type: 'START_EXAM',
    contents,
  };
}

export function fetchContents(examID: number) {
  return (dispatch) => {
    const url = Routes.start_exam_path(examID);
    fetch(url)
      .then((result) => result.json() as Promise<ContentsState>)
      .then((result) => {
        lock();
        dispatch(startExam(result));
      }).catch((err) => {
        // TODO: store a message to tell the user what went wrong
        console.error('Error starting exam', err);
      });
  };
}

export function updateAnswer(path: StatePath, val: AnswerState): UpdateAnswerAction {
  return {
    type: 'UPDATE_ANSWER',
    path,
    val,
  };
}

function snapshotFailure(message): SnapshotFailure {
  return {
    type: 'SNAPSHOT_FAILURE',
    message,
  };
}


function snapshotSuccess(): SnapshotSuccess {
  return {
    type: 'SNAPSHOT_SUCCESS',
  };
}

function snapshotSaving(): SnapshotSaving {
  return {
    type: 'SNAPSHOT_SAVING',
  };
}

export function saveSnapshot(examID) {
  return (dispatch, getState) => {
    const { contents }: ExamTakerState = getState();
    const { answers } = contents;
    dispatch(snapshotSaving());
    const url = Routes.save_snapshot_exam_path(examID);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      body: JSON.stringify({ answers }),
      credentials: 'same-origin',
    })
      .then((result) => result.json() as Promise<SnapshotSaveResult>)
      .then((result) => {
        const { lockout } = result;
        console.log('lockout: ', lockout);
        dispatch(snapshotSuccess());
      }).catch((err) => {
        console.error('Snapshot save failure', err);
        const error = 'Error saving snapshot to server.';
        dispatch(snapshotFailure(error));
      });
  };
}
