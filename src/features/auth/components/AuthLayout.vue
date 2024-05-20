<script setup lang="ts">
const componentName = "auth-layout";
</script>

<template>
  <div :class="componentName">
    <main :class="`${componentName}__form`">
      <router-link to="/">
        <a href="https://flowbite.com">
          <span
            class="self-center text-xl sm:text-2xl whitespace-nowrap dark:text-white"
            >inventariofacil.mx</span
          >
        </a>
      </router-link>
      <slot />
    </main>
    <aside :class="`${componentName}__aside`">
      <img :class="`${componentName}__bg`" src="/auth-bg.jpg" />
    </aside>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  @apply flex flex-1 h-screen;
  &__logo {
    @apply max-w-md w-64 mb-6;
  }
  &__form {
    @apply flex flex-col items-center justify-center flex-1 flex-shrink-0;
    @apply px-5 pt-16 pb-8 border-r shadow-lg;
  }
  &__aside {
    @apply flex-1 flex-shrink-0 hidden basis-1/4 xl:flex;
  }
  &__bg {
    @apply w-full h-full object-cover;
  }
}
</style>
