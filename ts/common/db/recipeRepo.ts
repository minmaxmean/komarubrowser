import { SelectQueryBuilder } from "kysely";
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
    query = this.applyFilter(query, filter);
    query = this.applyPagination(query, pagination);
    return await query.selectAll().execute();
  }
  private applyFilter(query: RecipeSelectQuery, filter: RecipeFilter): RecipeSelectQuery {
    if (filter.machine) {
      query = query.where("machine", "=", filter.machine);
    }
    if (filter.inputIngredientIncludes) {
      query = query.where("recipe.input_ids", "like", `%${filter.inputIngredientIncludes}%` as any);
    }
    if (filter.outputIngredientIncludes) {
      query = query.where("recipe.output_ids", "like", `%${filter.outputIngredientIncludes}%` as any);
    }
    return query;
  }
  private applyPagination(query: RecipeSelectQuery, pagination: Pagination): RecipeSelectQuery {
    return query.offset(pagination.offset).limit(pagination.limit).orderBy("id");
  }
}
