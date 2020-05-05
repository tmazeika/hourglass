import React from 'react';
import { SnapshotStatus } from '@hourglass/types';
import { MdCloudDone, MdCloudOff, MdError } from 'react-icons/md';
import { useExamInfoContext } from '@hourglass/context';

interface SnapshotInfoProps {
  status: SnapshotStatus;
  message: string;
}

const SnapshotInfo: React.FC<SnapshotInfoProps> = (props) => {
  const {
    status,
    message,
  } = props;
  const size = '1.5em';
  const { id } = useExamInfoContext().exam;
  switch (status) {
    case SnapshotStatus.LOADING:
      return (
        <button className="btn btn-info" type="button" disabled>
          <span className="spinner-border align-middle" title="Saving answers..." style={{ width: size, height: size }} role="status" />
        </button>
      );
    case SnapshotStatus.SUCCESS:
      return (
        <button className="btn btn-success" type="button" disabled>
          <MdCloudDone size={size} role="status" title="Answers saved to server" />
        </button>
      );
    case SnapshotStatus.FAILURE:
      return (
        <button className="btn btn-danger" type="button" disabled role="status">
          <MdError title={message} size={size} />
        </button>
      );
    case SnapshotStatus.DISABLED:
      return (
        <button className="btn btn-secondary" type="button" disabled role="status">
          <MdCloudOff title={message} size={size} />
        </button>
      );
    default:
      throw new Error('CASE NOT HANDLED');
  }
};

export default SnapshotInfo;
