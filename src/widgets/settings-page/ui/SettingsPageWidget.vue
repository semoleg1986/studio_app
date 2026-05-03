<template>
  <main class="page">
    <PreferencesSettingsSection />
  </main>
</template>

<script setup lang="ts">
import { PreferencesSettingsSection } from "~/features/preferences-settings";
import { useSettingsPage } from "~/widgets/settings-page/model/use-settings-page";

useSettingsPage();
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>
