import { supabase } from "@/config/supabase";
import { Session } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import { ref, toRef } from "vue";
import { AuthedUserData } from "@/features/admin";

export const useAuthStore = defineStore("auth", () => {
  const isLoadingSession = ref(true);
  const session = ref<Session | null>(null);
  const authedUser = ref<AuthedUserData | null>(null);

  const isLoggedIn = toRef(() => Boolean(session.value));
  const avatar = toRef(() => session.value?.user.user_metadata.avatar_url);
  const userRole = toRef(() => authedUser.value?.role_name)

  function setSession(nextSession: Session | null) {
    if (nextSession === null) {
      setAuthedUserData(null)
    }
    session.value = nextSession;
    isLoadingSession.value = false;
  }

  function setAuthedUserData(nextUser: AuthedUserData | null) {
    authedUser.value = nextUser;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setAuthedUserData(null);
    window.location.href = window.location.origin
  }

  return {
    authedUser,
    userRole,
    session,
    isLoggedIn,
    avatar,
    isLoadingSession,
    setSession,
    signOut,
    setAuthedUserData
  };
});
