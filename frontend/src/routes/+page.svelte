<script>
	import * as Item from '$lib/components/ui/item';
	import SearchWidget from '$lib/components/widgets/SeachWidget/SearchWidget.svelte';
</script>

<div class="flex w-full max-w-md flex-col gap-6">
	<Item.Root variant="outline">
		<Item.Content>
			<Item.Title>Welcome to KomaruBrowser</Item.Title>
			<Item.Description>
				<SearchWidget />
			</Item.Description>
		</Item.Content>
	</Item.Root>
</div>
