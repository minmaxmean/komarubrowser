<script lang="ts">
  import { appState } from '$lib/appstate/app_state.svelte';
  import RecipeGraph from '$lib/components/widgets/RecipeGraph/RecipeGraph.svelte';
  import RecipeSelector from '$lib/components/widgets/RecipeSelector/RecipeSelector.svelte';
</script>

<RecipeSelector bind:selectedItems={appState.value.selectedRecipes} />

<RecipeGraph recipes={appState.value.selectedRecipes} bind:customs={appState.value.calcCustoms} />
