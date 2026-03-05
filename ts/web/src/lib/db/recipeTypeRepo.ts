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
import type { RecipeType } from '@komarubrowser/common/db/recipeType.js';
import { hasIngredientFilter, type IngredientFilter } from './ingredientRepo.js';

type RecipeTypeExpressionBuilder = ExpressionBuilder<Database, 'recipe_type'>;

export type RecipeTypeFilter = {
  mode: 'or' | 'and';
  recipeTypeLike?: string;
  ingredientFilter: IngredientFilter;
};

const hasFilter =
  (filter: RecipeTypeFilter) =>
  (eb: RecipeTypeExpressionBuilder): Expression<SqlBool> => {
    const ops: Expression<SqlBool>[] = [];
    if (filter.recipeTypeLike) {
      ops.push(eb('recipe_type.recipe_type', 'like', `%${filter.recipeTypeLike}%`));
    }
    if (filter.mode === 'or') {
      return eb.or(ops);
    } else {
      return eb.and(ops);
    }
  };

export type FullRecipeType = RecipeType & {
  machine: Ingredient;
};

export class RecipeTypeRepo {
  constructor(private db: KyselyDB) {}
  async search(filter: RecipeTypeFilter, pagination: Pagination): Promise<FullRecipeType[]> {
    let query = this.db
      .selectFrom('recipe_type')
      .selectAll('recipe_type')
      .innerJoin('ingredient', 'ingredient.id', 'recipe_type.display_machine')
      .select(toJsonObject<Ingredient>('ingredient', INGREDIENT_COLUMNS).as('machine'))
      .where((eb) =>
        eb.or([hasIngredientFilter(filter.ingredientFilter)(eb), hasFilter(filter)(eb)]),
      );
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
