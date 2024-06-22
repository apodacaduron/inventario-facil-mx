import { computed, ref } from 'vue';

interface SidebarState {
  id: string;
  state: Record<string, unknown>;
}

export function useSidebarManager(initialState?: SidebarState[]) {
  const sidebars = ref<SidebarState[]>(initialState ?? []);

  const currentSidebar = computed(() => sidebars.value[sidebars.value.length - 1])
  const hasAnySidebarOpen = computed(() => sidebars.value.length)

  function openSidebar(sidebarId: string, state?: SidebarState['state']) {
    sidebars.value.push({ id: sidebarId, state: state ?? {} });
  };

  function closeSidebar() {
    sidebars.value.pop();
  };

  return {
    sidebars,
    currentSidebar,
    hasAnySidebarOpen,
    openSidebar,
    closeSidebar,
  };
}
