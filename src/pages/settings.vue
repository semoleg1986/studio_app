<template>
  <main class="page">
    <PreferencesSettingsPanel />
  </main>
</template>

<script setup lang="ts">
import PreferencesSettingsPanel from "~/shared/ui/settings/PreferencesSettingsPanel.vue";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";

const { t } = usePreferences();

useSeoMeta({
  title: computed(() => `${t("settings.title")} | Studio`),
  description: computed(() => t("settings.subtitle"))
});
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>
