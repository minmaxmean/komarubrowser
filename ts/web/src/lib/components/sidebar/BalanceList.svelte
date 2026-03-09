<script lang="ts" module>
  import { type VariantProps, tv } from 'tailwind-variants';

  export const balanceListVariants = tv({
    base: 'col-span-4 py-2 px-4',
    variants: {
      variant: {
        consumes: 'bg-(--input-block)',
        produces: 'bg-(--output-block)',
        recycles: 'bg-(--recycle-block)',
      },
    },
  });
  export type BalanceListVariant = Exclude<
    VariantProps<typeof balanceListVariants>['variant'],
    undefined
  >;
</script>

<script lang="ts">
  import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
  import type { IngredientBalance } from '$lib/calc/balance';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import { getTextProps } from '$lib/db/recipeCategoryRepo';
  import IngredientIcon from '../widgets/IngredientItem/IngredientIcon.svelte';
  import { cleanAndCapitalize } from '../widgets/RecipeWidget/utils';
  import { calcUnit } from './utils';

  type Props = {
    balances: IngredientBalance[];
    items?: Map<string, Ingredient>;
    variant: BalanceListVariant;
  };
  const { balances, items, variant }: Props = $props();
  let open = $state(true);
</script>

<Collapsible.Root class="contents" bind:open>
  <Collapsible.Trigger customStyles class={balanceListVariants({ variant })}>
    System {variant}
  </Collapsible.Trigger>
  <Collapsible.Content class="contents">
    {#each balances as balance}
      {@const item = items?.get(balance.ingredientId)}
      {@const { unit, amount } = calcUnit(!!item?.is_fluid, balance.value)}

      <p class="text-right text-pretty">
        {cleanAndCapitalize(item?.display_name ?? balance.ingredientId)}
      </p>
      <div class="flex items-center justify-center">
        <IngredientIcon {...getTextProps(item)} />
      </div>
      <p class="text-right">{amount}</p>
      <p class="text-left">{unit}</p>
    {/each}
  </Collapsible.Content>
</Collapsible.Root>
