<template>
  <section class="hero">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<style scoped>
.hero {
  padding: 1.25rem 1rem;
  border-radius: 16px;
  background:
    radial-gradient(circle at 8% 0%, rgba(56, 189, 248, 0.12), transparent 34%), var(--panel);
  border: 1px solid var(--border);
}

h1 {
  margin: 0 0 0.5rem;
  color: var(--text);
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  line-height: 1.05;
}

p {
  margin: 0;
  color: var(--muted);
}
</style>
