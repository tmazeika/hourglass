import { AnswersState } from '@hourglass/types';
import { Action } from '@hourglass/actions';

export function answers(state: AnswersState = {}, action: Action): AnswersState {
  switch (action.type) {
    case 'UPDATE_ANSWER':
      const ret = {
        ...state,
      };
      let cur = ret;
      for (let i = 0; i < action.path.length - 1; i++) {
        cur[action.path[i]] = { ...cur[action.path[i]] };
        cur = cur[action.path[i]];
      }
      cur[action.path[action.path.length - 1]] = action.val;
      return ret;
    case 'LOAD_SNAPSHOT':
      return action.answers;
    default:
      return state;
  }
}
