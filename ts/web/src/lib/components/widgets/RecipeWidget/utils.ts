import Fraction from 'fraction.js';
import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';

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
    r.inputs.map((i) => i.i),
    r.outputs.map((i) => i.i),
  );
};

export const FULL_CHANCE = 100_00;

type AmountUnit = {
  amount: number;
  unit: string;
};

export const calcChance = (chance?: number): string => {
  if (chance === undefined) {
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

const TICKS_PER_SEC = 20;
const USE_TICKS = false;
const DECIMAL_PLACES = 3;

export const timeUnit = (durPerTick: number | Fraction): { amount: string; unit: string } => {
  if (USE_TICKS) {
    return {
      amount: new Fraction(durPerTick).toString(DECIMAL_PLACES),
      unit: 'ticks',
    };
  }
  return {
    amount: new Fraction(durPerTick).div(TICKS_PER_SEC).toString(DECIMAL_PLACES),
    unit: 'sec',
  };
};
