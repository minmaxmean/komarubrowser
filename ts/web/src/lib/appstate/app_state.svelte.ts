import Fraction from 'fraction.js';
import superjson from 'superjson';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { MachineCount } from '$lib/calc/store.svelte';
import {
  type Customs,
  type CustomsMap,
  type MachineCust,
  type MachineCustGetter,
  type MachineCustSetter,
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
  private custGetter =
    <K extends keyof MachineCust>(key: K): MachineCustGetter<K> =>
    (nodeId) => {
      const cust: MachineCust = this.state.customs[nodeId] || defaultCustomization;
      return cust[key];
    };
  private custSetter =
    <K extends keyof MachineCust>(key: K): MachineCustSetter<K> =>
    (nodeId, value) => {
      const cust: MachineCust = this.state.customs[nodeId] || defaultCustomization;
      cust[key] = value;
      this.state.customs[nodeId] = cust;
    };
  public setIsAuto = this.custSetter('isAuto');
  public getIsAuto = this.custGetter('isAuto');
  toggleIsAuto = (nodeId: string) => this.setIsAuto(nodeId, !this.getIsAuto(nodeId));

  public setMachineCnt = this.custSetter('cnt');

  setMachineTier = this.custSetter('energyTier');
  getMachineTier = this.custGetter('energyTier');

  getPerfectOC = this.custGetter('hasPerfectOC');
  setPerfectOC = this.custSetter('hasPerfectOC');

  togglePerfectOC = (nodeId: string) => this.setPerfectOC(nodeId, !this.getPerfectOC(nodeId));

  allCustomsMap = (): CustomsMap => {
    const entries = Object.entries(this.state.customs).filter(
      (arr): arr is [string, MachineCust] => !!arr[1],
    );
    return new Map(entries);
  };
  anchorCntMap = (): MachineCount => {
    const entries = Object.entries(this.state.customs)
      .filter((arr): arr is [string, MachineCust] => !!arr[1])
      .filter((arr) => !arr[1].isAuto)
      .map(([node_id, machineCustom]) => [node_id, machineCustom.cnt ?? new Fraction(0)] as const);
    return new Map(entries);
  };
}

export const appState = new AppStateWrapper();
