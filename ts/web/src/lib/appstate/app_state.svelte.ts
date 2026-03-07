import Fraction from 'fraction.js';
import superjson from 'superjson';
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
});
const APP_STATE_KEY = 'APP_STATE';

type FractionJSON = string;

superjson.registerCustom<Fraction, FractionJSON>(
  {
    isApplicable(v) {
      return v instanceof Fraction;
    },
    serialize: (v) => v.toString(),
    deserialize: (v) => new Fraction(v),
  },
  'Fraction',
);

function createPersistedState() {
  let state = $state(initAppState);

  const stored = localStorage.getItem(APP_STATE_KEY);
  if (stored !== null) {
    state = postProcess(superjson.parse(stored));
  }

  $effect.root(() => {
    $effect(() => {
      const json = superjson.stringify(state);
      localStorage.setItem(APP_STATE_KEY, json);
    });
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
