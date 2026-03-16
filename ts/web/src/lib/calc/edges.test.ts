import { assert, describe, test } from 'vitest';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap } from '$lib/appstate/customs';
import {
  type CalculatedEdge,
  type DirectedEdgeList,
  type DirectedEdges,
  calcDirectedEdges,
  calcEdges,
} from './edges.ts';
import { mapFromObject, shortCustom, shortRecipe } from './testutis.ts';

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

type ShortDirectedEdgeListArg = { poopsTo?: string[]; eatsFrom?: string[] };
const shortDirectedEdgeList = ({
  poopsTo,
  eatsFrom,
}: ShortDirectedEdgeListArg): DirectedEdgeList => ({
  poopsTo: new Set(poopsTo),
  eatsFrom: new Set(eatsFrom),
});

describe('calcDirectedEdges', () => {
  describe('H2SO4 - bamboo', () => {
    const recipes: Recipe[] = [
      shortRecipe('SO2', { S: 1, O: 2000 }, { SO2: 1000 }, 3 * 20, 'ULV'),
      shortRecipe('SO3', { SO2: 1000, O: 1000 }, { SO3: 1000 }, 10 * 20, 'ULV'),
      shortRecipe('H2SO4', { SO3: 1000, H2O: 1000 }, { H2SO4: 1000 }, 8 * 20, 'ULV'),
    ];
    test('SO2 = 1', () => {
      const customs: CustomsMap = mapFromObject({
        SO2: shortCustom({ cnt: 1 }),
      });
      const want: DirectedEdges = mapFromObject({
        SO2: shortDirectedEdgeList({ poopsTo: ['SO3'] }),
        SO3: shortDirectedEdgeList({ poopsTo: ['H2SO4'] }),
        H2SO4: shortDirectedEdgeList({}),
      });
      const got = calcDirectedEdges(recipes, customs);
      assert.deepEqual(got, want);
    });
    test('SO3 = 1', () => {
      const customs: CustomsMap = mapFromObject({
        SO3: shortCustom({ cnt: 1 }),
      });
      const want: DirectedEdges = mapFromObject({
        SO2: shortDirectedEdgeList({}),
        SO3: shortDirectedEdgeList({ eatsFrom: ['SO2'], poopsTo: ['H2SO4'] }),
        H2SO4: shortDirectedEdgeList({}),
      });
      const got = calcDirectedEdges(recipes, customs);
      assert.deepEqual(got, want);
    });
    test('H2SO4 = 1', () => {
      const customs: CustomsMap = mapFromObject({
        H2SO4: shortCustom({ cnt: 1 }),
      });
      const want: DirectedEdges = mapFromObject({
        SO2: shortDirectedEdgeList({}),
        SO3: shortDirectedEdgeList({ eatsFrom: ['SO2'] }),
        H2SO4: shortDirectedEdgeList({ eatsFrom: ['SO3'] }),
      });
      const got = calcDirectedEdges(recipes, customs);
      assert.deepEqual(got, want);
    });
  });
});
