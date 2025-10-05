export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="dos-loading">
      <span>{label.toUpperCase()}</span>
      <span className="dos-loading__cursor">▌</span>
    </div>
  );
}
