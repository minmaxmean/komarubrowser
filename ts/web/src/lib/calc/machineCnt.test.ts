import Fraction from 'fraction.js';
import { describe, expect, test } from 'vitest';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap } from '$lib/appstate/customs';
import { calcDirectedEdges } from './edges.ts';
import { calcEffectiveDurations } from './effective';
import { calcMachineCnt } from './machineCnt.ts';
import type { MachineCount } from './store.svelte.ts';
import { mapFromObject, shortCustom, shortRecipe } from './testutis.ts';

const machineCntFromObj = (r: Record<string, number | string | Fraction>): MachineCount =>
  new Map(Object.keys(r).map((k) => [k, new Fraction(r[k])] as const));

describe('H2SO4 - bamboo', () => {
  const recipes: Recipe[] = [
    shortRecipe('SO2', { S: 1, O: 2000 }, { SO2: 1000 }, 3, 'ULV'),
    shortRecipe('SO3', { SO2: 1000, O: 1000 }, { SO3: 1000 }, 10, 'ULV'),
    shortRecipe('H2SO4', { SO3: 1000, H2O: 1000 }, { H2SO4: 1000 }, 8, 'ULV'),
  ];

  const want: MachineCount = machineCntFromObj({
    SO2: 1,
    SO3: '3.(3)',
    H2SO4: '2.(6)',
  });
  for (const [target, cnt] of want) {
    test(`${target} = ${cnt}`, () => {
      const customs: CustomsMap = mapFromObject({ [target]: shortCustom({ cnt }) });
      const anchorCnt: MachineCount = machineCntFromObj({ [target]: cnt });
      const edges = calcDirectedEdges(recipes, customs);
      const effectiveDurs = calcEffectiveDurations(recipes, customs);
      const got = calcMachineCnt(recipes, edges, anchorCnt, effectiveDurs);
      expect(got).toStrictEqual(want);
    });
  }
});

test('Fusion Hydrogen - B', () => {
  const recipes: Recipe[] = [
    shortRecipe('D', { H: 160 }, { D: 40 }, 8, 'LV'),
    shortRecipe('T', { D: 160 }, { T: 40 }, 8, 'MV'),
    shortRecipe('fusion', { D: 1000, T: 1000 }, { HPlasma: 1000 }, '7.2', 'IV'),
  ];
  const tCount = new Fraction(1000).div('7.2').div('40/8');
  const want: MachineCount = machineCntFromObj({
    fusion: 1,
    T: tCount,
    D: tCount.add(new Fraction(160, 8).mul(tCount).div('40/8')),
  });
  const customs: CustomsMap = mapFromObject({ fusion: shortCustom({ cnt: 1 }) });
  const anchorCnt: MachineCount = machineCntFromObj({ fusion: 1 });
  const edges = calcDirectedEdges(recipes, customs);
  const effectiveDurs = calcEffectiveDurations(recipes, customs);
  const got = calcMachineCnt(recipes, edges, anchorCnt, effectiveDurs);
  // srlog('got', got);
  expect(got).toStrictEqual(want);
});
