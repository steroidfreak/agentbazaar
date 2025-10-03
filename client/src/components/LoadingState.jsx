export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(0, 255, 213, 0.1)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}
      />
      <span>{label}</span>
    </div>
  );
}