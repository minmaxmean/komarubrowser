import darge from '@dagrejs/dagre';
import type { BuiltInEdge, Node } from '@xyflow/svelte';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';
import type { CalculatedEdge } from '$lib/calc/edges';

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

export function calcGraph(recipes: Recipe[], calcEdges: CalculatedEdge[]): FlowGraph {
  const nodes = recipes.map(
    (r, idx): RecipeNodeType => ({
      id: r.id,
      position: { x: idx * 10, y: idx * 60 },
      type: 'recipe',
      data: { recipe: r },
    }),
  );
  const edges = calcEdges.map(({ source, target, common }) => ({
    id: `${source}_${target}_${common}`,
    source,
    target,
    sourceHandle: common,
    targetHandle: common,
  }));
  return { nodes, edges };
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
