import darge from '@dagrejs/dagre';
import { type BuiltInEdge, type BuiltInNode, Position } from '@xyflow/svelte';
import type { Recipe } from '@komarubrowser/common/db/recipe';
import { getDisplayName } from '../RecipeWidget/utils';

export type NodeType = BuiltInNode;
export type EdgeType = BuiltInEdge;

type FlowGraph = {
  nodes: NodeType[];
  edges: EdgeType[];
};

export function calcGraph(recipes: Recipe[]): FlowGraph {
  const nodes = recipes.map(
    (r, idx): NodeType => ({
      id: r.id,
      position: { x: idx * 10, y: idx * 60 },
      type: 'default',
      data: { label: getDisplayName(r.id) },
    }),
  );
  const edges: EdgeType[] = recipes.flatMap((producer) => {
    const inputIds = producer.outputs.map((output) => output.accepted_ids[0]);
    if (inputIds.length === 0) {
      return [];
    }
    return recipes
      .filter((consumer) =>
        consumer.inputs.some((input) => inputIds.includes(input.accepted_ids[0])),
      )
      .map((consumer) => ({
        id: `${producer.id}_to_${consumer.id}`,
        source: producer.id,
        target: consumer.id,
      }));
  });
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
    console.log(node.id, width, height);
    g.setNode(node.id, { ...node, width, height });
  });
  darge.layout(g);
  return nodes.map((node) => {
    const position = g.node(node.id);
    const x = position.x - (node.measured?.width ?? defaultWidth) / 2;
    const y = position.y - (node.measured?.height ?? defaultHeight) / 2;

    return {
      ...node,
      position: { x, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: 'text-wrap: pretty',
    };
  });
}
