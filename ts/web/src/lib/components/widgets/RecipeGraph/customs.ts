import { appState } from '$lib/appstate/app_state.svelte';

export type Customs = {
  manualMachines: string[];
  manualMachinesCnt: Record<string, number>;
};

export const initCustoms: Customs = {
  manualMachines: [],
  manualMachinesCnt: {},
};

export const useCustoms = () => {
  const customs = appState.value.calcCustoms;
  return {
    toggleManual: (nodeId: string) => {
      const exists = customs.manualMachines.includes(nodeId);
      if (exists) {
        customs.manualMachines = customs.manualMachines.filter((id) => id !== nodeId);
        delete customs.manualMachinesCnt[nodeId];
      } else {
        customs.manualMachines.push(nodeId);
        customs.manualMachinesCnt[nodeId] = 1;
      }
    },
  };
};
