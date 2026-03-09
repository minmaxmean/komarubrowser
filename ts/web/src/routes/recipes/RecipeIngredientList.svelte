<script lang="ts">
  import type { RecipeIngredient } from '@komarubrowser/common/db/recipe.js';

  type RecipeIngredienListProps = {
    items: RecipeIngredient[];
  };
  const { items }: RecipeIngredienListProps = $props();
</script>

<ul>
  {#each items as item}
    <li>{item.i} x {item.a}</li>
  {/each}
</ul>
