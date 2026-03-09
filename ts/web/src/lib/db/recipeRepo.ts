import type { Expression, ExpressionBuilder, SqlBool } from 'kysely';
import type { Database, KyselyDB } from '@komarubrowser/common/db/database.js';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';
import { type Pagination, applyPagination } from './common.js';

type RecipeExpressionBuilder = ExpressionBuilder<Database, 'recipe'>;

export type RecipeFilter = {
  mode: 'or' | 'and';
  recipeType?: string;
  inputIngredientIncludes?: string;
  outputIngredientIncludes?: string;
};

export class RecipeRepo {
  constructor(private db: KyselyDB) {}
  async all(): Promise<Recipe[]> {
    let query = this.db.selectFrom('recipe');
    return await query.selectAll().execute();
  }
  async search(filter: RecipeFilter, pagination: Pagination): Promise<Recipe[]> {
    let query = this.db.selectFrom('recipe');
    query = query.where(this.hasFilter(filter));
    query = applyPagination(query, pagination);
    return await query.selectAll().execute();
  }
  private hasFilter(filter: RecipeFilter) {
    return (eb: RecipeExpressionBuilder): Expression<SqlBool> => {
      const ops: Expression<SqlBool>[] = [];
      if (filter.recipeType) {
        ops.push(eb('recipe_type', '=', filter.recipeType));
      }
      if (filter.inputIngredientIncludes) {
        ops.push(eb('recipe.inputs', 'like', `%${filter.inputIngredientIncludes}%` as any));
      }
      if (filter.outputIngredientIncludes) {
        ops.push(eb('recipe.outputs', 'like', `%${filter.outputIngredientIncludes}%` as any));
      }
      if (filter.mode === 'or') {
        return eb.or(ops);
      } else {
        return eb.and(ops);
      }
    };
  }
}
