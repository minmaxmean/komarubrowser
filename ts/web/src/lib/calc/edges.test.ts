import { assert, describe, test } from 'vitest';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap } from '$lib/appstate/customs';
import { type CalculatedEdge, calcEdges } from './edges.ts';
import { mapFromObject, shortRecipe } from './testutis.ts';

describe('calcEdges', () => {
  test('H2SO4 - bamboo', () => {
    const recipes: Recipe[] = [
      shortRecipe('SO2', { S: 1, O: 2000 }, { SO2: 1000 }, 3 * 20, 'ULV'),
      shortRecipe('SO3', { SO2: 1000, O: 1000 }, { SO3: 1000 }, 10 * 20, 'ULV'),
      shortRecipe('H2SO4', { SO3: 1000, H2O: 1000 }, { H2SO4: 1000 }, 8 * 20, 'ULV'),
    ];
    const customs: CustomsMap = mapFromObject({});
    const want: CalculatedEdge[] = [
      { source: 'SO2', target: 'SO3', common: 'SO2' },
      { source: 'SO3', target: 'H2SO4', common: 'SO3' },
    ];
    const got = calcEdges(recipes, customs);
    assert.deepEqual(got, want);
  });
});
