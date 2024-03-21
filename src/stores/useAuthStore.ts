import { supabase } from "@/config/supabase";
import { Session } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import { ref, toRef } from "vue";
import { Database } from "../../types_db";

type UserRole =
  | Database["public"]["Tables"]["i_roles"]["Row"]["role_name"]
  | undefined;

export const useAuthStore = defineStore("auth", () => {
  const session = ref<Session | null>(null);
  const userRole = ref<UserRole>(null);

  const isLoggedIn = toRef(() => Boolean(session.value));
  const user = toRef(() => session.value?.user.user_metadata);
  const avatar = toRef(() => session.value?.user.user_metadata.avatar_url);

  function setSession(nextSession: Session | null) {
    session.value = nextSession;
  }

  function setRole(nextRole: UserRole) {
    userRole.value = nextRole;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  return {
    userRole,
    session,
    isLoggedIn,
    user,
    avatar,
    setSession,
    signOut,
    setRole,
  };
});
