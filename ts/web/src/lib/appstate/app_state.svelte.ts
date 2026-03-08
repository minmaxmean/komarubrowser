import Fraction from 'fraction.js';
import superjson from 'superjson';
import type { EnergyTierID } from '@komarubrowser/common/db/energyTier';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { MachineCount } from '$lib/calc/store.svelte';
import {
  type Customs,
  type CustomsMap,
  type MachineCustomization,
  defaultCustomization,
} from './customs';

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
  getCustomization<K extends keyof MachineCustomization>(
    nodeId: string,
    key: K,
  ): MachineCustomization[K] {
    const exists: MachineCustomization = this.state.customs[nodeId] || defaultCustomization;
    return exists[key];
  }
  setCustomization<K extends keyof MachineCustomization>(
    nodeId: string,
    key: K,
    value: MachineCustomization[K],
  ) {
    const exists: MachineCustomization = this.state.customs[nodeId] || defaultCustomization;
    exists[key] = value;
  }
  setIsAuto = (nodeId: string, isAuto: boolean) => this.setCustomization(nodeId, 'isAuto', isAuto);
  isAuto = (nodeId: string): boolean => this.getCustomization(nodeId, 'isAuto');

  setMachineCnt = (nodeId: string, cnt: Fraction) => this.setCustomization(nodeId, 'cnt', cnt);

  setMachineTier = (nodeId: string, energyTier: EnergyTierID) =>
    this.setCustomization(nodeId, 'energyTier', energyTier);
  getMachineTier = (nodeId: string) => this.getCustomization(nodeId, 'energyTier');

  getPerfectOC = (nodeId: string): boolean => {
    return this.state.customs[nodeId]?.hasPerfectOC ?? false;
  };
  setPerfectOC = (nodeId: string, newVal: boolean) => {
    const machineCustom = this.state.customs[nodeId];
    if (!machineCustom) return;
    machineCustom.hasPerfectOC = newVal;
  };

  togglePerfectOC = (nodeId: string) => {
    const machineCustom = this.state.customs[nodeId];
    if (!machineCustom) return;
    machineCustom.hasPerfectOC = !machineCustom.hasPerfectOC;
  };

  customsMap = (): CustomsMap => {
    const entries = Object.entries(this.state.customs).filter(
      (arr): arr is [string, MachineCustomization] => !!arr[1],
    );
    return new Map(entries);
  };
  machineCntMap = (): MachineCount => {
    const entries = Object.entries(this.state.customs)
      .filter((arr): arr is [string, MachineCustomization] => !!arr[1])
      .map(([node_id, machineCustom]) => [node_id, machineCustom.cnt ?? new Fraction(0)] as const);
    return new Map(entries);
  };
}

export const appState = new AppStateWrapper();
