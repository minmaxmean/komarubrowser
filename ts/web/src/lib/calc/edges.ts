import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { CustomsMap } from '$lib/appstate/customs';

export type CalculatedEdge = {
  source: string;
  target: string;
  common: string;
};

export const calcEdges = (recipes: Recipe[], customs: CustomsMap): CalculatedEdge[] =>
  recipes.flatMap((producer) =>
    producer.outputs.flatMap((output): CalculatedEdge[] => {
      const productedItem = output.i;
      if (customs.get(producer.id)?.disabledEdges?.includes(productedItem)) {
        return [];
      }
      const consumers = recipes.filter((consumer) =>
        consumer.inputs.some((input) => input.i === productedItem && (!input.c || input.c > 0)),
      );
      return consumers.map(
        (consumer): CalculatedEdge => ({
          source: producer.id,
          target: consumer.id,
          common: productedItem,
        }),
      );
    }),
  );
