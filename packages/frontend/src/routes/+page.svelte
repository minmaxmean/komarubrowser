<script>
	import * as Item from '$lib/components/ui/item';
	import IngredientItem from '$lib/components/widgets/IngredientItem/IngredientItem.svelte';
	import { scoreIngredient } from '$lib/components/widgets/SeachWidget/scorers';
	import SearchWidget from '$lib/components/widgets/SeachWidget/SearchWidget.svelte';
	import { ingredientStore } from '$lib/store/ingStore.svelte';
  import {ingredientIdFn} from '@komarubrowser/common/types'
</script>


<div class="flex w-full max-w-md flex-col gap-6">
	<Item.Root variant="outline">
		<Item.Content>
			<Item.Title>Welcome to KomaruBrowser</Item.Title>
			<Item.Description>
				<SearchWidget items={ingredientStore.data} scorerFn={scoreIngredient} idFn={ingredientIdFn}>
					{#snippet children(item)}
						<IngredientItem size="sm" {item} />
					{/snippet}
					{#snippet row(item)}
						<IngredientItem {item} />
					{/snippet}
				</SearchWidget>
			</Item.Description>
		</Item.Content>
	</Item.Root>
</div>
