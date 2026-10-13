import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';
type Density = 'comfortable' | 'compact';

interface ThemeContextType {
  theme: Theme;
  density: Density;
  toggleTheme: () => void;
  toggleDensity: () => void;
  setTheme: (t: Theme) => void;
  setDensity: (d: Density) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('aionos_theme');
    // If the user previously had dark stored from the old default, honor the new light theme request
    if (saved === 'dark' && !sessionStorage.getItem('aionos_theme_toggled')) {
      return 'light';
    }
    return (saved as Theme) || 'light';
  });

  const [density, setDensity] = useState<Density>(() => {
    return (localStorage.getItem('aionos_density') as Density) || 'comfortable';
  });

  useEffect(() => {
    localStorage.setItem('aionos_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('aionos_density', density);
  }, [density]);

  const toggleTheme = () => {
    sessionStorage.setItem('aionos_theme_toggled', 'true');
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleDensity = () => {
    setDensity(prev => (prev === 'comfortable' ? 'compact' : 'comfortable'));
  };

  return (
    <ThemeContext.Provider value={{ theme, density, toggleTheme, toggleDensity, setTheme, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
