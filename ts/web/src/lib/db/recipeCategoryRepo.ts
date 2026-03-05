import {
  sql,
  type Expression,
  type ExpressionBuilder,
  type RawBuilder,
  type SqlBool,
} from 'kysely';
import { applyPagination, type Pagination } from './common.js';
import type { Database, KyselyDB } from '@komarubrowser/common/db/database.js';
import { INGREDIENT_COLUMNS, type Ingredient } from '@komarubrowser/common/db/ingredient.js';
import type { RecipeCategory } from '@komarubrowser/common/db/recipeType.js';
import { hasIngredientFilter, type IngredientFilter } from './ingredientRepo.js';

type RecipeCategoryExpressionBuilder = ExpressionBuilder<Database, 'recipe_category'>;

export type RecipeCategoryFilter = {
  mode: 'or' | 'and';
  recipeTypeLike?: string;
  recipeCategoryLike?: string;
  displayNameLike?: string;
  machineFilter: IngredientFilter;
};

const hasFilter =
  (filter: RecipeCategoryFilter) =>
  (eb: RecipeCategoryExpressionBuilder): Expression<SqlBool> => {
    const ops: Expression<SqlBool>[] = [];
    if (filter.recipeTypeLike) {
      ops.push(eb('recipe_category.recipe_type', 'like', `%${filter.recipeTypeLike}%`));
    }
    if (filter.recipeCategoryLike) {
      ops.push(eb('recipe_category.recipe_category', 'like', `%${filter.recipeCategoryLike}%`));
    }
    if (filter.displayNameLike) {
      ops.push(eb('recipe_category.display_name', 'like', `%${filter.displayNameLike}%`));
    }
    if (filter.mode === 'or') {
      return eb.or(ops);
    } else {
      return eb.and(ops);
    }
  };

export class RecipeCategoryRepo {
  constructor(private db: KyselyDB) {}
  async getById(recipeType: string, recipeCategory: string): Promise<FullRecipeCategory> {
    let query = this.db
      .selectFrom('recipe_category')
      .selectAll('recipe_category')
      .innerJoin('ingredient', 'ingredient.id', 'recipe_category.machine_id')
      .select(toJsonObject<Ingredient>('ingredient', INGREDIENT_COLUMNS).as('machine'))
      .where('recipe_category.recipe_type', '=', recipeType)
      .where('recipe_category.recipe_category', '=', recipeCategory);
    const items = await query.executeTakeFirstOrThrow();
    return items as any;
  }
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
    // await explain(this.db, query);
    const items = await query.execute();
    return items as any;
  }
}

function toJsonObject<T>(table: string, columns: string[]): RawBuilder<T> {
  const fragments = columns.flatMap((col) => [sql.lit(col), sql.ref(`${table}.${col}`)]);
  return sql`json_object(${sql.join(fragments)})`;
}

export type FullRecipeCategory = RecipeCategory & {
  machine: Ingredient;
};
export const isFullRecipeCategory = (item: any): item is FullRecipeCategory =>
  !!item.machine && !!item.recipe_type && !!item.recipe_category;

export type IngredientLike = Ingredient | FullRecipeCategory;
export type IngredientLikeProps = {
  display_name: string;
  description: string;
  url: string | null;
  hex_color?: string;
};

export const getTextProps = (item: IngredientLike | undefined): IngredientLikeProps => {
  if (!item) {
    return { display_name: '', description: '', url: null, hex_color: undefined };
  }
  if (isFullRecipeCategory(item)) {
    return {
      display_name: item.display_name,
      description: item.recipe_type,
      url: item.machine.texture_location,
      hex_color: item.machine.hex_color,
    };
  }
  return {
    display_name: item.display_name,
    description: item.id,
    url: item.texture_location,
    hex_color: item.hex_color,
  };
};
