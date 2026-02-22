<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { ingredientStore } from '$lib/data/ingredientStore.svelte';
	import { recipeStore } from '$lib/data/recipeStore.svelte';

	onMount(() => {
		ingredientStore.fetch();
		recipeStore.fetch();
	});
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher defaultMode="dark" />
{@render children()}
