import Fraction from 'fraction.js';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import { type Customs, initCustoms } from '$lib/components/widgets/RecipeGraph/customs';

export type AppState = {
  selectedRecipes: Recipe[];
  calcCustoms: Customs;
};

const initAppState: AppState = {
  selectedRecipes: [],
  calcCustoms: initCustoms,
};

const postProcess = (appState: AppState): AppState => ({
  ...initAppState,
  ...appState,
  calcCustoms: {
    ...appState.calcCustoms,
    manualMachinesCnt: Object.fromEntries(
      Object.entries(appState.calcCustoms.manualMachinesCnt).map(([key, value]) => [
        key,
        new Fraction(value),
      ]),
    ),
  },
});
const APP_STATE_KEY = 'APP_STATE';

function createPersistedState() {
  let state = $state(initAppState);

  const stored = localStorage.getItem(APP_STATE_KEY);
  if (stored !== null) {
    state = postProcess(JSON.parse(stored));
  }

  $effect.root(() => {
    $effect(() =>
      localStorage.setItem(
        APP_STATE_KEY,
        JSON.stringify(state, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
      ),
    );
  });

  return {
    get value() {
      return state;
    },
    set value(v) {
      state = v;
    },
  };
}
export const appState = createPersistedState();
