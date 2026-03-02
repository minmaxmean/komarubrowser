import { KyselyDB } from "./database.js";
import { IngredientWithIcon } from "./ingredient.js";

export class IngredientRepo {
  constructor(private db: KyselyDB) {}
  async allWithIcons(): Promise<IngredientWithIcon[]> {
    let query = this.db
      .selectFrom("ingredient")
      .leftJoin("manifest", "manifest.filepath", "ingredient.texture_location");
    return await query.selectAll().execute();
  }
}
