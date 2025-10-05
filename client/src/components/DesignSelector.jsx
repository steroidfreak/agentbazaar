import { useId } from 'react';
import { useDesign } from '../context/DesignContext.jsx';

export default function DesignSelector() {
  const { design, setDesign, designs } = useDesign();
  const labelId = useId();

  const handleChange = (event) => {
    const nextDesign = event.target.value;

    if (designs.some((option) => option.id === nextDesign)) {
      setDesign(nextDesign);
    }
  };

  return (
    <label className="design-selector" htmlFor={labelId}>
      <span className="design-selector__label">Design</span>
      <select id={labelId} className="design-selector__select" value={design} onChange={handleChange}>
        {designs.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
