import { OperandValueExpressionOrList, SelectQueryBuilder } from "kysely";
import { Database, KyselyDB } from "./database.js";
import { Recipe, NewRecipe } from "./recipe.js";

type RecipeSelectQuery = SelectQueryBuilder<Database, "recipe", {}>;

type Pagination = {
  offset: number;
  limit: number;
};

export type RecipeFilter = {
  machine?: string;
  inputIngredientIncludes?: string;
  outputIngredientIncludes?: string;
};

export class RecipeRepo {
  constructor(private db: KyselyDB) {}
  async all(): Promise<Recipe[]> {
    let query = this.db.selectFrom("recipe");
    return await query.selectAll().execute();
  }
  async insertMany(items: NewRecipe[]): Promise<void> {
    const chunkSize = 500;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await this.db.insertInto("recipe").values(chunk).execute();
    }
  }
  async search(filter: RecipeFilter, pagination: Pagination): Promise<Recipe[]> {
    let query = this.db.selectFrom("recipe");
    return await query.selectAll().execute();
  }
  applyFilter(query: RecipeSelectQuery, filter: RecipeFilter): RecipeSelectQuery {
    if (filter.machine) {
      query = query.where("machine", "=", filter.machine);
    }
    if (filter.inputIngredientIncludes) {
      // TODO: Add proper filter
      query = query.where("recipe.inputs", "like", `%${filter.inputIngredientIncludes}%` as any);
    }
    return query;
  }
}
