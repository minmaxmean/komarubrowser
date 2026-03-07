<script lang="ts">
  import { Background, ConnectionLineType, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
  import type { GetMiniMapNodeAttribute, NodeTypes } from '@xyflow/svelte';
  import { mode as colorMode } from 'mode-watcher';
  import { untrack } from 'svelte';
  import type { Recipe } from '@komarubrowser/common/db/recipe';
  import { calculations } from '$lib/calc/store.svelte';
  import RecipeNode from './RecipeNode.svelte';
  import type { Customs } from './customs';
  import {
    type EdgeType,
    type NodeType,
    type RecipeNodeData,
    calcGraph,
    reposition,
    setMachineCnt,
  } from './graph';

  type Props = {
    recipes: Recipe[];
    customs: Customs;
  };
  const { recipes, customs = $bindable() }: Props = $props();

  let nodes = $state.raw<NodeType[]>([]);
  let edges = $state.raw<EdgeType[]>([]);
  let needsLayout = $state(false);

  // Phase 1: Generate initial nodes when `recipes` prop changes
  $effect(() => {
    const rawGraph = calcGraph(recipes, customs);

    rawGraph.nodes = rawGraph.nodes.map((n) =>
      setMachineCnt(n, calculations.machineCnt(n.id), calculations.isBadMachine(n.id)),
    );

    nodes = rawGraph.nodes;
    edges = rawGraph.edges;

    if (rawGraph.nodes.length > 0) {
      needsLayout = true;
    }
  });

  $effect(() => {
    if (!needsLayout || nodes.length === 0) {
      return;
    }
    const allMeasured = nodes.every((n) => n.measured?.width && n.measured?.height);
    if (!allMeasured) {
      return;
    }
    untrack(() => {
      nodes = reposition(nodes, edges);
      needsLayout = false;
    });
  });

  const nodeTypes: NodeTypes = {
    recipe: RecipeNode,
  };

  const minimapNodeColor: GetMiniMapNodeAttribute = (node) => {
    const data = node.data as RecipeNodeData;
    if (data.isBad) {
      return 'var(--color-red-800)';
    }
    if (!data.calcSettings.isAuto) {
      return 'var(--machine-block)';
    }
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
