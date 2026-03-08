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
