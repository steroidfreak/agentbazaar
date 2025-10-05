import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULT_DESIGN = 'retro';
const STORAGE_KEY = 'agentbazaar:design';

const designOptions = [
  { id: 'retro', label: 'Retro Terminal' },
  { id: 'modern', label: 'Modern Dev' },
];

const DesignContext = createContext(undefined);

export function DesignProvider({ children }) {
  const [design, setDesign] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_DESIGN;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored && designOptions.some((option) => option.id === stored)) {
      return stored;
    }

    return DEFAULT_DESIGN;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = design;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, design);
    }
  }, [design]);

  const value = useMemo(
    () => ({
      design,
      setDesign,
      designs: designOptions,
    }),
    [design],
  );

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const context = useContext(DesignContext);

  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }

  return context;
}
