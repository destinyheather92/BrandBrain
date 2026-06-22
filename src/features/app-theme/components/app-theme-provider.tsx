"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  appThemeStorageKey,
  type AppThemeMode,
  isAppThemeMode
} from "../app-theme.constants";

export { appThemeStorageKey };
export type { AppThemeMode };

type AppThemeContextValue = {
  mode: AppThemeMode;
  setThemeMode: (mode: AppThemeMode) => void;
  toggleThemeMode: () => void;
};

const fallbackThemeContext: AppThemeContextValue = {
  mode: "dark",
  setThemeMode() {},
  toggleThemeMode() {}
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<AppThemeMode>(() => readStoredThemeMode());

  useEffect(() => {
    applyThemeModeToDocument(mode);
    persistThemeMode(mode);
  }, [mode]);

  const setThemeMode = useCallback((nextMode: AppThemeMode) => {
    setMode(nextMode);
  }, []);
  const toggleThemeMode = useCallback(() => {
    setMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  }, []);
  const contextValue = useMemo(
    () => ({
      mode,
      setThemeMode,
      toggleThemeMode
    }),
    [mode, setThemeMode, toggleThemeMode]
  );

  return <AppThemeContext.Provider value={contextValue}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(AppThemeContext) ?? fallbackThemeContext;
}

function readStoredThemeMode(): AppThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const storedMode = window.localStorage.getItem(appThemeStorageKey);

    return isAppThemeMode(storedMode) ? storedMode : "dark";
  } catch {
    return "dark";
  }
}

function persistThemeMode(mode: AppThemeMode) {
  try {
    window.localStorage.setItem(appThemeStorageKey, mode);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function applyThemeModeToDocument(mode: AppThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.classList.toggle("bb-theme-dark", mode === "dark");
  document.documentElement.classList.toggle("bb-theme-light", mode === "light");
  document.documentElement.style.colorScheme = mode;
}
