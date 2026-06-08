<template>
  <aside class="icon-rail" aria-label="Studio navigation">
    <NuxtLink class="rail-logo" to="/" aria-label="Curs Studio">C</NuxtLink>
    <nav class="rail-nav" aria-label="Studio sections">
      <button class="rail-action" type="button" title="Обзор">▦</button>
      <button class="rail-action rail-action--active" type="button" title="Курсы">▤</button>
      <button class="rail-action" type="button" title="Пользователи">◎</button>
      <button class="rail-action" type="button" title="Аналитика">▧</button>
      <button class="rail-action" type="button" title="Теги">◇</button>
    </nav>
    <div class="rail-bottom">
      <button
        :class="['rail-action', { 'rail-action--open': settingsOpen }]"
        type="button"
        title="Настройки"
        @click="settingsOpen = !settingsOpen"
      >
        ⚙
      </button>
      <div v-if="settingsOpen" class="settings-popover" role="dialog" aria-label="Настройки">
        <strong>Тема</strong>
        <div class="theme-switcher" role="group" aria-label="Тема Studio">
          <button
            type="button"
            :class="{ active: themeMode === 'system' }"
            @click="setTheme('system')"
          >
            Системная
          </button>
          <button
            type="button"
            :class="{ active: themeMode === 'light' }"
            @click="setTheme('light')"
          >
            Светлая
          </button>
          <button type="button" :class="{ active: themeMode === 'dark' }" @click="setTheme('dark')">
            Темная
          </button>
        </div>
      </div>
      <div class="rail-user-wrap">
        <button
          class="rail-user"
          type="button"
          title="Выйти"
          :disabled="authPending"
          @click="$emit('logout')"
        >
          <span>{{ userInitial }}</span>
          <span class="rail-user-exit" aria-hidden="true"> ↩ </span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { ThemeMode } from "~/shared/lib/preferences/types";

const emit = defineEmits<{
  logout: [];
  "set-theme": [theme: ThemeMode];
}>();

defineProps<{
  authPending: boolean;
  themeMode: ThemeMode;
  userInitial: string;
}>();

const settingsOpen = ref(false);

function setTheme(theme: ThemeMode) {
  emit("set-theme", theme);
  settingsOpen.value = false;
}
</script>

<style scoped>
.icon-rail {
  display: grid;
  min-height: 0;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  padding: 1.05rem 0.85rem;
  border-right: 1px solid var(--studio-line);
  background: color-mix(in srgb, var(--studio-bg) 92%, transparent);
}

.rail-logo,
.rail-user,
.rail-action {
  display: grid;
  place-items: center;
}

.rail-logo {
  border: 1px solid rgb(137 220 230 / 0.35);
  border-radius: 14px;
  background: linear-gradient(135deg, #9ce7ee, #c7a16f);
  color: #0a171c;
  font-weight: 1000;
  text-decoration: none;
}

.rail-logo,
.rail-action {
  width: 44px;
  height: 44px;
}

.rail-nav,
.rail-bottom {
  display: grid;
  justify-items: center;
  gap: 0.72rem;
}

.rail-nav {
  align-content: center;
}

.rail-bottom {
  position: relative;
  align-content: end;
}

.rail-action {
  position: relative;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--studio-muted);
  cursor: pointer;
  font-size: 1.05rem;
  transition: all 160ms ease;
}

.rail-action:hover,
.rail-action--active,
.rail-action--open {
  background: rgb(137 220 230 / 0.12);
  color: var(--studio-accent);
}

.rail-action--active::before {
  position: absolute;
  left: -0.7rem;
  width: 3px;
  height: 30px;
  border-radius: 999px;
  background: var(--studio-accent);
  content: "";
}

.rail-user {
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: var(--studio-panel-3);
  color: var(--studio-accent);
  cursor: pointer;
  font: inherit;
  font-weight: 1000;
  transition: all 160ms ease;
}

.rail-user:hover {
  border-color: rgb(237 138 125 / 0.34);
  color: var(--studio-danger);
}

.rail-user:disabled {
  cursor: wait;
  opacity: 0.55;
}

.rail-user-exit {
  position: absolute;
  right: -5px;
  bottom: -5px;
  display: grid;
  width: 17px;
  height: 17px;
  place-items: center;
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  background: var(--studio-control-bg);
  color: var(--studio-muted);
  font-size: 0.65rem;
  line-height: 1;
}

.rail-user-wrap {
  display: grid;
  justify-items: center;
}

.settings-popover {
  position: absolute;
  bottom: 46px;
  left: 54px;
  z-index: 10;
  display: grid;
  width: 220px;
  gap: 0.78rem;
  padding: 0.9rem;
  border: 1px solid var(--studio-line-strong);
  border-radius: 16px;
  background: var(--studio-panel);
  box-shadow: var(--studio-shadow);
}

.theme-switcher {
  display: grid;
  gap: 0.45rem;
}

.theme-switcher button {
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: var(--studio-control-bg);
  color: var(--studio-text);
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  padding: 0.58rem 0.7rem;
  text-align: left;
}

.theme-switcher button.active {
  border-color: rgb(137 220 230 / 0.46);
  color: var(--studio-accent);
}

@media (max-width: 1180px) {
  .icon-rail {
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto;
    align-items: center;
  }

  .rail-nav,
  .rail-bottom {
    display: flex;
  }
}
</style>
