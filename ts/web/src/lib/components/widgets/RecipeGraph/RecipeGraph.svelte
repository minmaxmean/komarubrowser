<script lang="ts">
  import { Background, ConnectionLineType, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
  import type { NodeTypes } from '@xyflow/svelte';
  import { mode as colorMode } from 'mode-watcher';
  import { untrack } from 'svelte';
  import type { Recipe } from '@komarubrowser/common/db/recipe';
  import RecipeNode from './RecipeNode.svelte';
  import { type EdgeType, type NodeType, calcGraph, reposition } from './graph';

  type Props = {
    recipes: Recipe[];
  };
  const { recipes }: Props = $props();

  let nodes = $state.raw<NodeType[]>([]);
  let edges = $state.raw<EdgeType[]>([]);
  let needsLayout = $state(false);

  // Phase 1: Generate initial nodes when `recipes` prop changes
  $effect(() => {
    const rawGraph = calcGraph(recipes);

    nodes = rawGraph.nodes;
    edges = rawGraph.edges;

    if (rawGraph.nodes.length > 0) {
      needsLayout = true;
    }
  });

  $effect(() => {
    if (needsLayout && nodes.length > 0) {
      const allMeasured = nodes.every((n) => n.measured?.width && n.measured?.height);

      if (allMeasured) {
        untrack(() => {
          nodes = reposition(nodes, edges);
          needsLayout = false;
        });
      }
    }
  });

  const nodeTypes: NodeTypes = {
    recipe: RecipeNode,
  };
</script>

<div class="w-full h-240 rounded-md border">
  <SvelteFlow
    colorMode={colorMode.current}
    bind:nodes
    bind:edges
    {nodeTypes}
    fitView
    minZoom={0.25}
    nodesDraggable={false}
    nodesConnectable={false}
    elementsSelectable={false}
    connectionLineType={ConnectionLineType.SmoothStep}
    defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
  >
    <Background />
    <MiniMap nodeStrokeWidth={3} />
    <Controls />
  </SvelteFlow>
</div>
