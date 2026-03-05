<script lang="ts" generics="T extends IngredientLike">
  import * as Item from '$lib/components/ui/item/index.js';
  import type { ItemSize } from '$lib/components/ui/item/item.svelte';
  import IngredientIcon from './IngredientIcon.svelte';
  import { cn } from '$lib/utils';
  import type { ClassValue } from 'svelte/elements';
  import { getTextProps, type IngredientLike } from '$lib/db/recipeCategoryRepo';

  type Props = {
    item: T;
    size?: ItemSize;
    class?: ClassValue;
  };

  const { item, size, class: className }: Props = $props();
  const { display_name, url, hex_color, description } = $derived.by(() => getTextProps(item));
  // $inspect(item, { display_name, texture_location, hex_color, description });
</script>

<Item.Root {size} class={cn('w-full p-2', className)}>
  <Item.Media>
    <IngredientIcon {size} {display_name} {url} {hex_color} />
  </Item.Media>
  <Item.Content class="gap-0.5">
    <Item.Title>{display_name}</Item.Title>
    {#if size != 'sm'}
      <Item.Description>{description}</Item.Description>
    {/if}
  </Item.Content>
</Item.Root>
