<script lang="ts">
  import type { ClassValue } from 'tailwind-variants';
  import {
    type EnergyTierID,
    energyTier,
    energyTiers,
  } from '@komarubrowser/common/db/energyTier.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { cn } from '$lib/utils';
  import EnergyTierWidget from './EnergyTierWidget.svelte';

  type Props = {
    value?: EnergyTierID;
    minTier: EnergyTierID;
    class?: ClassValue | undefined | null;
    disabled?: boolean;
  };
  let {
    class: className,
    minTier: minTier,
    value = $bindable(minTier),
    disabled = $bindable(),
  }: Props = $props();
  const selections = $derived(energyTiers.filter((et) => et.id >= minTier));
</script>

<Select.Root
  type="single"
  name="energyTier"
  bind:value={() => value.toString(), (newValue) => (value = energyTier(Number.parseInt(newValue)))}
>
  <Select.Trigger class={cn('w-full justify-end', className)} {disabled}>
    <EnergyTierWidget tier={value} />
  </Select.Trigger>
  <Select.Content>
    {#each selections as tier (tier.id)}
      <Select.Item value={tier.id.toString()} label={tier.fullName}>
        <EnergyTierWidget {tier} />
      </Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
