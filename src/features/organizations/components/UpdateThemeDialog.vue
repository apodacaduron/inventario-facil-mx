<script setup lang="ts">
import { ref, watchEffect } from "vue";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui";
import { useMediaQuery } from "@vueuse/core";
import { UserOrganization } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { supabase } from "@/config/supabase";
import { CheckIcon } from "lucide-vue-next";

type Props = {
  userOrganization: UserOrganization | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const primaryColors = [
  // Cool Colors
  "197 71% 73%", // Sky Blue
  "180 62% 50%", // Teal
  "174 62% 56%", // Turquoise
  "235 89% 41%", // Indigo
  "259 67% 85%", // Lavender
  "282 64% 58%", // Violet

  // Neutral Colors
  "219 44% 27%", // Navy
  "6 93% 71%", // Salmon

  // Warm Colors
  "16 68% 60%", // Coral
  "328 76% 52%", // Deep Pink
  "348 83% 47%", // Crimson
  "350 80% 70%", // Rose

  // Yellowish Colors
  "74 70% 55%", // Lime Green
  "45 89% 60%", // Gold
  "79 61% 43%", // Olive
  "42 100% 50%", // Amber
];

const themeColor = ref(
  props.userOrganization?.i_organizations?.theme_color ?? null
);

const queryClient = useQueryClient();
const isDesktop = useMediaQuery("(min-width: 768px)");
const updateOrganizationMutation = useMutation({
  mutationFn: async () => {
    if (!props.userOrganization?.org_id)
      throw new Error("Cannot update since organization id was not provided");

    await supabase
      .from("i_organizations")
      .update({
        theme_color: themeColor.value,
      })
      .eq("id", props.userOrganization?.org_id);

    await queryClient.invalidateQueries({ queryKey: ["organization"] });

    if (themeColor.value === null) {
      window.location.reload();
    }

    openModel.value = false;
  },
});

watchEffect(() => {
  if (openModel.value) {
    themeColor.value =
      props.userOrganization?.i_organizations?.theme_color ?? null;
  } else {
    themeColor.value = null;
  }
});
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Actualiza el color de tu organización</DialogTitle>
        <DialogDescription> Selecciona el nuevo color. </DialogDescription>
      </DialogHeader>
      <div>
        <div class="space-y-4 py-2 pb-4">
          <div class="space-y-2">
            <Button
              :key="index"
              v-for="(color, index) in primaryColors"
              variant="ghost"
              @click="themeColor = color"
            >
              <CheckIcon v-if="color === themeColor" class="size-4 absolute" />
              <div
                class="size-6 rounded-full"
                :style="{ backgroundColor: `hsl(${color})` }"
              />
            </Button>
            <Button variant="ghost" @click="themeColor = null">
              Reiniciar tema
            </Button>
          </div>
        </div>
      </div>
      <DialogFooter class="flex flex-row gap-2">
        <Button variant="outline" @click="openModel = false" class="w-full">
          Cancelar
        </Button>
        <Button
          :disabled="updateOrganizationMutation.isPending.value"
          type="submit"
          @click="updateOrganizationMutation.mutate"
          class="w-full"
        >
          Actualizar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle>Actualiza el color de tu organización</DrawerTitle>
          <DrawerDescription> Selecciona el nuevo color. </DrawerDescription>
        </DrawerHeader>
        <div>
          <div class="space-y-4 py-2 pb-4 px-4">
            <div class="space-y-2">
              <Button
                :key="index"
                v-for="(color, index) in primaryColors"
                variant="ghost"
                @click="themeColor = color"
              >
                <CheckIcon
                  v-if="color === themeColor"
                  class="size-4 absolute"
                />
                <div
                  class="size-6 rounded-full"
                  :style="{ backgroundColor: `hsl(${color})` }"
                />
              </Button>
              <Button class="w-full" variant="ghost" @click="themeColor = null">
                Reiniciar tema
              </Button>
            </div>
          </div>
        </div>
        <DrawerFooter class="flex flex-row gap-2">
          <Button variant="outline" @click="openModel = false" class="w-full">
            Cancelar
          </Button>
          <Button
            :disabled="updateOrganizationMutation.isPending.value"
            type="submit"
            @click="updateOrganizationMutation.mutate"
            class="w-full"
          >
            Actualizar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
