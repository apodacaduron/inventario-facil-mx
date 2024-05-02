<template>
  <div class="feedback-card">
    <div class="feedback-card__icon">
      <slot name="icon" />
    </div>
    <div>
      <div class="feedback-card__title"><slot name="title" /></div>
      <div class="feedback-card__description"><slot name="description" /></div>
    </div>
    <div class="feedback-card__action"><slot name="action" /></div>
  </div>
</template>

<style lang="scss">
.feedback-card {
  @apply flex flex-col items-center gap-5;
  @apply text-center;
  &__icon {
    @apply border border-neutral-300 dark:border-neutral-600;
    @apply rounded-2xl p-2;
  }
  &__title {
    @apply font-semibold text-lg;
  }
  &__description {
    @apply text-sm;
  }
}
</style>
