<script lang="ts">
  import type { RecipeIngredient } from '@komarubrowser/common/db/recipe';

  type RecipeIngredienListProps = {
    items: RecipeIngredient[];
  };
  const { items }: RecipeIngredienListProps = $props();
</script>

<ul>
  {#each items as item}
    <li>{item.accepted_ids[0]} x {item.amount}</li>
  {/each}
</ul>
