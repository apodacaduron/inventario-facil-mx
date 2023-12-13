<script setup lang="ts">
const componentName = "auth-layout";
</script>

<template>
  <div :class="componentName">
    <main :class="`${componentName}__form`">
      <slot />
    </main>
    <aside :class="`${componentName}__aside`"></aside>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  @apply flex flex-1 min-h-screen;
  &__form {
    @apply flex flex-col items-center flex-1 flex-shrink-0;
    @apply px-5 pt-16 pb-8 border-r shadow-lg;
  }
  &__aside {
    @apply flex-col items-center justify-center flex-1 flex-shrink hidden basis-1/4 xl:flex;
  }
}
</style>
