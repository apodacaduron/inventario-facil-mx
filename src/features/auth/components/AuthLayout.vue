<script setup lang="ts">
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { SUPPORT_EMAIL } from "@/config/constants";
import { HelpCircleIcon, MailIcon } from "lucide-vue-next";

const componentName = "auth-layout";
</script>

<template>
  <div :class="componentName">
    <main :class="`${componentName}__form`">
      <slot />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            <HelpCircleIcon class="size-4 mr-1" />
            ¿Necesitas ayuda?
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <a :href="`mailto:${SUPPORT_EMAIL}`">
            <DropdownMenuItem>
              <MailIcon class="size-4 mr-3" />
              <span>Soporte correo</span>
            </DropdownMenuItem>
          </a>
          <!-- <a :href="SUPPORT_WHATSAPP" target="_blank">
            <DropdownMenuItem>
              <PhoneIcon class="size-4 mr-3" />
              <span>Soporte Whatsapp</span>
            </DropdownMenuItem>
          </a> -->
        </DropdownMenuContent>
      </DropdownMenu>
    </main>
    <aside :class="`${componentName}__aside`">
      <img :class="`${componentName}__bg`" src="/auth-bg.jpg" />
    </aside>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  @apply flex flex-1 h-screen flex-col lg:flex-row overflow-hidden;
  &__logo {
    @apply max-w-md w-64 mb-6;
  }
  &__form {
    @apply flex flex-col items-center justify-center flex-1 flex-shrink-0;
    @apply px-5 pt-16 pb-8 border-r shadow-lg;
  }
  &__aside {
    @apply flex-1 flex-shrink-0 basis-1/4 xl:flex;
    @apply h-full;
  }
  &__bg {
    @apply w-full h-full object-cover;
  }
}
</style>
