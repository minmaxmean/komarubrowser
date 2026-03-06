<script lang="ts">
  import type { NodeProps } from '@xyflow/svelte';
  import RecipeWidget from '../RecipeWidget/RecipeWidget.svelte';
  import type { RecipeNodeType } from './graph';

  const { data }: NodeProps<RecipeNodeType> = $props();
</script>

<RecipeWidget recipe={data.recipe} withHandles />
