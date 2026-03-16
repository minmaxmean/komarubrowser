import Fraction from 'fraction.js';
import { expect, test } from 'vitest';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap } from '$lib/appstate/customs';
import { type EffectiveDurations, calcEffectiveDurations } from './effective';
import { mapFromObject, shortCustom, shortRecipe } from './testutis.ts';

const MOCK_RECIPES: Recipe[] = [
  shortRecipe(
    'mining',
    { drilling_fluid: 5000 },
    { rare_ore_residue: 400, raw_ore_slurry: 600 },
    640 / 20,
    'LV',
  ),
  shortRecipe(
    'raw_ore_slurry',
    { raw_ore_slurry: 1000 },
    { mixed_mineral_residue: 750, molten_ore_mixture: 250 },
    240 / 20,
    'MV',
  ),
  shortRecipe(
    'mixed_mineral_residue',
    { mixed_mineral_residue: 1000 },
    { sulfuric_mineral_mixture: 400, oxygenous_mineral_mixture: 600 },
    240 / 20,
    'HV',
  ),
  shortRecipe(
    'sulfuric_mineral_mixture',
    { sulfuric_mineral_mixture: 500 },
    { crushed_barite_ore: 1, crushed_chalcopyrite_ore: 1, crushed_bornite_ore: 1 },
    230 / 20,
    'HV',
  ),
];

test('smoke', () => {
  const customs: CustomsMap = mapFromObject({
    mining: shortCustom({ cnt: 1 }),
  });
  const want: EffectiveDurations = mapFromObject({
    mining: new Fraction(640),
    raw_ore_slurry: new Fraction(240),
    mixed_mineral_residue: new Fraction(240),
    sulfuric_mineral_mixture: new Fraction(230),
  });
  const got = calcEffectiveDurations(MOCK_RECIPES, customs);
  expect(got).toStrictEqual(want);
});

test('mining at MV', () => {
  const customs: CustomsMap = mapFromObject({
    mining: shortCustom({ cnt: 1, tier: 'MV' }),
  });
  const want: EffectiveDurations = mapFromObject({
    mining: new Fraction(320),
    raw_ore_slurry: new Fraction(240),
    mixed_mineral_residue: new Fraction(240),
    sulfuric_mineral_mixture: new Fraction(230),
  });
  const got = calcEffectiveDurations(MOCK_RECIPES, customs);
  expect(got).toStrictEqual(want);
});
