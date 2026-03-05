import {
  sql,
  type Expression,
  type ExpressionBuilder,
  type RawBuilder,
  type SqlBool,
} from 'kysely';
import { applyPagination, explain, type Pagination } from './common.js';
import type { Database, KyselyDB } from '@komarubrowser/common/db/database.js';
import { INGREDIENT_COLUMNS, type Ingredient } from '@komarubrowser/common/db/ingredient.js';
import type { RecipeCategory } from '@komarubrowser/common/db/recipeType.js';
import { hasIngredientFilter, type IngredientFilter } from './ingredientRepo.js';

type RecipeCategoryExpressionBuilder = ExpressionBuilder<Database, 'recipe_category'>;

export type RecipeCategoryFilter = {
  mode: 'or' | 'and';
  recipeTypeLike?: string;
  machineFilter: IngredientFilter;
};

const hasFilter =
  (filter: RecipeCategoryFilter) =>
  (eb: RecipeCategoryExpressionBuilder): Expression<SqlBool> => {
    const ops: Expression<SqlBool>[] = [];
    if (filter.recipeTypeLike) {
      ops.push(eb('recipe_category.recipe_type', 'like', `%${filter.recipeTypeLike}%`));
    }
    if (filter.mode === 'or') {
      return eb.or(ops);
    } else {
      return eb.and(ops);
    }
  };

export type FullRecipeCategory = RecipeCategory & {
  machine: Ingredient;
};

export class RecipeCategoryRepo {
  constructor(private db: KyselyDB) {}
  async search(
    filter: RecipeCategoryFilter,
    pagination: Pagination,
  ): Promise<FullRecipeCategory[]> {
    let query = this.db
      .selectFrom('recipe_category')
      .selectAll('recipe_category')
      .innerJoin('ingredient', 'ingredient.id', 'recipe_category.machine_id')
      .select(toJsonObject<Ingredient>('ingredient', INGREDIENT_COLUMNS).as('machine'))
      .where((eb) => eb.or([hasIngredientFilter(filter.machineFilter)(eb), hasFilter(filter)(eb)]));
    query = applyPagination(query, pagination);
    await explain(this.db, query);
    const items = await query.execute();
    console.table(items);
    return items as any;
  }
}

function toJsonObject<T>(table: string, columns: string[]): RawBuilder<T> {
  const fragments = columns.flatMap((col) => [sql.lit(col), sql.ref(`${table}.${col}`)]);
  return sql`json_object(${sql.join(fragments)})`;
}
