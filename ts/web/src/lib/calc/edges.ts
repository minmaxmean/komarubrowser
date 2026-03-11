import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap } from '$lib/appstate/customs';

export type CalculatedEdge = {
  source: string;
  target: string;
  common: string;
};

export const calcEdges = (recipes: Recipe[], customs: CustomsMap): CalculatedEdge[] =>
  recipes.flatMap((producer) => {
    const disabledEdges = new Set(customs.get(producer.id)?.disabledEdges ?? []);
    return recipes.flatMap((consumer): CalculatedEdge[] => {
      const commonItems = producer.outputs
        .filter((producedItem) => !disabledEdges.has(producedItem.i))
        .filter((commonItem) =>
          consumer.inputs.some((consumedItem) => consumedItem.i === commonItem.i),
        )
        .map((item) => item.i);
      return [...new Set(commonItems)].map(
        (common): CalculatedEdge => ({
          source: producer.id,
          target: consumer.id,
          common: common,
        }),
      );
    });
  });
