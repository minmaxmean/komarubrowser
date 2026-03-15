import Fraction from 'fraction.js';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';
import { applyChance } from '$lib/constants';
import type { EffectiveDurations } from './effective';
import type { MachineCount } from './store.svelte';

export type IngredientBalanceType = 'input' | 'output' | 'recycle';
export type IngredientBalance = {
  ingredientId: string;
  value: Fraction;
  type: IngredientBalanceType;
};

export type Balance = IngredientBalance[];

export const calcBalance = (
  recipes: Recipe[],
  machineCnt: MachineCount,
  effeciteDurs: EffectiveDurations,
): Balance => {
  const ingMap = new Map<string, IngB>();
  type IngB = {
    ingId: string;
    produced: Fraction;
    consumed: Fraction;
  };

  recipes.forEach((r) => {
    r.inputs.forEach((input) => {
      const rCnt = machineCnt.get(r.id);
      if (!rCnt || input.c === 0) return;
      const ingId = input.i;
      const ing: IngB = ingMap.get(ingId) ?? {
        ingId,
        produced: new Fraction(0),
        consumed: new Fraction(0),
      };
      const consumed = applyChance(
        new Fraction(input.a).mul(rCnt).div(effeciteDurs.get(r.id) ?? r.duration),
        input.c,
      );
      ing.consumed = ing.consumed.add(consumed);
      ingMap.set(ingId, ing);
    });
  });

  recipes.forEach((r) => {
    r.outputs.forEach((output) => {
      const rCnt = machineCnt.get(r.id);
      if (!rCnt) return;
      const ingId = output.i;
      const ing: IngB = ingMap.get(ingId) ?? {
        ingId,
        produced: new Fraction(0),
        consumed: new Fraction(0),
      };
      const produced = applyChance(
        new Fraction(output.a).mul(rCnt).div(effeciteDurs.get(r.id) ?? r.duration),
        output.c,
      );
      ing.produced = ing.produced.add(produced);
      ingMap.set(ingId, ing);
    });
  });

  const toBalance = ({ ingId, consumed, produced }: IngB): IngredientBalance => {
    if (consumed.equals(produced))
      return {
        ingredientId: ingId,
        type: 'recycle',
        value: consumed,
      };
    if (consumed.gt(produced))
      return {
        ingredientId: ingId,
        type: 'input',
        value: consumed.sub(produced),
      };
    if (consumed.lt(produced))
      return {
        ingredientId: ingId,
        type: 'output',
        value: produced.sub(consumed),
      };
    throw Error('IDK: THIS SHOULD NOT HAPPEN');
  };

  return ingMap
    .values()
    .map(toBalance)
    .toArray()
    .sort((a, b) => -a.value.compare(b.value));
};
