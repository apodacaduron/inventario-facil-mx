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
    @apply border border-neutral-300;
    @apply rounded-2xl p-2;
    box-shadow: 0 0 0 29px hsl(0, 0%, 100%), 0 0 0 30px hsl(0, 0%, 94%),
      0 0 0 59px hsl(0, 0%, 100%), 0 0 0 60px hsl(0, 0%, 96%),
      0 0 0 89px hsl(0, 0%, 100%), 0 0 0 90px hsl(0, 0%, 98%);
  }
  &__title {
    @apply font-semibold text-lg;
  }
  &__description {
    @apply text-sm;
  }
}
</style>
