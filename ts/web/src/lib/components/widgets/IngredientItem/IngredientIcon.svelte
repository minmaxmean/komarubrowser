<script lang="ts">
  import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
  import { iconVariants, type IconVariants } from './iconVariants';
  import { cn } from '$lib/utils';

  type Props = { item?: Ingredient } & IconVariants;

  const { item, size }: Props = $props();
  const default_texture_location = '';
  $inspect({ texture_location: item?.texture_location, hex_color: item?.hex_color });
</script>

<div class={cn('inline-block overflow-hidden', iconVariants({ size }))}>
  <img
    src={item?.texture_location ?? default_texture_location}
    class={cn(iconVariants({ size }), 'h-auto max-w-none object-top')}
    alt={item?.display_name}
  />
</div>
