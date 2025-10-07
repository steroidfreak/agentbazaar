export default function AdSlot({ label = 'Ad Space', children }) {
  const hasCustomContent = Boolean(children);

  return (
    <div className="ad-slot glass-panel" style={{ padding: '1.5rem' }}>
      <span className="ad-slot-label">{label.toUpperCase()}</span>
      {hasCustomContent ? (
        <div className="ad-slot-content">{children}</div>
      ) : (
        <small style={{ display: 'block', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          Insert your retro banners or ASCII art promos here
        </small>
      )}
    </div>
  );
}
