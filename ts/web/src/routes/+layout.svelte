<script lang="ts">
  import '@xyflow/svelte/dist/style.css';
  import { ModeWatcher } from 'mode-watcher';
  import { onMount } from 'svelte';
  import favicon from '$lib/assets/favicon.ico';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import './layout.css';

  onMount(() => dbStore.fetch());
  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher defaultMode="dark" />
<div class="h-screen w-screen">
  {@render children()}
</div>
