<script lang="ts">
  import {
    type EnergyTier,
    type EnergyTierID,
    energyTierFromID,
  } from '@komarubrowser/common/db/energyTier.js';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import { energyTierVarient } from './variants';

  type Props = { tier: EnergyTierID | EnergyTier };
  const { tier }: Props = $props();

  const energyTier = $derived(energyTierFromID(tier));
</script>

<Badge class={energyTierVarient({ tier: energyTier.name })}>
  {energyTier.name}
</Badge>
