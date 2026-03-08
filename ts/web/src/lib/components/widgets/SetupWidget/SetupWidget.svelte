<script>
  import Trash from '@lucide/svelte/icons/Trash';
  import Edit from '@lucide/svelte/icons/pencil';
  import Plus from '@lucide/svelte/icons/plus';
  import { Button } from '$lib/components/ui/button';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import SetupSelector from './SetupSelector.svelte';
</script>

<ButtonGroup.Root class="w-full">
  <SetupSelector />
  <Button variant="secondary">
    <Edit />
  </Button>
  <Button variant="secondary">
    <Plus />
  </Button>
  <Button variant="secondary">
    <Trash />
  </Button>
</ButtonGroup.Root>
