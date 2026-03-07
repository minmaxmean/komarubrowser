import type Fraction from 'fraction.js';
import { toast } from 'svelte-sonner';
import { appState } from '$lib/appstate/app_state.svelte';
import { calcMachineCnt } from './calc';

export type MachineCount = Map<string, Fraction>;

type Calcuations = {
  machineCnt: MachineCount | null;
};

const calcs = $derived.by<Calcuations>(() => {
  let machineCnt: MachineCount | null = null;
  try {
    machineCnt = calcMachineCnt(appState.value.selectedRecipes, appState.value.calcCustoms);
  } catch (e) {
    if (e instanceof Error) {
      toast.error(`Could not auto balance:\n${e.message}`);
    } else {
      toast.error(`Unknown erro ${e}`);
    }
  }
  return { machineCnt };
});

export const calculations = {
  machineCnt(recipeId: string): Fraction | null {
    return calcs.machineCnt?.get(recipeId) ?? null;
  },
};
