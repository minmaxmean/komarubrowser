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
        .filter((producedItem) => !disabledEdges.has(producedItem.i) && producedItem.c !== 0)
        .filter((commonItem) =>
          consumer.inputs.some(
            (consumedItem) => consumedItem.i === commonItem.i && consumedItem.c !== 0,
          ),
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

export type DirectedEdgeList = { poopsTo: Set<string>; eatsFrom: Set<String> };
export type DirectedEdges = Map<string, DirectedEdgeList>;

// Do BFS to direct edges from anchors
export const calcDirectedEdges = (recipes: Recipe[], customs: CustomsMap): DirectedEdges => {
  const undirectedEdges = calcEdges(recipes, customs);
  const edges: DirectedEdges = new Map();
  // Start Queue with anchors
  const queue: string[] = customs
    .entries()
    .filter(([_, custom]) => !custom.isAuto && custom.cnt)
    .map(([nodeId]) => nodeId)
    .toArray();
  const queuedUp = new Set<string>(queue);
  while (queue.length > 0) {
    const me = queue.splice(0, 1)[0];
    const myEdges: DirectedEdgeList = edges.get(me) ?? { poopsTo: new Set(), eatsFrom: new Set() };
    for (const edge of undirectedEdges) {
      if (edge.source === me) {
        // me = producer, target = consumer
        const alreadyExists = edges.get(edge.target)?.eatsFrom.has(me) || false;
        if (alreadyExists) continue;
        if (!queuedUp.has(edge.target)) {
          queuedUp.add(edge.target);
          queue.push(edge.target);
        }
        myEdges.poopsTo.add(edge.target);
      } else if (edge.target === me) {
        // me = consumer, source = producer
        const alreadyExists = edges.get(edge.source)?.poopsTo.has(me) || false;
        if (alreadyExists) continue;
        if (!queuedUp.has(edge.source)) {
          queuedUp.add(edge.source);
          queue.push(edge.source);
        }
        myEdges.eatsFrom.add(edge.source);
      }
    }
    edges.set(me, myEdges);
  }

  return edges;
};
