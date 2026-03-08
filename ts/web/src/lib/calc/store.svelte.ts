import Fraction from 'fraction.js';
import { toast } from 'svelte-sonner';
import { appState } from '$lib/appstate/app_state.svelte';
import { type IngredientBalance, calcBalance } from './balance.js';
import { type EffectiveDurations, calcEffectiveDurations } from './effective.js';
import { CalcError, calcMachineCnt } from './machineCnt.js';

export type MachineCount = Map<string, Fraction>;

type Calcuations = {
  machineCnt: MachineCount | null;
  effectiveDurations: EffectiveDurations;
  balance: IngredientBalance[] | null;
  errorMsg: string | null;
  badMachines: string[];
};

const calcResult = $derived.by<Calcuations>(() => {
  const res: Calcuations = {
    machineCnt: null,
    balance: null,
    errorMsg: null,
    badMachines: [],

    effectiveDurations: calcEffectiveDurations(
      $state.snapshot(appState.selectedRecipes),
      $state.snapshot(appState.allCustomsMap()),
    ),
  };
  try {
    res.machineCnt = calcMachineCnt(
      $state.snapshot(appState.selectedRecipes),
      appState.anchorCntMap(),
      res.effectiveDurations,
    );
    res.balance = calcBalance(appState.selectedRecipes, res.machineCnt);
  } catch (e) {
    if (e instanceof CalcError) {
      res.errorMsg = `Could not auto balance:\n${e.message}`;
      res.badMachines = e.bad_machines;
    } else if (e instanceof Error) {
      res.errorMsg = `Could not auto balance:\n${e.message}`;
    } else {
      res.errorMsg = `Unknown error ${e}`;
    }
    toast.error(res.errorMsg);
    console.error(e);
  }
  return res;
});

export const calculations = {
  machineCnt(recipeId: string): Fraction {
    return calcResult.machineCnt?.get(recipeId) ?? new Fraction(0);
  },
  effetiveDuration(recipeId: string): Fraction | null {
    return calcResult.effectiveDurations?.get(recipeId) ?? null;
  },
  badMachinesStr(): string {
    return calcResult.badMachines.join(' ');
  },
  isBadMachine(recipeId: string): boolean {
    return calcResult.badMachines.includes(recipeId);
  },
  get balance(): IngredientBalance[] {
    return calcResult.balance ?? [];
  },
  get errorMsg(): string | null {
    return calcResult.errorMsg;
  },
};
