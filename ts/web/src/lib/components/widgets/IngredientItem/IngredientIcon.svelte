<script lang="ts">
  import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
  import { iconVariants, type IconVariants } from './iconVariants';
  import { cn } from '$lib/utils';

  type Props = { item?: Ingredient } & IconVariants;
  const { item, size }: Props = $props();
  const default_texture_location = '/komaru_16.png';
  const texture = $derived(item?.texture_location ?? default_texture_location);
  const color = $derived(item?.hex_color);
</script>

{#if color}
  <div
    class={cn(
      'inline-block aspect-square overflow-hidden [image-rendering:pixelated]',
      'bg-(--icon-color) bg-(image:--icon-tex) bg-size-[100%_auto] bg-top bg-blend-multiply',
      'mask-(--icon-tex) mask-[100%_auto] mask-top',
      iconVariants({ size }),
    )}
    style="--icon-tex: url('{texture}'); --icon-color: {color};"
    role="img"
    aria-label={item?.display_name}
    title={item?.display_name}
  ></div>
{:else}
  <div class={cn('inline-block aspect-square overflow-hidden', iconVariants({ size }))}>
    <img
      src={texture}
      class="h-auto w-full object-top [image-rendering:pixelated]"
      alt={item?.display_name}
      title={item?.display_name}
    />
  </div>
{/if}
