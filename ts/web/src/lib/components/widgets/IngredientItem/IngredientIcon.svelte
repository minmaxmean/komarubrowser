<script lang="ts">
  import { asset } from '$app/paths';
  import type { ClassValue } from 'tailwind-variants';
  import { cn } from '$lib/utils';
  import { type IconVariants, iconVariants } from './iconVariants';

  type Props = {
    display_name?: string;
    url?: string | null;
    hex_color?: string;
    class?: ClassValue;
  } & IconVariants;
  const default_texture_location = `/komaru_16.png`;
  const { display_name, url: raw_url, hex_color, size, class: className }: Props = $props();
  const url = $derived.by(() => {
    let _url = raw_url ?? default_texture_location;
    if (!_url.startsWith('/')) {
      _url = '/' + _url;
    }
    return asset(_url);
  });
</script>

{#if hex_color}
  <div
    class={cn(
      'inline-block aspect-square overflow-hidden [image-rendering:pixelated]',
      'bg-(--icon-color) bg-(image:--icon-tex) bg-size-[100%_auto] bg-top bg-blend-multiply',
      'mask-(--icon-tex) mask-[100%_auto] mask-top',
      iconVariants({ size }),
      className,
    )}
    style="--icon-tex: url('{url}'); --icon-color: {hex_color};"
    role="img"
    aria-label={display_name}
    title={display_name}
  ></div>
{:else}
  <div class={cn('inline-block aspect-square overflow-hidden', iconVariants({ size }), className)}>
    <img
      src={url}
      class="h-auto w-full object-top [image-rendering:pixelated]"
      alt={display_name}
      title={display_name}
    />
  </div>
{/if}
