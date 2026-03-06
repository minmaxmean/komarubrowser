export type Customs = {
  manualMachines: string[];
  manualMachinesCnt: Record<string, number>;
};
export const initCustoms: Customs = {
  manualMachines: [],
  manualMachinesCnt: {},
};
