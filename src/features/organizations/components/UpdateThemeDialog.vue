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
  Input,
  Label,
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

const colorList = [
  "0 84% 60%", // Red
  "24 93% 56%", // Amber
  "48 89% 48%", // Lime
  "78 61% 55%", // Green
  "156 47% 47%", // Teal
  "174 62% 40%", // Cyan
  "192 69% 47%", // Sky
  "204 85% 45%", // Blue
  "226 70% 50%", // Indigo
  "252 73% 56%", // Violet
  "264 65% 59%", // Purple
  "284 55% 53%", // Fuchsia
  "336 80% 60%", // Pink
  "348 83% 58%", // Rose
  "0 0% 50%", // Neutral (Gray)
  "220 16% 50%", // Blue Gray
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
              v-for="(color, index) in colorList"
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
      <DialogFooter>
        <Button variant="outline" @click="openModel = false"> Cancelar </Button>
        <Button
          :disabled="updateOrganizationMutation.isPending.value"
          type="submit"
          @click="updateOrganizationMutation.mutate"
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
                v-for="(color, index) in colorList"
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
        <DrawerFooter>
          <Button variant="outline" @click="openModel = false">
            Cancelar
          </Button>
          <Button
            :disabled="updateOrganizationMutation.isPending.value"
            type="submit"
            @click="updateOrganizationMutation.mutate"
          >
            Actualizar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
