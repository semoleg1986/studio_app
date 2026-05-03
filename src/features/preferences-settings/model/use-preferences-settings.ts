import type { LocaleCode } from "~/shared/lib/preferences/types";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";

const locales: LocaleCode[] = ["ru", "en"];

export function usePreferencesSettings() {
  const { locale, themeMode, setLocale, setThemeMode, t } = usePreferences();

  return {
    locale,
    locales,
    setLocale,
    setThemeMode,
    t,
    themeMode
  };
}
