<template>
  <footer class="footer">
    <div class="footer__main">
      <div class="footer__brand">
        <strong>{{ t("app.name") }}</strong>
        <span>© {{ year }} {{ t("footer.copyright") }}</span>
      </div>
      <NuxtLink class="settings-link" to="/settings">{{ t("footer.settings") }}</NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
const year = new Date().getFullYear();
const { t } = usePreferences();
</script>

<style scoped>
.footer {
  margin-top: 2.5rem;
  border-top: 1px solid var(--c-border);
  background: var(--c-footer-bg);
}

.footer__main {
  max-width: 1080px;
  margin: 0 auto;
  padding: 1.2rem 1rem 1.6rem;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  flex-wrap: wrap;
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--c-muted);
}

.settings-link {
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: var(--c-surface);
  color: var(--c-fg);
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  text-decoration: none;
}
</style>
