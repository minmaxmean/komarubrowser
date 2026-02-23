<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { recipeStore } from '$lib/store/recipeStore.svelte';
	import { ingredientStore } from '$lib/store/ingStore.svelte';

	onMount(() => {
		ingredientStore.fetch();
		recipeStore.fetch();
	});
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher defaultMode="dark" />
<div class="m-4">
	{@render children()}
</div>
