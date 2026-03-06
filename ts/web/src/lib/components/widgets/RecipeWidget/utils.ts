import type { Ingredient } from '@komarubrowser/common/db/ingredient';
import type { Recipe } from '@komarubrowser/common/db/recipe';

export const getDisplayName = (id: string, map?: Map<string, Ingredient>) => {
  if (!id) {
    return '<N/A>';
  }
  let label = map?.get(id)?.display_name ?? id;
  return cleanAndCapitalize(label);
};

export const cleanAndCapitalize = (id: string): string => {
  id = id.replaceAll(/^[^:]+:/g, '');
  id = id.replaceAll(/^[^.]+\./g, '');
  id = id.replaceAll('_', ' ');
  return id
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const getItemIds = (r: Recipe): string[] => {
  return [r.recipe_type].concat(
    r.inputs.map((i) => i.accepted_ids[0]),
    r.outputs.map((i) => i.accepted_ids[0]),
  );
};

export const FULL_CHANCE = 100_00;

type AmountUnit = {
  amount: number;
  unit: string;
};

export const calcChance = (chance: number): string => {
  if (chance === FULL_CHANCE) {
    return '';
  }
  return `${chance / 100}%`;
};

export const calcUnit = (
  isFluid: boolean,
  amount: number,
  useBuckets: boolean = false,
): AmountUnit => {
  if (!isFluid) {
    return { amount, unit: '' };
  }
  if (useBuckets) {
    return { amount: amount / 1000, unit: 'b' };
  }
  return { amount: amount, unit: 'mb' };
};
