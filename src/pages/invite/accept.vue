<template>
  <main class="invite-page">
    <UiCard class="invite-card" max-width="460px">
      <header>
        <p class="eyebrow">{{ t("invite.eyebrow") }}</p>
        <h1>{{ t("invite.title") }}</h1>
        <p class="subtitle">{{ t("invite.subtitle") }}</p>
      </header>

      <form class="form" @submit.prevent="onSubmit">
        <label>
          {{ t("invite.password") }}
          <input
            v-model="password"
            autocomplete="new-password"
            name="password"
            required
            type="password"
          />
        </label>

        <label>
          {{ t("invite.passwordConfirm") }}
          <input
            v-model="passwordConfirm"
            autocomplete="new-password"
            name="password-confirm"
            required
            type="password"
          />
        </label>

        <UiButton type="submit" :disabled="pending || !inviteToken">
          {{ pending ? t("common.pleaseWait") : t("invite.submit") }}
        </UiButton>
      </form>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <NuxtLink v-if="!inviteToken" class="login-link" to="/login">
        {{ t("invite.loginLink") }}
      </NuxtLink>
    </UiCard>
  </main>
</template>

<script setup lang="ts">
import { ApiRequestError } from "~/shared/api/types";
import { hasStudioAccess, useAuthSession } from "~/features/auth";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
import UiButton from "~/shared/ui/UiButton.vue";
import UiCard from "~/shared/ui/UiCard.vue";

const route = useRoute();
const password = ref("");
const passwordConfirm = ref("");
const errorMessage = ref("");
const { acceptInvite, bootstrap, isAuthenticated, pending, user } = useAuthSession();
const { t } = usePreferences();

const inviteToken = computed(() => {
  const token = route.query.token;

  if (Array.isArray(token)) {
    return token[0] ?? "";
  }

  return typeof token === "string" ? token : "";
});

useSeoMeta({
  title: () => t("invite.title"),
  description: () => t("invite.subtitle")
});

onMounted(async () => {
  await bootstrap();

  if (isAuthenticated.value && hasStudioAccess(user.value)) {
    await navigateTo("/");
  }
});

async function onSubmit() {
  errorMessage.value = "";

  if (!inviteToken.value) {
    errorMessage.value = t("invite.missingToken");
    return;
  }

  if (password.value.length < 8) {
    errorMessage.value = t("invite.passwordTooShort");
    return;
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = t("invite.passwordMismatch");
    return;
  }

  try {
    await acceptInvite({
      password: password.value,
      session_fingerprint: "studio-invite-accept",
      token: inviteToken.value
    });

    if (!hasStudioAccess(user.value)) {
      errorMessage.value = t("login.roleDenied");
      return;
    }

    await navigateTo("/");
  } catch (error) {
    if (error instanceof ApiRequestError) {
      errorMessage.value = error.problem?.detail ?? error.apiError.statusMessage;
      return;
    }

    errorMessage.value = t("invite.error");
  }
}
</script>

<style scoped>
.invite-page {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.16), transparent 42%),
    radial-gradient(circle at 85% 85%, rgba(2, 132, 199, 0.12), transparent 44%), var(--bg);
}

.invite-card {
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

.login-link {
  display: inline-block;
  margin-top: 14px;
  color: var(--accent);
  font-weight: 800;
}
</style>
