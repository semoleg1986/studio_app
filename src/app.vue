<template>
  <div class="app-shell">
    <NuxtPage v-if="isAuthPage" />

    <template v-else>
      <header class="app-header">
        <div class="app-header__inner">
          <NuxtLink class="brand" to="/">
            <span class="brand__mark">C</span>
            <span class="brand__copy">
              <strong>{{ t("app.name") }}</strong>
              <span>{{ t("app.subtitle") }}</span>
            </span>
          </NuxtLink>

          <nav v-if="isAuthenticated" class="nav" :aria-label="t('nav.primary')">
            <NuxtLink class="nav__link" to="/">
              {{ t("nav.courses") }}
            </NuxtLink>
            <NuxtLink class="nav__link" to="/settings">
              {{ t("nav.settings") }}
            </NuxtLink>
          </nav>

          <div class="actions">
            <span v-if="user" class="user-email">
              {{ user.email }}
            </span>
            <UiButton
              v-if="isAuthenticated"
              variant="ghost"
              :disabled="authPending"
              @click="onLogout"
            >
              {{ t("auth.logout") }}
            </UiButton>
            <UiButton v-else as="NuxtLink" to="/login">
              {{ t("auth.login") }}
            </UiButton>
          </div>
        </div>
      </header>

      <NuxtPage />
      <AppFooter />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watchEffect } from "vue";
import { useAuthSession } from "~/features/auth";
import { usePreferences } from "~/shared/lib/preferences/use-preferences";
import AppFooter from "~/shared/ui/app-footer/AppFooter.vue";
import UiButton from "~/shared/ui/UiButton.vue";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const { init, locale, setLocale, t } = usePreferences();
const { bootstrap, isAuthenticated, logout, pending: authPending, user } = useAuthSession();

const siteUrl = computed(() => String(runtimeConfig.public.siteUrl || "http://localhost:3002"));
const routePath = computed(() =>
  route.path !== "/" && route.path.endsWith("/") ? route.path.slice(0, -1) : route.path
);
const canonicalUrl = computed(() => `${siteUrl.value}${routePath.value}`);
const ogImageUrl = computed(() => `${siteUrl.value}/og-image.svg`);
const isAuthPage = computed(
  () => route.path.startsWith("/login") || route.path.startsWith("/invite/accept")
);

const localeFromQuery = computed(() => {
  const lang = route.query.lang;
  if (lang === "ru" || lang === "en") {
    return lang;
  }
  return null;
});

watchEffect(() => {
  if (localeFromQuery.value) {
    setLocale(localeFromQuery.value);
  }
});

useHead(() => ({
  htmlAttrs: {
    lang: locale.value
  },
  link: [
    { rel: "canonical", href: canonicalUrl.value },
    { rel: "alternate", hreflang: "ru", href: `${canonicalUrl.value}?lang=ru` },
    { rel: "alternate", hreflang: "en", href: `${canonicalUrl.value}?lang=en` },
    { rel: "alternate", hreflang: "x-default", href: canonicalUrl.value },
    { rel: "manifest", href: "/manifest.webmanifest" },
    { rel: "icon", type: "image/svg+xml", href: "/icons/icon-192.svg" },
    { rel: "apple-touch-icon", href: "/icons/icon-192.svg" }
  ],
  meta: [
    { name: "application-name", content: runtimeConfig.public.appName },
    { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
    { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-title", content: runtimeConfig.public.appName },
    { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#fffdf7" },
    { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#0f1519" }
  ]
}));

useSeoMeta({
  titleTemplate: (chunk) =>
    chunk ? `${chunk} | ${runtimeConfig.public.appName}` : runtimeConfig.public.appName,
  description: () => t("page.hero.subtitle"),
  ogUrl: canonicalUrl,
  ogSiteName: runtimeConfig.public.appName,
  ogType: "website",
  ogImage: ogImageUrl,
  twitterCard: "summary_large_image",
  twitterImage: ogImageUrl
});

onMounted(() => {
  init();
  void bootstrap();
});

async function onLogout() {
  await logout();
  await navigateTo("/login");
}
</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--panel) 92%, transparent);
  backdrop-filter: blur(14px);
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 10px 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--text);
  text-decoration: none;
}

.brand__mark {
  display: inline-grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #bae6fd, #fed7aa);
  color: #0f172a;
  font-weight: 900;
}

.brand__copy {
  display: grid;
  min-width: 0;
}

.brand__copy strong {
  overflow: hidden;
  color: var(--text);
  font-weight: 800;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand__copy span {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav,
.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav {
  margin-left: auto;
}

.nav__link {
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--muted);
  font-weight: 800;
  padding: 0.45rem 0.75rem;
  text-decoration: none;
}

.nav__link.router-link-active {
  border-color: var(--border);
  background: var(--panel);
  color: var(--text);
}

.user-email {
  max-width: 220px;
  overflow: hidden;
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .app-header__inner {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .brand {
    flex: 1 1 100%;
  }

  .nav {
    margin-left: 0;
  }

  .actions {
    margin-left: auto;
  }
}

@media (max-width: 520px) {
  .nav,
  .actions {
    width: 100%;
  }

  .nav__link,
  .actions :deep(.ui-button) {
    flex: 1;
  }

  .user-email {
    display: none;
  }
}
</style>
