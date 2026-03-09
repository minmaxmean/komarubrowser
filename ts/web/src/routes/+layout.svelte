<script lang="ts">
  import { asset } from '$app/paths';
  import '@xyflow/svelte/dist/style.css';
  import { ModeWatcher } from 'mode-watcher';
  import { onMount } from 'svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import './layout.css';

  onMount(() => dbStore.fetch());
  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={asset('/favicon.ico')} /></svelte:head>
<ModeWatcher defaultMode="dark" />
<div class="h-screen w-screen">
  {@render children()}
</div>
