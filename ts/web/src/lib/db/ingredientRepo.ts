import {
  type Expression,
  type ExpressionBuilder,
  type SelectQueryBuilder,
  type SqlBool,
  sql,
} from 'kysely';
import type { Database, KyselyDB } from '@komarubrowser/common/db/database.js';
import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
import { type Pagination, applyPagination } from './common.js';
import type { GlobalFilter } from './globalFilter.js';

type IngredientSelectQuery = SelectQueryBuilder<Database, 'ingredient', {}>;
type IngredientExpressionBuilder = ExpressionBuilder<Database, 'ingredient'>;

export type IngredientGlobalFilter = {
  idLike: string[];
  displayNameLike: string[];
  namespace: string[];
};

export type IngredientFilter = {
  mode: 'or' | 'and';
  id?: string;
  idLike?: string;
  displayNameLike?: string;
};

export const hasIngredientFilter =
  (filter: IngredientFilter) =>
  (eb: IngredientExpressionBuilder): Expression<SqlBool> => {
    const ops: Expression<SqlBool>[] = [];
    if (filter.id) {
      ops.push(eb('ingredient.id', '=', filter.id));
    }
    if (filter.idLike) {
      ops.push(eb('ingredient.id', 'like', `%${filter.idLike}%`));
    }
    if (filter.displayNameLike) {
      ops.push(eb('ingredient.display_name', 'like', `%${filter.displayNameLike}%`));
    }
    if (filter.mode === 'or') {
      return eb.or(ops);
    } else {
      return eb.and(ops);
    }
  };

const hasGlobalFilter =
  (filter: IngredientGlobalFilter) =>
  (eb: IngredientExpressionBuilder): Expression<SqlBool> => {
    const ops: Expression<SqlBool>[] = [];
    filter.displayNameLike.forEach((displayNameLike) => {
      ops.push(eb('display_name', 'not like', displayNameLike));
    });
    filter.idLike.forEach((idLike) => {
      ops.push(eb('id', 'not like', idLike));
    });
    if (filter.namespace.length > 0) {
      ops.push(eb('namespace', 'not in', filter.namespace));
    }
    return eb.and(ops);
  };

export class IngredientRepo {
  constructor(
    private db: KyselyDB,
    private globalFilter: GlobalFilter,
  ) {}
  private withGlobalFilter(query: IngredientSelectQuery): IngredientSelectQuery {
    const globalFilter = this.globalFilter.ingredient;
    return query.where(hasGlobalFilter(globalFilter));
  }
  public async all(): Promise<Ingredient[]> {
    let query = this.db.selectFrom('ingredient');
    query = this.withGlobalFilter(query);
    return await query.selectAll().execute();
  }
  public async getByIds(ids: string[]): Promise<Map<string, Ingredient>> {
    let query = this.db.selectFrom('ingredient').where('id', 'in', ids);
    const ingredients: Ingredient[] = await query.selectAll().execute();
    const m = new Map<string, Ingredient>();
    ingredients.forEach((item) => m.set(item.id, item));
    return m;
  }
  async search(filter: IngredientFilter, pagination: Pagination): Promise<Ingredient[]> {
    let query = this.db
      .selectFrom('ingredient')
      .orderBy(sql`LENGTH(display_name)`)
      .orderBy('display_name');
    query = this.withGlobalFilter(query);
    query = query.where(hasIngredientFilter(filter));
    query = applyPagination(query, pagination);
    return await query.selectAll().execute();
  }
}
