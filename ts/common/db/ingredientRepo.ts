import { KyselyDB } from "./database.js";
import { Ingredient, NewIngredient } from "./ingredient.js";

export class IngredientRepo {
  constructor(private db: KyselyDB) {}
  public async allWithIcons(): Promise<Ingredient[]> {
    let query = this.db.selectFrom("ingredient");
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
      console.warn("could not find some ingredients");
    }
    return m;
  }
}
