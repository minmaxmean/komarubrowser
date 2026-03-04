import type { Expression, SelectQueryBuilder, SqlBool } from "kysely";
import type { Database, KyselyDB } from "./database.js";
import type { GlobalFilterGetter } from "./globalFilter.js";
import type { Ingredient, NewIngredient } from "./ingredient.js";
import { type Pagination, applyPagination } from "./common.js";
import { ExpressionBuilder } from "kysely";

type IngredientSelectQuery = SelectQueryBuilder<Database, "ingredient", {}>;
type IngredientExpressionBuilder = ExpressionBuilder<Database, "ingredient">;

export type IngredientGlobalFilter = {
  idLike: string[];
  displayNameLike: string[];
  namespace: string[];
};

export type IngredientFilter = {
  mode: "or" | "and";
  id?: string;
  idLike?: string;
  displayNameLike?: string;
};

const hasFilter =
  (filter: IngredientFilter) =>
  (eb: IngredientExpressionBuilder): Expression<SqlBool> => {
    const ops: Expression<SqlBool>[] = [];
    if (filter.id) {
      ops.push(eb("id", "=", filter.id));
    }
    if (filter.idLike) {
      ops.push(eb("id", "like", `%${filter.idLike}%`));
    }
    if (filter.displayNameLike) {
      ops.push(eb("display_name", "like", `%${filter.displayNameLike}%`));
    }
    if (filter.mode === "or") {
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
      ops.push(eb("display_name", "not like", displayNameLike));
    });
    filter.idLike.forEach((idLike) => {
      ops.push(eb("id", "not like", idLike));
    });
    if (filter.namespace.length > 0) {
      ops.push(eb("namespace", "not in", filter.namespace));
    }
    return eb.and(ops);
  };

export class IngredientRepo {
  constructor(
    private db: KyselyDB,
    private globalFilterGetter?: GlobalFilterGetter,
  ) {}
  private withGlobalFilter(query: IngredientSelectQuery): IngredientSelectQuery {
    if (!this.globalFilterGetter) return query;
    const globalFilter = this.globalFilterGetter().ingredient;
    return query.where(hasGlobalFilter(globalFilter));
  }
  public async all(): Promise<Ingredient[]> {
    let query = this.db.selectFrom("ingredient");
    query = this.withGlobalFilter(query);
    return await query.selectAll().execute();
  }
  public async insertMany(items: NewIngredient[]): Promise<void> {
    const chunkSize = 500;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await this.db.insertInto("ingredient").values(chunk).execute();
    }
  }
  public async getByIds(ids: string[]): Promise<Map<string, Ingredient>> {
    let query = this.db.selectFrom("ingredient").where("id", "in", ids);
    const ingredients: Ingredient[] = await query.selectAll().execute();
    const m = new Map<string, Ingredient>();
    ingredients.forEach((item) => m.set(item.id, item));
    if (m.size != ids.length) {
      console.warn(
        "could not find some ingredients",
        ids.filter((id) => !m.has(id)),
      );
    }
    return m;
  }
  async search(filter: IngredientFilter, pagination: Pagination): Promise<Ingredient[]> {
    let query = this.db.selectFrom("ingredient");
    query = this.withGlobalFilter(query);
    query = query.where(hasFilter(filter));
    query = applyPagination(query, pagination);
    return await query.selectAll().execute();
  }
}
