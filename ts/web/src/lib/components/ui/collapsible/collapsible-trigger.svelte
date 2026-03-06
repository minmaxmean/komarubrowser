<script lang="ts">
  import { Collapsible as CollapsiblePrimitive } from 'bits-ui';
  import { cn } from '$lib/utils';
  import { type ButtonSize, type ButtonVariant, buttonVariants } from '../button';

  type Props = CollapsiblePrimitive.TriggerProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

  let {
    ref = $bindable(null),
    variant = 'default',
    size = 'default',
    class: className,
    ...restProps
  }: Props = $props();
</script>

<CollapsiblePrimitive.Trigger
  class={cn(buttonVariants({ variant, size }), className)}
  bind:ref
  data-slot="collapsible-trigger"
  {...restProps}
/>
