export default function AdSlot({ label = 'Ad Space' }) {
  return (
    <div className="ad-slot">
      <span>{label}</span>
      <small style={{ marginTop: '0.5rem', display: 'block', opacity: 0.7 }}>Configure Google AdSense or affiliate embed</small>
    </div>
  );
}