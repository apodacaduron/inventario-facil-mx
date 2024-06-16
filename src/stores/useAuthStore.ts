import { supabase } from "@/config/supabase";
import { Session } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import { ref, toRef } from "vue";
import { AuthedUserData } from "@/features/admin";
import { resetAllPiniaStores } from ".";
import { useQueryClient } from "@tanstack/vue-query";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isLoadingSession = ref(true);
  const session = ref<Session | null>(null);
  const authedUser = ref<AuthedUserData | null>(null);

  const isPremiumAccount = toRef(() =>
    Boolean(authedUser.value?.plan_name === "premium")
  );
  const isLoggedIn = toRef(() => Boolean(session.value));
  const avatar = toRef(() => session.value?.user.user_metadata.avatar_url);
  const userRole = toRef(() => authedUser.value?.role_name);

  function setSession(nextSession: Session | null) {
    if (nextSession === null) {
      setAuthedUserData(null);
    }
    session.value = nextSession;
    isLoadingSession.value = false;
  }

  function setAuthedUserData(nextUser: AuthedUserData | null) {
    authedUser.value = nextUser;
  }

  async function signOut() {
    await supabase.auth.signOut({ scope: "local" });
    queryClient.removeQueries();
    resetAllPiniaStores();
    router.push("/");
  }

  function $reset() {
    isLoadingSession.value = false;
    session.value = null;
    authedUser.value = null;
  }

  return {
    authedUser,
    userRole,
    session,
    isLoggedIn,
    avatar,
    isLoadingSession,
    isPremiumAccount,
    setSession,
    signOut,
    setAuthedUserData,
    $reset,
  };
});
