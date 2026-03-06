<script lang="ts">
  import { Background, ConnectionLineType, SvelteFlow } from '@xyflow/svelte';
  import { mode as colorMode } from 'mode-watcher';
  import { tick, untrack } from 'svelte';
  import type { Recipe } from '@komarubrowser/common/db/recipe';
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
</script>

<div class="w-full h-240 rounded-md border">
  <SvelteFlow
    colorMode={colorMode.current}
    bind:nodes
    bind:edges
    fitView
    connectionLineType={ConnectionLineType.SmoothStep}
    defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
  >
    <Background />
  </SvelteFlow>
</div>
