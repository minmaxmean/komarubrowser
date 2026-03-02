import type { Ingredient } from '@komarubrowser/common/db/ingredient';
import type { Recipe, RecipeIngredient } from '@komarubrowser/common/db/recipe';

export const getDisplayName = (id: string, map?: Map<string, Ingredient>) => {
  let item = map?.get(id);
  if (item?.display_name) {
    return item.display_name;
  }
  console.log(`Item ${id} not found, falling back`);
  return fakeDisplayName(id);
};

export const fakeDisplayName = (id: string): string => {
  let splits = id.split('/');
  id = splits[splits.length - 1];
  splits = id.split(':');
  id = splits[splits.length - 1];
  id = id.replaceAll('_', ' ');
  return id;
};

export const ingredientUnit = (ing: RecipeIngredient, map?: Map<string, Ingredient>): string => {
  const item = map?.get(ing.accepted_ids[0]);
  if (item) {
    return item.is_fluid ? 'mb' : '';
  }
  return ing.amount > 64 ? 'mb' : '';
};

export const getItemIds = (r: Recipe): string[] => {
  return [r.machine].concat(
    r.inputs.map((i) => i.accepted_ids[0]),
    r.outputs.map((i) => i.accepted_ids[0])
  );
};
