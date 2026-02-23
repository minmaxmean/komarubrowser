<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { energyTierFromID, type EnergyTierID } from '$lib/types/energyTier';
	import { energyTierVarient } from './variants';

	type Props = { tier: EnergyTierID };
	const { tier: energyTierID }: Props = $props();

	const energyTier = $derived(energyTierFromID(energyTierID));
</script>

<Badge class={energyTierVarient({ tier: energyTier.name })}>
	{energyTier.name}
</Badge>
