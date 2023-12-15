import { Session } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const session = ref<Session | null>(null);

  const isLoggedIn = computed(() => Boolean(session.value));
  const user = computed(() => session.value?.user.user_metadata);
  const avatar = computed(() => session.value?.user.user_metadata.avatar_url);

  function setSession(nextSession: Session | null) {
    session.value = nextSession;
  }

  return { session, isLoggedIn, user, avatar, setSession };
});
