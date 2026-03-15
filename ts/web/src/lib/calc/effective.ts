import Fraction from 'fraction.js';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';
import type { CustomsMap, MachineCust } from '$lib/appstate/customs';

export type EffectiveDurations = Map<string, Fraction>;

const BASE_OVERCLOCK = new Fraction(2);
const PERFECT_OVERCLOCK = new Fraction(4);

function effectiveDuration(r: Recipe, cust: MachineCust | undefined): Fraction {
  let baseDuration = new Fraction(r.duration);
  if (!cust) return baseDuration;
  if (cust.energyTier && cust.energyTier > r.min_tier) {
    const ocScale = cust.hasPerfectOC ? PERFECT_OVERCLOCK : BASE_OVERCLOCK;
    baseDuration = baseDuration.div(ocScale.pow(cust.energyTier - r.min_tier));
  }
  return baseDuration;
}

export const calcEffectiveDurations = (
  recipes: Recipe[],
  customs: CustomsMap,
): EffectiveDurations => {
  const effecive: EffectiveDurations = new Map();
  recipes.forEach((r) => {
    const cust = customs.get(r.id);
    effecive.set(r.id, effectiveDuration(r, cust));
  });
  return effecive;
};
