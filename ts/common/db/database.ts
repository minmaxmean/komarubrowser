import { Kysely } from "kysely";
import type { IngredientTable } from "./ingredient.js";
import type { ManifestTable } from "./manifest.js";
import { RecipeTable } from "./recipe.js";

export type Database = {
  ingredient: IngredientTable;
  manifest: ManifestTable;
  recipe: RecipeTable;
};

export type KyselyDB = Kysely<Database>;

export const migrate = async (db: Kysely<any>): Promise<void> => {
  await db.schema
    .createTable("manifest")
    .addColumn("filepath", "text", (col) => col.primaryKey())
    .addColumn("width", "integer", (col) => col.notNull())
    .addColumn("height", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("ingredient")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("display_name", "text", (col) => col.notNull())
    .addColumn("is_fluid", "integer", (col) => col.notNull())
    .addColumn("tags", "text", (col) => col.notNull())
    .addColumn("source_jar", "text", (col) => col.notNull())
    .addColumn("original_texture_location", "text", (col) => col.notNull())
    .addColumn("texture_location", "text", (col) => col.references("manifest.filepath"))
    .addColumn("hex_color", "text", (col) => col)
    .execute();

  await db.schema
    .createTable("recipe")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("machine", "text", (col) => col.notNull())
    .addColumn("inputs", "text", (col) => col.notNull())
    .addColumn("outputs", "text", (col) => col.notNull())
    .addColumn("duration", "integer", (col) => col.notNull())
    .addColumn("min_tier", "integer", (col) => col.notNull())
    .addColumn("eut_consumed", "integer", (col) => col.notNull())
    .addColumn("eut_produced", "integer", (col) => col.notNull())
    .execute();
};
