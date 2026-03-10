import type { Recipe } from '@komarubrowser/common/db/recipe';

export type CalculatedEdge = {
  source: string;
  target: string;
  common: string;
};

export const calcEdges = (recipes: Recipe[]): CalculatedEdge[] =>
  recipes.flatMap((producer) =>
    producer.outputs.flatMap((output) => {
      const productedItem = output.i;
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
