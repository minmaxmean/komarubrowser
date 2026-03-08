<script lang="ts">
  import { Background, ConnectionLineType, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
  import type { GetMiniMapNodeAttribute, NodeTypes } from '@xyflow/svelte';
  import { mode as colorMode } from 'mode-watcher';
  import { untrack } from 'svelte';
  import { appState } from '$lib/appstate/app_state.svelte';
  import { calculations } from '$lib/calc/store.svelte';
  import RecipeNode from './RecipeNode.svelte';
  import {
    type EdgeType,
    type NodeType,
    type RecipeNodeData,
    applyMachineCnt,
    calcGraph,
    reposition,
  } from './graph';

  // 1. Single derived model combining appState and derived calculations
  const graphModel = $derived.by(() => {
    const rawGraph = calcGraph(appState.value.selectedRecipes, appState.value.calcCustoms);

    rawGraph.nodes = rawGraph.nodes.map((n) =>
      applyMachineCnt(n, calculations.machineCnt(n.id), calculations.isBadMachine(n.id)),
    );

    return rawGraph;
  });

  let nodes = $state.raw<NodeType[]>([]);
  let edges = $state.raw<EdgeType[]>([]);
  let needsLayout = $state(false);

  // 2. Sync to SvelteFlow state ONLY when the underlying model changes
  $effect(() => {
    const updatedModel = graphModel;
    untrack(() => {
      nodes = updatedModel.nodes;
      edges = updatedModel.edges;
      if (nodes.length > 0) {
        needsLayout = true;
      }
    });
  });

  // 3. Layout pass
  $effect(() => {
    if (!needsLayout || nodes.length === 0) {
      return;
    }
    const allMeasured = nodes.every((n) => n.measured?.width && n.measured?.height);
    if (!allMeasured) return;

    untrack(() => {
      nodes = reposition(nodes, edges);
      needsLayout = false;
    });
  });

  const nodeTypes: NodeTypes = { recipe: RecipeNode };

  const minimapNodeColor: GetMiniMapNodeAttribute = (node) => {
    const data = node.data as RecipeNodeData;
    if (data.isBad) return 'var(--color-red-800)';
    if (!data.calcSettings.isAuto) return 'var(--machine-block)';
    return 'var(--color-neutral-700)';
  };
</script>

<div class="w-full h-full rounded-md border">
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
    <MiniMap nodeStrokeWidth={3} nodeColor={minimapNodeColor} />
    <Controls />
  </SvelteFlow>
</div>
