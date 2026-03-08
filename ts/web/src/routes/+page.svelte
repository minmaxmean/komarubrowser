<script lang="ts">
  import { appState } from '$lib/appstate/app_state.svelte';
  import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
  import { Toaster } from '$lib/components/ui/sonner';
  import RecipeGraph from '$lib/components/widgets/RecipeGraph/RecipeGraph.svelte';
  import RecipeSelector from '$lib/components/widgets/RecipeSelector/RecipeSelector.svelte';
</script>

<div class="flex flex-row h-full w-full">
  <Toaster richColors />
  <main class="w-full flex flex-col gap-4 p-4 min-w-0">
    <RecipeSelector bind:selectedItems={appState.selectedRecipes} />

    <RecipeGraph />
  </main>
  <aside class="w-lg flex flex-col bg-card gap-4 pt-4">
    <Sidebar />
  </aside>
</div>
