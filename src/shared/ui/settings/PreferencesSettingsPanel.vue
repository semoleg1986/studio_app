<template>
  <section class="settings">
    <h2>{{ t("settings.title") }}</h2>
    <p class="subtitle">{{ t("settings.subtitle") }}</p>

    <div class="control">
      <span class="control__label">{{ t("settings.language") }}</span>
      <div class="chip-group">
        <button
          v-for="code in locales"
          :key="code"
          type="button"
          class="chip"
          :class="{ 'chip--active': locale === code }"
          @click="setLocale(code)"
        >
          {{ code.toUpperCase() }}
        </button>
      </div>
    </div>

    <div class="control">
      <span class="control__label">{{ t("settings.theme") }}</span>
      <div class="chip-group">
        <button
          type="button"
          class="chip"
          :class="{ 'chip--active': themeMode === 'system' }"
          @click="setThemeMode('system')"
        >
          {{ t("settings.theme.system") }}
        </button>
        <button
          type="button"
          class="chip"
          :class="{ 'chip--active': themeMode === 'light' }"
          @click="setThemeMode('light')"
        >
          {{ t("settings.theme.light") }}
        </button>
        <button
          type="button"
          class="chip"
          :class="{ 'chip--active': themeMode === 'dark' }"
          @click="setThemeMode('dark')"
        >
          {{ t("settings.theme.dark") }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LocaleCode } from "~/shared/lib/preferences/types";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";

const locales: LocaleCode[] = ["ru", "en"];
const { locale, themeMode, setLocale, setThemeMode, t } = usePreferences();
</script>

<style scoped>
.settings {
  border: 1px solid var(--c-border);
  border-radius: 14px;
  background: var(--c-surface);
  padding: 1rem;
}

h2 {
  margin: 0;
}

.subtitle {
  margin: 0.35rem 0 1rem;
  color: var(--c-muted);
}

.control {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.8rem;
}

.control__label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--c-muted);
}

.chip-group {
  display: inline-flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.chip {
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: var(--c-surface);
  color: var(--c-fg);
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.chip--active {
  border-color: var(--c-accent);
  box-shadow: inset 0 0 0 1px var(--c-accent);
}
</style>
