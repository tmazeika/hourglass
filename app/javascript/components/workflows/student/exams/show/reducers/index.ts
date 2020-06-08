import { combineReducers } from 'redux';

import lockdown from './lockdown';
import contents from './contents';
import pagination from './pagination';
import messages from './messages';
import snapshot from './snapshot';
import questions from './questions';

export default combineReducers({
  lockdown,
  contents,
  pagination,
  messages,
  snapshot,
  questions,
});