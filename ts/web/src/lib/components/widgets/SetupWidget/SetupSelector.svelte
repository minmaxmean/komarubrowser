<script lang="ts">
  import type { ClassValue } from 'tailwind-variants';
  import { appState } from '$lib/appstate/app_state.svelte';
  import * as Select from '$lib/components/ui/select/index.js';
  import { cn } from '$lib/utils';

  type Props = { class?: ClassValue | undefined | null };
  let { class: className }: Props = $props();
  const selections = $derived(appState.setups.list());
  const current = $derived(appState.setups.current());
</script>

<Select.Root
  type="single"
  bind:value={() => current, (newValue) => appState.setups.change(newValue)}
>
  <Select.Trigger class={cn('w-max', className)}>
    {current}
  </Select.Trigger>
  <Select.Content>
    {#each selections as setup}
      <Select.Item value={setup} label={setup}>
        {setup}
      </Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
