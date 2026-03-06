<script lang="ts">
  import { cn } from '$lib/utils';
  import { type IconVariants, iconVariants } from './iconVariants';

  type Props = { display_name?: string; url?: string | null; hex_color?: string } & IconVariants;
  const default_texture_location = '/komaru_16.png';
  const { display_name, url = default_texture_location, hex_color, size }: Props = $props();
</script>

{#if hex_color}
  <div
    class={cn(
      'inline-block aspect-square overflow-hidden [image-rendering:pixelated]',
      'bg-(--icon-color) bg-(image:--icon-tex) bg-size-[100%_auto] bg-top bg-blend-multiply',
      'mask-(--icon-tex) mask-[100%_auto] mask-top',
      iconVariants({ size }),
    )}
    style="--icon-tex: url('{url}'); --icon-color: {hex_color};"
    role="img"
    aria-label={display_name}
    title={display_name}
  ></div>
{:else}
  <div class={cn('inline-block aspect-square overflow-hidden', iconVariants({ size }))}>
    <img
      src={url}
      class="h-auto w-full object-top [image-rendering:pixelated]"
      alt={display_name}
      title={display_name}
    />
  </div>
{/if}
