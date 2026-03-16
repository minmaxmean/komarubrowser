import Fraction from 'fraction.js';
import { expect, test } from 'vitest';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap } from '$lib/appstate/customs';
import { calcEdges } from './edges.ts';
import { calcEffectiveDurations } from './effective';
import { calcMachineCnt } from './machineCnt.ts';
import type { MachineCount } from './store.svelte.ts';
import { mapFromObject, shortCustom, shortRecipe } from './testutis.ts';

const MOCK_RECIPES: Recipe[] = [
  shortRecipe(
    'mining',
    { drilling_fluid: 5000 },
    { rare_ore_residue: 400, raw_ore_slurry: 600 },
    640,
    'LV',
  ),
  shortRecipe(
    'raw_ore_slurry',
    { raw_ore_slurry: 1000 },
    { mixed_mineral_residue: 750, molten_ore_mixture: 250 },
    240,
    'MV',
  ),
  shortRecipe(
    'mixed_mineral_residue',
    { mixed_mineral_residue: 1000 },
    { sulfuric_mineral_mixture: 400, oxygenous_mineral_mixture: 600 },
    240,
    'HV',
  ),
  shortRecipe(
    'sulfuric_mineral_mixture',
    { sulfuric_mineral_mixture: 500 },
    { crushed_barite_ore: 1, crushed_chalcopyrite_ore: 1, crushed_bornite_ore: 1 },
    230,
    'HV',
  ),
];

const machineCntFromObj = (r: Record<string, number | string | Fraction>): MachineCount =>
  new Map(Object.keys(r).map((k) => [k, new Fraction(r[k])] as const));

test('smoke', () => {
  const customs: CustomsMap = mapFromObject({ mining: shortCustom({ cnt: 1 }) });
  const anchorCnt: MachineCount = machineCntFromObj({ mining: 1 });
  const edges = calcEdges(MOCK_RECIPES, customs);
  const effectiveDurs = calcEffectiveDurations(MOCK_RECIPES, customs);
  const want: MachineCount = machineCntFromObj({
    mining: 1,
    raw_ore_slurry: '0.225',
    mixed_mineral_residue: '3.(3)',
    sulfuric_mineral_mixture: '0.23',
  });
  const got = calcMachineCnt(MOCK_RECIPES, edges, anchorCnt, effectiveDurs);
  expect(got).toStrictEqual(want);
});
