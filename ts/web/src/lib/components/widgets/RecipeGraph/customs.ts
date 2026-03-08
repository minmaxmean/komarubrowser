import { Fraction } from 'fraction.js';
import { appState } from '$lib/appstate/app_state.svelte';

export type FakeFraction = {
  s: bigint;
  n: bigint;
  d: bigint;
};

export type Customs = {
  manualMachines: string[];
  manualMachinesCnt: Record<string, FakeFraction>;
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
        customs.manualMachinesCnt[nodeId] = new Fraction(1);
      }
    },
    setMachineCnt: (nodeId: string, newCnt: Fraction) => {
      const exists = customs.manualMachines.includes(nodeId);
      if (!exists || newCnt.equals(customs.manualMachinesCnt[nodeId])) return;
      customs.manualMachinesCnt[nodeId] = newCnt;
    },
  };
};

export type NodeCalcState = {
  isAuto: boolean;
  machineCnt: FakeFraction | null;
};

export const initCalcState = (nodeId: string, customs: Customs): NodeCalcState => {
  if (!customs.manualMachines.includes(nodeId)) return { isAuto: true, machineCnt: null };
  return { isAuto: false, machineCnt: customs.manualMachinesCnt[nodeId] ?? new Fraction(0) };
};
