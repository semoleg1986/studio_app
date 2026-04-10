import type { LocaleCode } from '~/shared/lib/preferences/types';

export const MESSAGES: Record<LocaleCode, Record<string, string>> = {
  ru: {
    "app.name": "Curs Studio",
    "page.hero.title": "Студия контента курсов",
    "page.hero.subtitle": "Создавайте модули, уроки и учебные материалы в едином редакторе.",
    "page.status": "Статус API",
    "status.ok": "работает",
    "status.degraded": "нестабильно",
    "catalog.title": "Курсы в разработке",
    "catalog.empty": "Черновики курсов скоро появятся.",
    "catalog.level": "Уровень",
    "catalog.lessons": "Уроков",
    "catalog.level.beginner": "Начальный",
    "catalog.level.intermediate": "Средний",
    "catalog.level.advanced": "Продвинутый",
    "catalog.level.unknown": "Без уровня",
    "settings.title": "Настройки интерфейса",
    "settings.subtitle": "Выберите язык и тему оформления для студии контента.",
    "settings.language": "Язык",
    "settings.theme": "Тема",
    "settings.theme.system": "Системная",
    "settings.theme.light": "Светлая",
    "settings.theme.dark": "Темная",
    "footer.settings": "Настройки",
    "footer.copyright": "Все права защищены."
  },
  en: {
    "app.name": "Curs Studio",
    "page.hero.title": "Course content studio",
    "page.hero.subtitle": "Create modules, lessons and learning assets in one editor.",
    "page.status": "API status",
    "status.ok": "healthy",
    "status.degraded": "degraded",
    "catalog.title": "Courses in production",
    "catalog.empty": "Course drafts are coming soon.",
    "catalog.level": "Level",
    "catalog.lessons": "Lessons",
    "catalog.level.beginner": "Beginner",
    "catalog.level.intermediate": "Intermediate",
    "catalog.level.advanced": "Advanced",
    "catalog.level.unknown": "Unspecified",
    "settings.title": "Interface settings",
    "settings.subtitle": "Choose language and theme for the content studio.",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.theme.system": "System",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "footer.settings": "Settings",
    "footer.copyright": "All rights reserved."
  }
};

export function translate(locale: LocaleCode, key: string): string {
  return MESSAGES[locale][key] ?? MESSAGES.ru[key] ?? key;
}
