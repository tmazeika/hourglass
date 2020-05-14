import {
  PaginationState, ExamTakerAction, PaginationCoordinates,
} from '@hourglass/types';

const sameCoords = (a: PaginationCoordinates) => (b: PaginationCoordinates): boolean => (
  a.question === b.question && a.part === b.part
);

const wrap = (max: number, wrappee: number): number => (wrappee + max) % max;

export default (state: PaginationState = {
  paginated: false,
  spyCoords: [],
  pageCoords: [],
  page: 0,
  spy: 0,
}, action: ExamTakerAction): PaginationState => {
  switch (action.type) {
    case 'TOGGLE_PAGINATION':
      return {
        ...state,
        paginated: !state.paginated,
        page: 0,
        spy: state.spyCoords.findIndex(sameCoords(state.pageCoords[0])),
      };
    case 'VIEW_QUESTION': {
      // If paginated, find the most specific page and switch to it.
      let { page } = state;
      if (state.paginated) {
        let idx = state.pageCoords.findIndex(sameCoords(action.coords));
        if (idx === -1) {
          idx = state.pageCoords.findIndex((c) => c.question === action.coords.question);
        }
        page = idx;
      }
      return {
        ...state,
        page,
      };
    }
    case 'SPY_QUESTION':
      return {
        ...state,
        spy: state.spyCoords.findIndex(sameCoords(action.coords)),
      };
    case 'PREV_QUESTION': {
      const page = wrap(state.pageCoords.length, state.page - 1);
      return {
        ...state,
        page,
        spy: state.spyCoords.findIndex(sameCoords(state.pageCoords[page])),
      };
    }
    case 'NEXT_QUESTION': {
      const page = wrap(state.pageCoords.length, state.page + 1);
      return {
        ...state,
        page,
        spy: state.spyCoords.findIndex(sameCoords(state.pageCoords[page])),
      };
    }
    case 'LOAD_EXAM': {
      const pageCoords = [];
      const spyCoords = [];
      action.exam.questions.forEach((q, qnum) => {
        const thisQ = {
          question: qnum,
        };
        spyCoords.push(thisQ);
        if (!q.separateSubparts) pageCoords.push(thisQ);
        q.parts.forEach((_p, pnum) => {
          const thisP = {
            question: qnum,
            part: pnum,
          };
          spyCoords.push(thisP);
          if (q.separateSubparts) pageCoords.push(thisP);
        });
      });
      return {
        ...state,
        spyCoords,
        pageCoords,
        page: 0,
        spy: 0,
      };
    }
    default:
      return state;
  }
};
