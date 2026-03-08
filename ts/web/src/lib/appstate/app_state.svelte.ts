import Fraction from 'fraction.js';
import superjson from 'superjson';
import type { EnergyTierID } from '@komarubrowser/common/db/energyTier';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { MachineCount } from '$lib/calc/store.svelte';
import type { Customs } from './customs';

export type AppState = {
  selectedRecipes: Recipe[];
  customs: Customs;
};

const initAppState: AppState = {
  selectedRecipes: [],
  customs: {},
};

const APP_STATE_KEY = 'APP_STATE';

type FractionJSON = string;

superjson.registerCustom<Fraction, FractionJSON>(
  {
    isApplicable: (v) => v instanceof Fraction,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Fraction(v),
  },
  'Fraction',
);

class AppStateWrapper {
  private state = $state(initAppState);

  constructor() {
    const stored = localStorage.getItem(APP_STATE_KEY);
    if (stored !== null) {
      this.state = superjson.parse(stored);
    }

    $effect.root(() => {
      $effect(() => {
        const json = superjson.stringify(this.state);
        localStorage.setItem(APP_STATE_KEY, json);
      });
    });
  }

  get selectedRecipes(): Recipe[] {
    return this.state.selectedRecipes;
  }
  set selectedRecipes(v: Recipe[]) {
    this.state.selectedRecipes = v;
  }
  toggleManual = (nodeId: string, energyTier: EnergyTierID) => {
    const exists = this.state.customs[nodeId];
    if (exists) {
      delete this.state.customs[nodeId];
    } else {
      this.state.customs[nodeId] = {
        cnt: new Fraction(1),
        energyTier: energyTier,
      };
    }
  };
  setMachineCnt = (nodeId: string, newCnt: Fraction) => {
    const machineCustom = this.state.customs[nodeId];
    if (!machineCustom || newCnt.equals(machineCustom.cnt)) return;
    machineCustom.cnt = newCnt;
  };
  machineCntMap = (): MachineCount => {
    const entries = Object.entries(this.state.customs)
      .map(([node_id, machineCustom]) => [node_id, machineCustom?.cnt ?? new Fraction(0)] as const)
      .filter((arr) => arr[1].gt(0));
    return new Map(entries);
  };
  isAuto = (node_id: string): boolean => !this.state.customs[node_id];
  getMachineTier = (nodeId: string, defaultTier: EnergyTierID): EnergyTierID => {
    return this.state.customs[nodeId]?.energyTier ?? defaultTier;
  };

  setMachineTier = (nodeId: string, newVal: EnergyTierID) => {
    const machineCustom = this.state.customs[nodeId];
    if (!machineCustom) return;
    machineCustom.energyTier = newVal;
  };
}

export const appState = new AppStateWrapper();
