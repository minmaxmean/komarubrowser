<script lang="ts">
  import '@xyflow/svelte/dist/style.css';
  import { ModeWatcher } from 'mode-watcher';
  import { onMount } from 'svelte';
  import favicon from '$lib/assets/favicon.svg';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import './layout.css';

  onMount(() => {
    dbStore.fetch();
  });
  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher defaultMode="dark" />
<div class="h-full m-4 gap-4 flex flex-col">
  {@render children()}
</div>
