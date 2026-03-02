import { KyselyDB } from "./database.js";
import { IngredientWithIcon, NewIngredient } from "./ingredient.js";

export class IngredientRepo {
  constructor(private db: KyselyDB) {}
  async allWithIcons(): Promise<IngredientWithIcon[]> {
    let query = this.db
      .selectFrom("ingredient")
      .leftJoin("manifest", "manifest.filepath", "ingredient.texture_location");
    return await query.selectAll().execute();
  }
  async insertMany(items: NewIngredient[]): Promise<void> {
    const chunkSize = 500;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await this.db.insertInto("ingredient").values(chunk).execute();
    }
  }
}
