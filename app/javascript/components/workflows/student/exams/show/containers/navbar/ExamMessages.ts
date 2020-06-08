import { connect } from 'react-redux';
import { MSTP, MDTP, ExamMessage } from '@student/exams/show/types';
import ExamMessages from '@student/exams/show/components/navbar/ExamMessages';
import { messagesOpened } from '@student/exams/show/actions';

const mapStateToProps: MSTP<{
  messages: ExamMessage[];
  unread: boolean;
}> = (state) => ({
  messages: state.messages.messages,
  unread: state.messages.unread,
});

const mapDispatchToProps: MDTP<{
  onMessagesOpened: () => void;
}> = (dispatch) => ({
  onMessagesOpened: (): void => {
    dispatch(messagesOpened());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamMessages);