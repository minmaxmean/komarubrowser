<script lang="ts">
  import {
    Background,
    ConnectionLineType,
    Controls,
    MiniMap,
    Panel,
    SvelteFlow,
  } from '@xyflow/svelte';
  import type { GetMiniMapNodeAttribute, NodeTypes } from '@xyflow/svelte';
  import { mode as colorMode } from 'mode-watcher';
  import { untrack } from 'svelte';
  import type { Recipe } from '@komarubrowser/common/db/recipe';
  import Button from '$lib/components/ui/button/button.svelte';
  import RecipeNode from './RecipeNode.svelte';
  import { calcMachineCnt } from './calc';
  import type { Customs } from './customs';
  import {
    type EdgeType,
    type NodeType,
    type RecipeNodeData,
    calcGraph,
    reposition,
  } from './graph';

  type Props = {
    recipes: Recipe[];
    customs: Customs;
  };
  const { recipes, customs = $bindable() }: Props = $props();

  $inspect(`customs`, customs);

  let nodes = $state.raw<NodeType[]>([]);
  let edges = $state.raw<EdgeType[]>([]);
  let needsLayout = $state(false);

  // Phase 1: Generate initial nodes when `recipes` prop changes
  $effect(() => {
    const rawGraph = calcGraph(recipes, customs);

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

  const minimapNodeColor: GetMiniMapNodeAttribute = (node) => {
    const data = node.data as RecipeNodeData;
    if (data.calcState.isAuto) {
      return 'var(--color-green-500)';
    }
    return 'var(--color-blue-500)';
  };

  const autoBalance = () => {
    const machineCnt = calcMachineCnt(nodes, edges);
    nodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        calcState: { ...node.data.calcState, machineCnt: machineCnt.get(node.id) },
      },
    }));
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
    <Panel position="bottom-center">
      <Button onclick={autoBalance}>Auto Balance</Button>
    </Panel>
    <Background />
    <MiniMap nodeStrokeWidth={3} nodeColor={minimapNodeColor} />
    <Controls />
  </SvelteFlow>
</div>
