import type { Recipe } from '@komarubrowser/common/db/recipe';
import { type Customs, initCustoms } from '$lib/components/widgets/RecipeGraph/customs';

function createPersistedState<T>(key: string, initialValue: T) {
  let state = $state(initialValue);

  const stored = localStorage.getItem(key);
  if (stored !== null) {
    state = { ...initialValue, ...JSON.parse(stored) };
  }

  $effect.root(() => {
    $effect(() => localStorage.setItem(key, JSON.stringify(state)));
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

export type AppState = {
  selectedRecipes: Recipe[];
  calcCustoms: Customs;
};

export const defaultAppState: AppState = {
  selectedRecipes: [],
  calcCustoms: initCustoms,
};

export const appState = createPersistedState('APP_STATE', defaultAppState);
