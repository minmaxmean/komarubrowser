import type Fraction from 'fraction.js';
import { toast } from 'svelte-sonner';
import { appState } from '$lib/appstate/app_state.svelte';
import { type IngredientBalance, calcBalance } from './balance.js';
import { calcMachineCnt } from './machineCnt.js';

export type MachineCount = Map<string, Fraction>;

type Calcuations = {
  machineCnt: MachineCount | null;
  balance: IngredientBalance[] | null;
};

const calcResult = $derived.by<Calcuations>(() => {
  const res: Calcuations = { machineCnt: null, balance: null };
  try {
    res.machineCnt = calcMachineCnt(appState.value.selectedRecipes, appState.value.calcCustoms);
    res.balance = calcBalance(appState.value.selectedRecipes, res.machineCnt);
  } catch (e) {
    if (e instanceof Error) {
      toast.error(`Could not auto balance:\n${e.message}`);
    } else {
      toast.error(`Unknown erro ${e}`);
    }
  }
  return res;
});

export const calculations = {
  machineCnt(recipeId: string): Fraction | null {
    return calcResult.machineCnt?.get(recipeId) ?? null;
  },
  get balance(): IngredientBalance[] {
    return calcResult.balance ?? [];
  },
};
