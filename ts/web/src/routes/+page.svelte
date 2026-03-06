<script lang="ts">
  import Chevron from '@lucide/svelte/icons/chevron-right';
  import { appState } from '$lib/appstate/app_state.svelte';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import RecipeGraph from '$lib/components/widgets/RecipeGraph/RecipeGraph.svelte';
  import RecipeSelector from '$lib/components/widgets/RecipeSelector/RecipeSelector.svelte';

  let searchOpen = $state(false);
</script>

<Collapsible.Root class="w-full rounded-md border whitespace-nowrap" bind:open={searchOpen}>
  <Collapsible.Trigger variant="ghost" size="lg" class="m-4 pl-0!">
    <Chevron class="transition-transform duration-200 {searchOpen ? 'rotate-90' : 'rotate-0'}" />
    Add Recipes
  </Collapsible.Trigger>
  <Collapsible.Content>
    <RecipeSelector bind:selectedItems={appState.value.selectedRecipes} />
  </Collapsible.Content>
</Collapsible.Root>

<RecipeGraph recipes={appState.value.selectedRecipes} bind:customs={appState.value.calcCustoms} />
