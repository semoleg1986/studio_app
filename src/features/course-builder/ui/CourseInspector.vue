<template>
  <aside class="inspector-panel">
    <template v-if="selectedCourse && authoring">
      <section class="inspector-card readiness-card">
        <h2>Готовность</h2>
        <div class="readiness-body">
          <div class="readiness-ring" :style="{ '--progress': `${readinessPercent}%` }">
            <span>{{ readinessPercent }}%</span>
          </div>
          <p>{{ readyToPublish ? "Курс готов к публикации" : "Курс почти готов к публикации" }}</p>
        </div>
        <ul class="checklist">
          <li v-for="item in readiness" :key="item.label" :class="{ done: item.done }">
            <span>{{ item.done ? "✓" : "!" }}</span>
            <div>
              <strong>{{ item.label }}</strong>
              <small v-if="item.detail">{{ item.detail }}</small>
            </div>
          </li>
        </ul>
      </section>

      <section class="inspector-card offer-card">
        <div>
          <h2>Offer / Цена</h2>
          <p class="offer-note">
            Цена хранится в commercial catalog. Course service отвечает только за контент.
          </p>
        </div>

        <div v-if="defaultOffer" class="offer-current">
          <strong>{{ defaultOffer.title }}</strong>
          <span>{{ defaultOffer.offer_id }}</span>
          <span :class="['state-chip', defaultOffer.is_active ? 'state-chip--active' : '']">
            {{ defaultOffer.is_active ? "Активен" : "Выключен" }}
          </span>
        </div>
        <div v-else class="offer-current offer-current--empty">
          <strong>Default offer не настроен</strong>
          <span>После сохранения курс сможет пройти readiness check по offer.</span>
        </div>

        <label class="offer-field">
          <span>Название</span>
          <input
            :value="offerForm.title"
            type="text"
            @input="patchOffer({ title: ($event.target as HTMLInputElement).value })"
          />
        </label>

        <label class="offer-field">
          <span>Описание</span>
          <textarea
            :value="offerForm.description_short"
            rows="2"
            @input="patchOffer({ description_short: ($event.target as HTMLTextAreaElement).value })"
          />
        </label>

        <div class="offer-grid">
          <label class="offer-field">
            <span>Валюта</span>
            <input
              :value="offerForm.currency"
              maxlength="3"
              type="text"
              @input="patchOffer({ currency: ($event.target as HTMLInputElement).value })"
            />
          </label>

          <label class="offer-field">
            <span>List price</span>
            <input
              :value="offerForm.list_price"
              min="0"
              step="0.01"
              type="number"
              @input="patchOffer({ list_price: Number(($event.target as HTMLInputElement).value) })"
            />
          </label>

          <label class="offer-field">
            <span>Sale price</span>
            <input
              :value="offerForm.sale_price"
              min="0"
              step="0.01"
              type="number"
              @input="patchOffer({ sale_price: Number(($event.target as HTMLInputElement).value) })"
            />
          </label>
        </div>

        <label class="offer-toggle">
          <input
            :checked="offerForm.is_active"
            type="checkbox"
            @change="patchOffer({ is_active: ($event.target as HTMLInputElement).checked })"
          />
          <span>Offer активен</span>
        </label>

        <button
          class="primary-action"
          type="button"
          :disabled="mutating"
          @click="$emit('saveOffer')"
        >
          Сохранить offer
        </button>
      </section>

      <section class="inspector-card status-card">
        <h2>Статус</h2>
        <span class="state-chip" :data-state="selectedCourse.publish_state">
          {{ stateLabel(selectedCourse.publish_state) }}
        </span>
        <p>
          draft v{{ draftVersion }} · published {{ publishedVersion }} ·
          {{ hasUnpublishedChanges ? "есть изменения" : "без изменений" }}
        </p>
        <button
          class="primary-action"
          type="button"
          :disabled="mutating || !readyToPublish"
          @click="$emit('publish')"
        >
          Опубликовать
        </button>
        <button class="ghost-action" type="button" :disabled="mutating" @click="$emit('preview')">
          Предпросмотр
        </button>
        <button class="danger-action" type="button" :disabled="mutating" @click="$emit('archive')">
          Архивировать
        </button>
        <small>ID курса: {{ selectedCourse.course_id }}</small>
      </section>
    </template>

    <section v-else class="inspector-card inspector-hint">
      <strong>Нет курса</strong>
      <span>Создайте или выберите курс для проверки готовности.</span>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type {
  StudioCourse,
  StudioCourseAuthoring,
  StudioOffer
} from "~/features/course-builder/model/types";
import type { CoursePublishState } from "~/shared/types/course-authoring";

type ReadinessItem = {
  detail: string | null;
  done: boolean;
  label: string;
};

type OfferForm = {
  currency: string;
  description_short: string;
  is_active: boolean;
  list_price: number;
  sale_price: number;
  title: string;
};

defineProps<{
  authoring: StudioCourseAuthoring | null;
  defaultOffer: StudioOffer | null;
  draftVersion: number | string;
  hasUnpublishedChanges: boolean;
  mutating: boolean;
  offerForm: OfferForm;
  publishedVersion: number | string | null;
  readiness: ReadinessItem[];
  readinessPercent: number;
  readyToPublish: boolean;
  selectedCourse: StudioCourse | null;
}>();

const emit = defineEmits<{
  archive: [];
  preview: [];
  publish: [];
  saveOffer: [];
  "update:offerForm": [patch: Partial<OfferForm>];
}>();

function patchOffer(patch: Partial<OfferForm>) {
  emit("update:offerForm", patch);
}

function stateLabel(state: CoursePublishState) {
  const labels: Record<string, string> = {
    archived: "Архив",
    draft: "Черновик",
    published: "Опубликовано"
  };
  return labels[state] ?? state;
}
</script>

<style scoped>
.inspector-panel {
  display: grid;
  min-height: 0;
  align-content: start;
  gap: 1rem;
  padding: 1rem;
  overflow: auto;
  border-left: 1px solid var(--studio-line);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.02), transparent);
}

.inspector-card {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
  border: 1px solid var(--studio-line);
  border-radius: 18px;
  background: linear-gradient(
    145deg,
    var(--studio-panel),
    color-mix(in srgb, var(--studio-panel) 72%, transparent)
  );
  box-shadow: var(--studio-shadow);
}

.inspector-card h2 {
  margin: 0;
  font-size: 1.22rem;
}

.readiness-body {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.readiness-ring {
  --progress: 0%;

  display: grid;
  width: 86px;
  height: 86px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background:
    radial-gradient(circle, var(--studio-control-bg-strong) 58%, transparent 60%),
    conic-gradient(var(--studio-accent) var(--progress), rgb(255 255 255 / 0.08) 0);
  font-weight: 950;
}

.readiness-body p,
.status-card p {
  margin: 0;
  color: var(--studio-muted);
}

.checklist {
  display: grid;
  gap: 0.82rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.checklist li {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 0.7rem;
  align-items: start;
  color: var(--studio-muted);
}

.checklist li > span {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 1px solid rgb(228 185 102 / 0.4);
  border-radius: 999px;
  color: var(--studio-warning);
  font-weight: 950;
}

.checklist li.done > span {
  border-color: rgb(137 220 230 / 0.45);
  color: var(--studio-accent);
}

.checklist strong {
  display: block;
  color: var(--studio-soft);
}

.checklist small,
.status-card > small {
  color: var(--studio-muted);
}

.offer-note {
  margin: 0.25rem 0 0;
  color: var(--studio-muted);
  font-size: 0.84rem;
}

.offer-current {
  display: grid;
  gap: 0.35rem;
  padding: 0.82rem;
  border: 1px solid var(--studio-line);
  border-radius: 14px;
  background: var(--studio-control-bg);
}

.offer-current > span {
  overflow-wrap: anywhere;
  color: var(--studio-muted);
  font-size: 0.78rem;
}

.offer-current--empty {
  border-style: dashed;
}

.offer-field {
  display: grid;
  gap: 0.42rem;
  color: var(--studio-muted);
  font-size: 0.82rem;
  font-weight: 900;
}

.offer-field input,
.offer-field textarea {
  width: 100%;
  border: 1px solid var(--studio-line);
  border-radius: 12px;
  background: var(--studio-control-bg);
  color: var(--studio-text);
  font: inherit;
  min-height: 42px;
  padding: 0.68rem 0.78rem;
}

.offer-field textarea {
  resize: vertical;
}

.offer-grid {
  display: grid;
  grid-template-columns: 0.8fr 1fr 1fr;
  gap: 0.65rem;
}

.offer-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--studio-soft);
  font-weight: 900;
}

.state-chip {
  width: fit-content;
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  background: var(--studio-control-bg);
  color: var(--studio-muted);
  font-size: 0.78rem;
  font-weight: 950;
  padding: 0.32rem 0.64rem;
}

.state-chip[data-state="published"] {
  color: var(--studio-success);
}

.state-chip[data-state="archived"] {
  color: var(--studio-dim);
}

.state-chip--active {
  color: var(--studio-success);
}

.primary-action,
.ghost-action,
.danger-action {
  min-height: 42px;
  border-radius: 12px;
  padding: 0 1rem;
  font-weight: 950;
}

.primary-action {
  border: 0;
  background: linear-gradient(135deg, var(--studio-accent), var(--studio-accent-2));
  color: #082024;
}

.ghost-action,
.danger-action {
  border: 1px solid var(--studio-line);
  background: var(--studio-control-bg);
  color: var(--studio-muted);
}

.danger-action {
  border-color: rgb(237 138 125 / 0.24);
  color: var(--studio-danger);
}

.primary-action:disabled,
.ghost-action:disabled,
.danger-action:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.inspector-hint {
  color: var(--studio-muted);
}

.inspector-hint strong {
  color: var(--studio-text);
}

@media (max-width: 1180px) {
  .inspector-panel {
    border-left: 0;
    border-top: 1px solid var(--studio-line);
  }
}

@media (max-width: 620px) {
  .offer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
