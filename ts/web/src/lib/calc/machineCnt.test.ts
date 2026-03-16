import Fraction from 'fraction.js';
import { describe, expect, test } from 'vitest';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap } from '$lib/appstate/customs';
import { calcEdges } from './edges.ts';
import { calcEffectiveDurations } from './effective';
import { calcMachineCnt } from './machineCnt.ts';
import type { MachineCount } from './store.svelte.ts';
import { mapFromObject, shortCustom, shortRecipe } from './testutis.ts';

const MOCK_RECIPES: Recipe[] = [
  shortRecipe('SO2', { S: 1, O: 2000 }, { SO2: 1000 }, 3 * 20, 'ULV'),
  shortRecipe('SO3', { SO2: 1000, O: 1000 }, { SO3: 1000 }, 10 * 20, 'ULV'),
  shortRecipe('H2SO4', { SO3: 1000, H2O: 1000 }, { H2SO4: 1000 }, 8 * 20, 'ULV'),
];

const machineCntFromObj = (r: Record<string, number | string | Fraction>): MachineCount =>
  new Map(Object.keys(r).map((k) => [k, new Fraction(r[k])] as const));

describe('H2SO4 - bamboo', () => {
  const want: MachineCount = machineCntFromObj({
    SO2: 1,
    SO3: '3.(3)',
    H2SO4: '2.(6)',
  });
  for (const [target, cnt] of want) {
    test(`${target} = ${cnt}`, () => {
      const customs: CustomsMap = mapFromObject({ [target]: shortCustom({ cnt }) });
      const anchorCnt: MachineCount = machineCntFromObj({ [target]: cnt });
      const edges = calcEdges(MOCK_RECIPES, customs);
      const effectiveDurs = calcEffectiveDurations(MOCK_RECIPES, customs);
      const got = calcMachineCnt(MOCK_RECIPES, edges, anchorCnt, effectiveDurs);
      expect(got).toStrictEqual(want);
    });
  }
});
