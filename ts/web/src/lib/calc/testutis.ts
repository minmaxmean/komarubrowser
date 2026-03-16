import Fraction from 'fraction.js';
import { type EnergyTierName, energyTierIDFromName } from '@komarubrowser/common/db/energyTier';
import type { Recipe, RecipeIngredient } from '@komarubrowser/common/db/recipe';
import type { MachineCust } from '$lib/appstate/customs';

type ShortIngredients = Record<string, number>;
export const shortIngredits = (arg: ShortIngredients): RecipeIngredient[] =>
  Object.keys(arg).map((ingId) => ({ i: ingId, a: arg[ingId] }));

export const shortRecipe = (
  id: string,
  inputs: ShortIngredients,
  outputs: ShortIngredients,
  durationSec: number | string | Fraction,
  minTier: EnergyTierName,
): Recipe => ({
  id,
  recipe_type: '',
  recipe_category: '',
  inputs: shortIngredits(inputs),
  outputs: shortIngredits(outputs),
  duration: new Fraction(durationSec).mul(20).valueOf(),
  min_tier: energyTierIDFromName(minTier)!,
  eut_consumed: 0,
  eut_produced: 0,
});

type ShortCustom = {
  isAuto?: boolean;
  cnt?: number | string | Fraction;
  tier?: EnergyTierName;
};

export const shortCustom = ({ isAuto, cnt, tier }: ShortCustom): MachineCust => ({
  isAuto: isAuto || false,
  cnt: cnt ? new Fraction(cnt) : undefined,
  energyTier: tier ? energyTierIDFromName(tier)! : undefined,
});

export const mapFromObject = <K extends string, V>(r: Record<K, V>): Map<K, V> =>
  new Map(Object.keys(r).map((k) => [k as K, r[k as K]] as const));
