import { Expression, SelectQueryBuilder } from "kysely";
import { Database, KyselyDB } from "./database.js";
import { GlobalFilterGetter } from "./globalFilter.js";
import { Ingredient, NewIngredient } from "./ingredient.js";
import { SqlBool } from "kysely";

type IngredientSelectQuery = SelectQueryBuilder<Database, "ingredient", {}>;

export class IngredientRepo {
  constructor(
    private db: KyselyDB,
    private globalFilterGetter?: GlobalFilterGetter,
  ) {}
  private withFilter(query: IngredientSelectQuery): IngredientSelectQuery {
    if (!this.globalFilterGetter) {
      console.log("[IngredientRepo] globalFilterGetter is not set");
      return query;
    }
    const { ingredient: filter } = this.globalFilterGetter();
    console.log("[IngredientRepo] using global filter", { filter });
    return query.where((eb) => {
      const ands: Expression<SqlBool>[] = [];
      filter.displayNameLike.forEach((displayNameLike) => {
        ands.push(eb("display_name", "not like", displayNameLike));
      });
      filter.idLike.forEach((idLike) => {
        ands.push(eb("id", "not like", idLike));
      });
      if (filter.namespace.length > 0) {
        ands.push(eb("namespace", "not in", filter.namespace));
      }

      return eb.and(ands);
    });
  }
  public async all(): Promise<Ingredient[]> {
    let query = this.db.selectFrom("ingredient");
    query = this.withFilter(query);
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
    // query = this.withFilter(query);
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
}
