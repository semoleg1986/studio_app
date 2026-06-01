<template>
  <component :is="as" class="ui-card" :class="variantClass" :style="{ maxWidth }">
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: string;
    maxWidth?: string;
    variant?: "default" | "danger" | "success";
  }>(),
  {
    as: "section",
    maxWidth: "1240px",
    variant: "default"
  }
);

const variantClass = computed(() =>
  props.variant === "default" ? null : `ui-card--${props.variant}`
);
</script>

<style scoped>
.ui-card {
  width: 100%;
  min-width: 0;
  margin: 0 auto;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--panel);
}

.ui-card--danger {
  border-color: #fecaca;
  background: color-mix(in srgb, var(--panel) 85%, #fee2e2 15%);
}

.ui-card--success {
  border-color: color-mix(in srgb, var(--border) 75%, #34d399 25%);
  background: color-mix(in srgb, var(--panel) 92%, #ecfeff 8%);
}

@media (max-width: 760px) {
  .ui-card {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .ui-card {
    padding: 10px;
    border-radius: 12px;
  }
}
</style>
