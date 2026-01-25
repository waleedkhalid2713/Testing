import * as React from "react";

type Theme = "dark" | "light";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: ThemeProviderProps) {
  // Theme switching removed: the app is locked to a single theme.
  const theme = defaultTheme;
  const setTheme = React.useCallback((_next: Theme) => {
    // no-op
  }, []);

  React.useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
