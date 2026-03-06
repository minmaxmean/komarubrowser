<script lang="ts">
  import { type EnergyTierID, energyTierFromID } from '@komarubrowser/common/db/energyTier.js';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import { energyTierVarient } from './variants';

  type Props = { tier: EnergyTierID };
  const { tier: energyTierID }: Props = $props();

  const energyTier = $derived(energyTierFromID(energyTierID));
</script>

<Badge class={energyTierVarient({ tier: energyTier.name })}>
  {energyTier.name}
</Badge>
