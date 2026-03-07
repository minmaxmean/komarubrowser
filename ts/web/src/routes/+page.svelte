<script lang="ts">
  import { appState } from '$lib/appstate/app_state.svelte';
  import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
  import RecipeGraph from '$lib/components/widgets/RecipeGraph/RecipeGraph.svelte';
  import RecipeSelector from '$lib/components/widgets/RecipeSelector/RecipeSelector.svelte';
</script>

<div class="flex flex-row h-full w-full overflow-hidden">
  <main class="grow overflow-hidden flex flex-col gap-4 p-4">
    <RecipeSelector bind:selectedItems={appState.value.selectedRecipes} />

    <RecipeGraph
      recipes={appState.value.selectedRecipes}
      bind:customs={appState.value.calcCustoms}
    />
  </main>
  <aside class="w-80 border-r flex flex-col overflow-y-auto bg-card gap-4 pt-4">
    <Sidebar />
  </aside>
</div>
