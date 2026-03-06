import type { Customs } from './customs';

export type NodeCalcState = {
  isAuto: boolean;
  machineCnt?: number;
};

export const initCalcState = (nodeId: string, customs: Customs): NodeCalcState => {
  if (!customs.manualMachines.includes(nodeId)) return { isAuto: true };
  return { isAuto: false, machineCnt: customs.manualMachinesCnt[nodeId] ?? 0 };
};
