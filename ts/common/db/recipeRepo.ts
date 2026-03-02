import { KyselyDB } from "./database.js";
import { Recipe, NewRecipe } from "./recipe.js";

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
}
