import { Kysely, ParseJSONResultsPlugin, sql, type Dialect } from "kysely";
import { Database } from "./database.js";
import { IngredientRepo } from "./ingredientRepo.js";
import { RecipeRepo } from "./recipeRepo.js";
import { ManifestRepo } from "./manifestRepo.js";
import { GlobalFilterGetter } from "./globalFilter.js";

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
    .addColumn("namespace", "text", (col) => col.generatedAlwaysAs(sql`SUBSTR(id, 1, INSTR(id, ':') - 1)`).notNull())
    .execute();

  await db.schema.createIndex("ingredient_namespace_index").on("ingredient").column("namespace").execute();
  await db.schema.createIndex("ingredient_namespace_id_index").on("ingredient").columns(["namespace", "id"]).execute();

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

export type SuperRepo = {
  ingredients: IngredientRepo;
  manifest: ManifestRepo;
  recipe: RecipeRepo;
  close: () => Promise<void>;
};

export const getSuperRepo = (dialect: Dialect, globalFilterGetter?: GlobalFilterGetter): SuperRepo => {
  const db = new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
    log: ["query", "error"],
  });
  return {
    ingredients: new IngredientRepo(db, globalFilterGetter),
    manifest: new ManifestRepo(db),
    recipe: new RecipeRepo(db),
    close: () => db.destroy(),
  };
};
