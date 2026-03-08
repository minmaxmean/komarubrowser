import Fraction from 'fraction.js';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap, MachineCustomization } from '$lib/appstate/customs';
import { srlog } from './utils';

export type EffectiveDurations = Map<string, Fraction>;

const BASE_OVERCLOCK = new Fraction(2);
const PERFECT_OVERCLOCK = new Fraction(4);

function effectiveDuration(r: Recipe, cust: MachineCustomization | undefined): Fraction {
  let baseDuration = new Fraction(r.duration);
  if (!cust) return baseDuration;
  if (cust.energyTier > r.min_tier) {
    baseDuration = baseDuration.div(BASE_OVERCLOCK.pow(cust.energyTier - r.min_tier));
  }
  return baseDuration;
}

export const calcEffectiveDurations = (
  recipes: Recipe[],
  customs: CustomsMap,
): EffectiveDurations => {
  srlog('customs', customs);
  const effecive: EffectiveDurations = new Map();
  recipes.forEach((r) => {
    const cust = customs.get(r.id);
    effecive.set(r.id, effectiveDuration(r, cust));
  });
  srlog('effetive', effecive);
  return effecive;
};
