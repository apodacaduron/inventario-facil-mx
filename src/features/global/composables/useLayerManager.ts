import { computed, ref } from "vue";

interface LayerState {
  id: string;
  state: Record<string, unknown>;
}

export function useLayerManager(context?: {
  options?: {
    initialState?: LayerState[];
  };
  handlers?: {
    onRequestNextLayer?(): void;
  };
}) {
  const layers = ref<LayerState[]>(context?.options?.initialState ?? []);

  const currentLayer = computed(() => layers.value[layers.value.length - 1]);
  const hasAnyLayerOpen = computed(() => layers.value.length);

  function openLayer(layerId: string, state?: LayerState["state"]) {
    layers.value.push({ id: layerId, state: state ?? {} });
  }

  function closeLayer() {
    layers.value.pop();
  }

  function setCurrentLayerState(state: LayerState["state"]) {
    currentLayer.value.state = state;
  }

  return {
    layers,
    currentLayer,
    hasAnyLayerOpen,
    openLayer,
    closeLayer,
    setCurrentLayerState,
  };
}
