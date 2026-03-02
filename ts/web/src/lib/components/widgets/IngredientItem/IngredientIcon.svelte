<script lang="ts">
  import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
  import { iconVariants, type IconVariants } from './iconVariants';

  type Props = { item: Ingredient } & IconVariants;

  const { item, size }: Props = $props();
</script>

<img src={item.texture_location} class={iconVariants({ size })} alt={item.display_name} />
