import { computed, ref } from "vue";

interface SidebarState {
  id: string;
  state: Record<string, unknown>;
}

export function useSidebarManager(context?: {
  options?: {
    initialState?: SidebarState[];
  };
  handlers?: {
    onRequestNextLayer?(): void
  };
}) {
  const sidebars = ref<SidebarState[]>(context?.options?.initialState ?? []);

  const currentSidebar = computed(
    () => sidebars.value[sidebars.value.length - 1]
  );
  const hasAnySidebarOpen = computed(() => sidebars.value.length);

  function openSidebar(sidebarId: string, state?: SidebarState["state"]) {
    sidebars.value.push({ id: sidebarId, state: state ?? {} });
  }

  function closeSidebar() {
    sidebars.value.pop();
  }

  function setCurrentSidebarState(state: SidebarState["state"]) {
    currentSidebar.value.state = state;
  }

  return {
    sidebars,
    currentSidebar,
    hasAnySidebarOpen,
    openSidebar,
    closeSidebar,
    setCurrentSidebarState,
  };
}
