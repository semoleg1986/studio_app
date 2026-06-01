<template>
  <span class="ui-pill">
    <slot />
  </span>
</template>

<style scoped>
.ui-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel) 86%, #f8fafc 14%);
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  padding: 4px 8px;
}

@media (max-width: 480px) {
  .ui-pill {
    padding: 3px 7px;
    font-size: 0.75rem;
  }
}
</style>
