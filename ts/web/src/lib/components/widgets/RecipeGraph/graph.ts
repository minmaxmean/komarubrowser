import darge from '@dagrejs/dagre';
import type { BuiltInEdge, Node } from '@xyflow/svelte';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';

export type RecipeNodeData = {
  recipe: Recipe;
};

export type RecipeNodeType = Node<RecipeNodeData, 'recipe'>;

export type NodeType = RecipeNodeType;
export type EdgeType = BuiltInEdge;

type FlowGraph = {
  nodes: NodeType[];
  edges: EdgeType[];
};

export const calcEdges = (recipes: Recipe[]): EdgeType[] =>
  recipes.flatMap((producer) =>
    producer.outputs.flatMap((output) => {
      const productedItem = output.i;
      const consumers = recipes.filter((consumer) =>
        consumer.inputs.some((input) => input.i === productedItem && (!input.c || input.c > 0)),
      );
      return consumers.map(
        (consumer): EdgeType => ({
          id: `${producer.id}_${consumer.id}_${productedItem}`,
          source: producer.id,
          target: consumer.id,
          sourceHandle: productedItem,
          targetHandle: productedItem,
        }),
      );
    }),
  );

export function calcGraph(recipes: Recipe[]): FlowGraph {
  const nodes = recipes.map(
    (r, idx): RecipeNodeType => ({
      id: r.id,
      position: { x: idx * 10, y: idx * 60 },
      type: 'recipe',
      data: { recipe: r },
    }),
  );
  return { nodes, edges: calcEdges(recipes) };
}

export function reposition(nodes: NodeType[], edges: EdgeType[]): NodeType[] {
  const g = new darge.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR' });
  const defaultWidth = 0;
  const defaultHeight = 0;
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => {
    const width = node.measured?.width ?? defaultWidth;
    const height = node.measured?.height ?? defaultHeight;
    g.setNode(node.id, { ...node, width, height });
  });
  darge.layout(g);
  return nodes.map((node) => {
    const position = g.node(node.id);
    const x = position.x - (node.measured?.width ?? defaultWidth) / 2;
    const y = position.y - (node.measured?.height ?? defaultHeight) / 2;

    return { ...node, position: { x, y } };
  });
}
