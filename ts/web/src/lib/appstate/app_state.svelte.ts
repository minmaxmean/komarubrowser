import Fraction from 'fraction.js';
import superjson from 'superjson';
import { SvelteMap } from 'svelte/reactivity';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';
import type { MachineCount } from '$lib/calc/store.svelte';
import {
  type Customs,
  type CustomsMap,
  type MachineCust,
  type MachineCustGetter,
  type MachineCustSetter,
  defaultCustomization,
} from './customs';

type Setup = {
  name: string;
  selectedRecipes: Recipe[];
  customs: Customs;
};

const CLEAN_SETUP = 'Setup 1';
const cleanSetup = (): Setup => ({
  name: CLEAN_SETUP,
  selectedRecipes: [],
  customs: {},
});

type AppState = {
  currentSetup: string;
  setups: Record<string, Setup>;
};

const initAppState: AppState = {
  currentSetup: CLEAN_SETUP,
  setups: {
    [CLEAN_SETUP]: cleanSetup(),
  },
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
  #state = $state(initAppState);

  constructor() {
    const stored = localStorage.getItem(APP_STATE_KEY);
    if (stored !== null) {
      this.#state = superjson.parse(stored);
    }

    $effect.root(() => {
      $effect(() => {
        const json = superjson.stringify(this.#state);
        localStorage.setItem(APP_STATE_KEY, json);
      });
    });
  }

  public setups = {
    duplicate: () => {
      const name = this.#state.currentSetup + ' copy';
      this.#state.setups[name] = { ...this.currentSetup, name };
      this.#state.currentSetup = name;
    },
    rename: (newName: string) => {
      const currentName = this.#state.currentSetup;
      this.#state.setups[newName] = { ...this.currentSetup, name: newName };
      this.#state.currentSetup = newName;
      delete this.#state.setups[currentName];
    },
    deleteCurrent: () => {
      const current = this.#state.currentSetup;
      delete this.#state.setups[current];
      const next = this.setups.list().find((i) => i != current);
      if (next) {
        this.#state.currentSetup = next;
      } else {
        this.#state.currentSetup = CLEAN_SETUP;
        this.#state.setups[CLEAN_SETUP] = cleanSetup();
        return;
      }
    },
    change: (name: string) => {
      if (!this.#state.setups[name]) {
        console.debug(`Setup doesn't exist`);
      }
      this.#state.currentSetup = name;
    },
    list: (): string[] => Object.keys(this.#state.setups),
    current: (): string => this.#state.currentSetup,
  };
  private get currentSetup(): Setup {
    return this.#state.setups[this.#state.currentSetup];
  }
  private set currentSetup(val: Setup) {
    this.#state.setups[this.#state.currentSetup] = val;
  }

  get selectedRecipes(): Recipe[] {
    return this.currentSetup.selectedRecipes;
  }
  set selectedRecipes(v: Recipe[]) {
    this.currentSetup.selectedRecipes = v;
  }
  private custGetter =
    <K extends keyof MachineCust>(key: K): MachineCustGetter<K> =>
    (nodeId) => {
      const cust: MachineCust = this.currentSetup.customs[nodeId] || defaultCustomization;
      return cust[key];
    };
  private custSetter =
    <K extends keyof MachineCust>(key: K): MachineCustSetter<K> =>
    (nodeId, value) => {
      const cust: MachineCust = this.currentSetup.customs[nodeId] || defaultCustomization;
      cust[key] = value;
      this.currentSetup.customs[nodeId] = cust;
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
    const entries = Object.entries($state.snapshot(this.currentSetup.customs) as any)
      .filter((arr): arr is [string, MachineCust] => !!arr[1])
      .map(([nodeId, cust]) => [nodeId, cust] as const);
    return new Map(entries);
  };
  anchorCntMap = (): MachineCount => {
    const entries = Object.entries(this.currentSetup.customs)
      .filter((arr): arr is [string, MachineCust] => !!arr[1])
      .filter((arr) => !arr[1].isAuto)
      .map(([node_id, machineCustom]) => [node_id, machineCustom.cnt ?? new Fraction(0)] as const);
    return new Map(entries);
  };
  getDisabledEdges = this.custGetter('disabledEdges');
  isEdgeDisabled = (nodeId: string, handleId: string): boolean =>
    (this.getDisabledEdges(nodeId) ?? []).includes(handleId);
  private setDisabledEdges = this.custSetter('disabledEdges');
  toggleEdge = (nodeId: string, handleId: string) => {
    const disaledEdges = this.getDisabledEdges(nodeId) || [];
    const curIndex = disaledEdges.indexOf(handleId);
    if (curIndex !== -1) {
      disaledEdges.splice(curIndex, 1);
    } else {
      disaledEdges.push(handleId);
    }
    if (disaledEdges.length === 0) {
      this.setDisabledEdges(nodeId, undefined);
    } else {
      this.setDisabledEdges(nodeId, disaledEdges);
    }
  };
}

export const appState = new AppStateWrapper();
