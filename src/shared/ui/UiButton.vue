<template>
  <component :is="component" class="ui-button" :class="variantClass" :to="to">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { resolveComponent, type Component } from "vue";

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    to?: string;
    variant?: "primary" | "ghost" | "danger" | "ghost-danger";
  }>(),
  {
    as: "button",
    to: undefined,
    variant: "primary"
  }
);

const nuxtLink = resolveComponent("NuxtLink");
const component = computed(() => (props.to ? nuxtLink : props.as));
const variantClass = computed(() =>
  props.variant === "primary" ? null : `ui-button--${props.variant}`
);
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #0f172a;
  color: #ffffff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  line-height: 1.15;
  text-decoration: none;
}

.ui-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ui-button--ghost {
  border-color: var(--border);
  background: transparent;
  color: var(--text);
}

.ui-button--danger {
  background: #7f1d1d;
  color: #fef2f2;
}

.ui-button--ghost-danger {
  border-color: #ef4444;
  background: var(--panel);
  color: #b91c1c;
}

@media (max-width: 480px) {
  .ui-button {
    padding: 8px 10px;
    font-size: 0.82rem;
  }
}
</style>
