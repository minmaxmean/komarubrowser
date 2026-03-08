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

type Setup = {
  name: string;
  selectedRecipes: Recipe[];
  customs: Customs;
};

const newSetup = (name: string): Setup => ({
  name,
  selectedRecipes: [],
  customs: {},
});

type AppState = {
  currentSetup: string;
  setups: Record<string, Setup>;
};

const initAppState: AppState = {
  currentSetup: 'Setup 1',
  setups: {
    'Setup 1': newSetup('Setup 1'),
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
    create: (name: string) => {
      if (this.#state.setups[name]) {
        throw Error(`Setup ${name} already exists`);
      }
      this.#state.setups[name] = newSetup(name);
    },
    delete: (name: string) => {
      if (!this.#state.setups[name]) {
        console.debug(`Setup doesn't exist`);
      }
      delete this.#state.setups[name];
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
    const entries = Object.entries(this.currentSetup.customs).filter(
      (arr): arr is [string, MachineCust] => !!arr[1],
    );
    return new Map(entries);
  };
  anchorCntMap = (): MachineCount => {
    const entries = Object.entries(this.currentSetup.customs)
      .filter((arr): arr is [string, MachineCust] => !!arr[1])
      .filter((arr) => !arr[1].isAuto)
      .map(([node_id, machineCustom]) => [node_id, machineCustom.cnt ?? new Fraction(0)] as const);
    return new Map(entries);
  };
}

export const appState = new AppStateWrapper();
