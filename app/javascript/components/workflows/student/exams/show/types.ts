import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { MapStateToProps } from 'react-redux';
import { DateTime } from 'luxon';

export type ExamTakerAction =
  LoadExamAction |
  LockdownAction |
  PaginationAction |
  ContentsAction |
  SnapshotAction |
  MessagesAction |
  ProfQuestionAction;

export type Thunk = ThunkAction<void, ExamTakerState, unknown, ExamTakerAction>;
export type ExamTakerDispatch = ThunkDispatch<ExamTakerState, unknown, ExamTakerAction>;

export type MSTP<TStateProps, TOwnProps = Record<string, unknown>> =
  MapStateToProps<TStateProps, TOwnProps, ExamTakerState>;

export type MDTP<TDispatchProps, TOwnProps = Record<string, unknown>> =
  (dispatch: ExamTakerDispatch, ownProps: TOwnProps) => TDispatchProps;

export type StartExamResponse = AnomalousReponse | ContentsResponse;

export interface AnomalousReponse {
  type: 'ANOMALOUS';
}

interface RailsAllExamMessages {
  personal: RailsExamMessage[];
  room: RailsExamMessage[];
  version: RailsExamMessage[];
  exam: RailsExamMessage[];
}

export interface ContentsResponse {
  type: 'CONTENTS';

  time: RailsTimeInfo;

  exam: ExamVersion;

  answers: AnswersState;

  messages: RailsAllExamMessages;

  questions: RailsExamQuestion[];
}

export interface RailsExamQuestion {
  time: string;
  body: string;
  id: number;
}

export interface RailsExamMessage {
  time: string;
  body: string;
  type: ExamMessageType;
  id: number;
}

export interface PaginationCoordinates {
  question: number;
  part?: number;
}

export interface PaginationState {
  paginated: boolean;

  waypointsActive: boolean;

  spyCoords: PaginationCoordinates[];

  pageCoords: PaginationCoordinates[];

  // Index into pageCoords.
  page: number;

  // Index into spyCoords.
  spy: number;
}

export interface TogglePaginationAction {
  type: 'TOGGLE_PAGINATION';
}

export interface ViewQuestionAction {
  type: 'VIEW_QUESTION';
  coords: PaginationCoordinates;
}

export interface SpyQuestionAction {
  type: 'SPY_QUESTION';
  coords: PaginationCoordinates;
}

export interface PrevQuestionAction {
  type: 'PREV_QUESTION';
}

export interface NextQuestionAction {
  type: 'NEXT_QUESTION';
}

export interface ActivateWaypointsAction {
  type: 'ACTIVATE_WAYPOINTS';
  enabled: boolean;
}

export type LockdownAction =
  LockedDownAction | LockdownFailedAction | LockdownIgnoredAction;

export interface LockdownIgnoredAction {
  type: 'LOCKDOWN_IGNORED';
}

export interface LockedDownAction {
  type: 'LOCKED_DOWN';
}

export interface LockdownFailedAction {
  type: 'LOCKDOWN_FAILED';
  message: string;
}

export interface LoadExamAction {
  type: 'LOAD_EXAM';
  exam: ExamVersion;
  time: TimeInfo;
  answers: AnswersState;
  messages: AllExamMessages;
  questions: ProfQuestion[];
}

export type ContentsAction = UpdateAnswerAction | UpdateScratchAction;

export type PaginationAction =
  TogglePaginationAction |
  ViewQuestionAction |
  SpyQuestionAction |
  PrevQuestionAction |
  NextQuestionAction |
  ActivateWaypointsAction;

export interface UpdateAnswerAction {
  type: 'UPDATE_ANSWER';
  qnum: number;
  pnum: number;
  bnum: number;
  val: AnswerState;
}

export interface UpdateScratchAction {
  type: 'UPDATE_SCRATCH';
  val: string;
}

export interface SnapshotSaving {
  type: 'SNAPSHOT_SAVING';
}

export interface SnapshotSuccess {
  type: 'SNAPSHOT_SUCCESS';
}

export interface SnapshotFailure {
  type: 'SNAPSHOT_FAILURE';
  message: string;
}

export interface SnapshotSaveResult {
  lockout: boolean;
  messages: RailsAllExamMessages;
}

export type SnapshotAction = SnapshotSaving | SnapshotSuccess | SnapshotFailure;

export enum LockdownStatus {
  // Lockdown hasn't been requested yet.
  BEFORE = 'BEFORE',

  // Lockdown request failed.
  FAILED = 'FAILED',

  // Lockdown succeeded.
  LOCKED = 'LOCKED',

  // Lockdown ignored
  IGNORED = 'IGNORED',
}

export interface LockdownState {
  // Last lockdown event.
  status: LockdownStatus;

  // Error message to display.
  message: string;

  // Whether the exam has been loaded from the server.
  loaded: boolean;
}

export interface ContentsState {
  // Exam information.
  exam?: ExamVersion;

  // Exam timing information.
  time?: TimeInfo;

  // The student's current answers.
  answers?: AnswersState;
}

export interface ExamTakerState {
  // The current state of lockdown.
  lockdown: LockdownState;

  // The exam and student answers.
  contents: ContentsState;

  // Pagination information.
  pagination: PaginationState;

  // Professor messages / anouncements.
  messages: MessagesState;

  // Questions the current user has sent to professors.
  questions: ProfQuestionState;

  // The current state of saving snapshots.
  snapshot: SnapshotState;
}

export interface ProfQuestionState {
  lastId: number;
  questions: ProfQuestion[];
}

export interface ProfQuestion {
  id: number;

  time: DateTime;

  status: ProfQuestionStatus;

  body: string;
}

export type ProfQuestionStatus = 'SENDING' | 'FAILED' | 'SENT';

export type ProfQuestionAction =
  SetQuestionsAction |
  QuestionAskedAction | QuestionFailedAction | QuestionSucceededAction;

export interface SetQuestionsAction {
  type: 'SET_QUESTIONS';
  questions: ProfQuestion[];
}

export interface QuestionAskedAction {
  type: 'QUESTION_ASKED';
  id: number;
  body: string;
}

export interface QuestionFailedAction {
  type: 'QUESTION_FAILED';
  id: number;
}

export interface QuestionSucceededAction {
  type: 'QUESTION_SUCCEEDED';
  id: number;
}

export interface MessagesState {
  lastView: DateTime;

  messages: AllExamMessages;
}

export type ExamMessageType = 'personal' | 'room' | 'version' | 'exam';

export interface ExamMessage {
  body: string;

  time: DateTime;

  type: ExamMessageType;

  // Rails ID of the message.
  id: number;
}

export interface AllExamMessages {
  personal: ExamMessage[];
  room: ExamMessage[];
  version: ExamMessage[];
  exam: ExamMessage[];
}

export type MessagesAction = MessageReceivedAction | MessagesOpenedAction;

export interface MessagesOpenedAction {
  type: 'MESSAGES_OPENED';
}

export interface MessageReceivedAction {
  type: 'MESSAGE_RECEIVED';
  msg: ExamMessage;
}

export enum SnapshotStatus {
  // A snapshot is being fetched from the server.
  LOADING = 'LOADING',

  // The last snapshot was successfully fetched.
  SUCCESS = 'SUCCESS',

  // The last snapshot fetch was not successful.
  FAILURE = 'FAILURE',
}

export interface SnapshotState {
  // status of network requests
  status: SnapshotStatus;

  // message to display with FAILURE status
  message: string;
}

export interface AnswersState {
  // indices are [qnum][pnum][bnum]
  answers: AnswerState[][][];

  // The student's scratch space work.
  scratch: string;
}

export interface CodeInfo {
  type: 'Code';
  prompt: HTMLVal;
  lang: string;
  initial?: CodeInitial;
}

export type CodeInitial = CodeInitialFile | CodeInitialContents;

export interface CodeInitialFile {
  file: string;
}

export interface CodeInitialContents {
  text: string;

  // CodeMirror marks to apply
  marks: MarkDescription[];
}

export interface CodeInfoWithAnswer extends CodeInfo {
  answer: CodeState;
}

export interface MarkDescription {
  from: CodeMirror.Position;
  to: CodeMirror.Position;
  options: {
    inclusiveLeft: CodeMirror.TextMarkerOptions['inclusiveLeft'];
    inclusiveRight: CodeMirror.TextMarkerOptions['inclusiveRight'];
  };
}

export type CodeState = {
  text: string;
  marks: MarkDescription[];
};

export interface HTMLVal {
  type: 'HTML';
  value: string;
}

export interface HTMLValWithAnswer extends HTMLVal {
  answer: NoAnswerState;
}

export interface AllThatApplyInfo {
  type: 'AllThatApply';
  options: HTMLVal[];
  prompt: HTMLVal;
}

export interface AllThatApplyOptionWithAnswer {
  html: HTMLVal;
  answer: boolean;
}

export interface AllThatApplyInfoWithAnswer extends Omit<AllThatApplyInfo, 'options'> {
  options: AllThatApplyOptionWithAnswer[];
}

export type AllThatApplyState = boolean[];

export interface YesNoInfo {
  type: 'YesNo';
  yesLabel: string;
  noLabel: string;
  prompt: HTMLVal;
}

export interface YesNoInfoWithAnswer extends YesNoInfo {
  answer?: YesNoState;
}

export type YesNoState = boolean;

export interface CodeTagInfo {
  type: 'CodeTag';
  prompt: HTMLVal;
  choices: 'exam' | 'question' | 'part';
}

export interface CodeTagInfoWithAnswer extends CodeTagInfo {
  answer?: CodeTagState;
}

export interface CodeTagState {
  selectedFile?: string;
  lineNumber: number;
}

export interface MultipleChoiceInfo {
  type: 'MultipleChoice';
  prompt: HTMLVal;
  options: HTMLVal[];
}

export type MultipleChoiceState = number;

export interface MultipleChoiceInfoWithAnswer extends MultipleChoiceInfo {
  answer?: MultipleChoiceState;
}

export interface TextInfo {
  type: 'Text';
  prompt: HTMLVal;
}

export type TextState = string;

export interface TextInfoWithAnswer extends TextInfo {
  answer: TextState;
}

export interface MatchingInfo {
  type: 'Matching';
  promptsLabel?: HTMLVal;
  prompts: HTMLVal[];
  valuesLabel?: HTMLVal;
  values: HTMLVal[];
}

export interface MatchingState {
  [index: number]: number;
}

export interface MatchingPromptWithAnswer {
  html: HTMLVal;
  answer: number;
}

export interface MatchingInfoWithAnswer extends Omit<MatchingInfo, 'prompts'> {
  prompts: MatchingPromptWithAnswer[];
}

export type BodyItem =
  HTMLVal | AllThatApplyInfo | CodeInfo | YesNoInfo |
  CodeTagInfo | MultipleChoiceInfo |
  TextInfo | MatchingInfo;

export type BodyItemWithAnswer =
  HTMLValWithAnswer | AllThatApplyInfoWithAnswer | CodeInfoWithAnswer | YesNoInfoWithAnswer |
  CodeTagInfoWithAnswer | MultipleChoiceInfoWithAnswer |
  TextInfoWithAnswer | MatchingInfoWithAnswer;

export type AnswerState =
  AllThatApplyState | CodeState | YesNoState |
  CodeTagState | MultipleChoiceState | TextState | MatchingState |
  NoAnswerState;

export interface NoAnswerState {
  NO_ANS: true;
}

export interface PartInfo {
  name?: HTMLVal;
  description: HTMLVal;
  points: number;
  reference: FileRef[];
  body: BodyItem[];
}

export interface PartInfoWithAnswers extends Omit<PartInfo, 'body'> {
  body: BodyItemWithAnswer[];
}

export interface QuestionInfo {
  name?: HTMLVal;
  description: HTMLVal;
  separateSubparts: boolean;
  parts: PartInfo[];
  reference: FileRef[];
}

export interface QuestionInfoWithAnswers extends Omit<QuestionInfo, 'parts'> {
  parts: PartInfoWithAnswers[];
}

export interface RailsTimeInfo {
  began: string;
  ends: string;
}

export interface TimeInfo {
  began: DateTime;
  ends: DateTime;
}

export interface ExamVersion {
  questions: QuestionInfo[];
  reference?: FileRef[];
  instructions?: HTMLVal;
  files: ExamFile[];
}

export interface ExamVersionWithAnswers extends Omit<ExamVersion, 'questions'> {
  questions: QuestionInfoWithAnswers[];
}

export type FileRef = SingleFileRef | DirRef;

export interface SingleFileRef {
  type: 'file';

  // The full path of the file.
  path: string;
}

export interface DirRef {
  type: 'dir';

  // The full path of the directory.
  path: string;
}

// A tree of files, used in displaying treeview references.
export interface ExamSingleFile {
  filedir: 'file';

  // Label for the file.
  text: string;

  // path relative to root
  relPath: string;

  // Filename
  path: string;

  // The contents of the file.
  contents: string;

  // CodeMirror marks to apply
  marks: MarkDescription[];

  // The CodeMirror type for this file.
  type: string;
}

export interface ExamDir {
  filedir: 'dir';

  // Label for the directory (with trailing slash)
  text: string;

  // Dirname
  path: string;

  // path relative to root
  relPath: string;

  // Files within this directory.
  nodes: ExamFile[];
}

// Exam files can be single files or directories.
export type ExamFile = ExamSingleFile | ExamDir;

// Map from file path to file.
export interface FileMap {
  [path: string]: ExamFile;
}

export type AnomalyDetected = (reason: string, event: Event) => void;

export interface AnomalyListener {
  event: string;
  handler: (e: Event) => void;
}

export enum Policy {
  ignoreLockdown = 'IGNORE_LOCKDOWN',
  tolerateWindowed = 'TOLERATE_WINDOWED',
}

export function policyPermits(policy: readonly Policy[], query: Policy): boolean {
  return policy.find((p) => p === query) !== undefined;
}
