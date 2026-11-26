const LABELS = {
  CONFIRMED: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  AVAILABLE: 'Free',
  BUSY: 'On trip',
  OFFLINE: 'Offline',
};

export default function StatusMark({ status }) {
  return <span className={`status status-${String(status).toLowerCase()}`}>{LABELS[status] || status}</span>;
}
