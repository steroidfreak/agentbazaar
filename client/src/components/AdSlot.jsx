export default function AdSlot({ label = 'Ad Space' }) {
  return (
    <div className="ad-slot glass-panel" style={{ padding: '1.5rem' }}>
      <span>{label.toUpperCase()}</span>
      <small style={{ marginTop: '0.5rem', display: 'block', opacity: 0.7 }}>
        Insert your retro banners or ASCII art promos here
      </small>
    </div>
  );
}
