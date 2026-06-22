export const appThemeStorageKey = "brandbrain-theme-mode";

export type AppThemeMode = "dark" | "light";

export function isAppThemeMode(value: unknown): value is AppThemeMode {
  return value === "dark" || value === "light";
}
