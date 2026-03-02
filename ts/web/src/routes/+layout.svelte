<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { ModeWatcher } from 'mode-watcher';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    dbStore.fetch();
  });
  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher defaultMode="dark" />
<div class="m-4">
  {@render children()}
</div>
