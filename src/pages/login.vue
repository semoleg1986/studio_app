<template>
  <main class="login-page">
    <UiCard class="login-card" max-width="440px">
      <header>
        <p class="eyebrow">{{ t("login.eyebrow") }}</p>
        <h1>{{ t("login.title") }}</h1>
        <p class="subtitle">{{ t("login.subtitle") }}</p>
      </header>

      <form class="form" @submit.prevent="onSubmit">
        <label>
          {{ t("login.email") }}
          <input
            v-model="email"
            autocomplete="email"
            inputmode="email"
            name="email"
            required
            type="email"
          />
        </label>

        <label>
          {{ t("login.password") }}
          <input
            v-model="password"
            autocomplete="current-password"
            name="password"
            required
            type="password"
          />
        </label>

        <UiButton type="submit" :disabled="pending">
          {{ pending ? t("common.pleaseWait") : t("login.submit") }}
        </UiButton>
      </form>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
    </UiCard>
  </main>
</template>

<script setup lang="ts">
import { ApiRequestError } from "~/shared/api/types";
import { useAuthSession } from "~/features/auth";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
import UiButton from "~/shared/ui/UiButton.vue";
import UiCard from "~/shared/ui/UiCard.vue";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const { bootstrap, isAuthenticated, login, pending } = useAuthSession();
const { t } = usePreferences();

useSeoMeta({
  title: () => t("login.title"),
  description: () => t("login.subtitle")
});

onMounted(async () => {
  await bootstrap();
  if (isAuthenticated.value) {
    await navigateTo("/");
  }
});

async function onSubmit() {
  errorMessage.value = "";

  try {
    await login({
      email: email.value.trim(),
      password: password.value,
      session_fingerprint: "studio-login"
    });
    await navigateTo("/");
  } catch (error) {
    if (error instanceof ApiRequestError) {
      errorMessage.value = error.problem?.detail ?? error.apiError.statusMessage;
      return;
    }
    errorMessage.value = t("login.error");
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.16), transparent 42%),
    radial-gradient(circle at 85% 85%, rgba(2, 132, 199, 0.12), transparent 44%), var(--bg);
}

.login-card {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--text);
  font-size: clamp(1.7rem, 5vw, 2.35rem);
  line-height: 1.05;
}

.subtitle {
  margin: 0.65rem 0 0;
  color: var(--muted);
}

.form {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

label {
  display: grid;
  gap: 6px;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 700;
}

input {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  color: var(--text);
  font: inherit;
  padding: 10px 12px;
}

input:focus {
  border-color: #38bdf8;
  outline: 3px solid color-mix(in srgb, #38bdf8 25%, transparent);
}

.error {
  margin: 12px 0 0;
  color: var(--c-danger);
  font-weight: 700;
}
</style>
