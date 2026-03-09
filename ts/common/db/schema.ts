import { Kysely, sql } from "kysely";

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
    .addColumn("texture_location", "text", (col) => col.references("manifest.filepath"))
    .addColumn("hex_color", "text", (col) => col)
    .addColumn("namespace", "text", (col) => col.generatedAlwaysAs(sql`SUBSTR(id, 1, INSTR(id, ':') - 1)`).notNull())
    .execute();

  // prettier-ignore
  await db.schema
    .createIndex("ingredient_namespace_index")
    .on("ingredient")
    .column("namespace")
    .execute();

  // prettier-ignore
  await db.schema
    .createIndex("ingredient_namespace_id_index")
    .on("ingredient")
    .columns(["namespace", "id"])
    .execute();

  await db.schema
    .createTable("recipe_category")
    .addColumn("recipe_type", "text", (col) => col.notNull())
    .addColumn("recipe_category", "text", (col) => col.notNull())
    .addColumn("display_name", "text", (col) => col.notNull())
    .addColumn("machine_id", "text", (col) => col.notNull().references("ingredient.id"))
    .addColumn("all_machines", "jsonb", (col) => col.notNull())
    .addPrimaryKeyConstraint("recipe_category_primary_key", ["recipe_type", "recipe_category"])
    .execute();

  await db.schema
    .createTable("recipe")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("recipe_type", "text", (col) => col.notNull())
    .addColumn("recipe_category", "text", (col) => col.notNull())
    .addColumn("inputs", "text", (col) => col.notNull())
    .addColumn("outputs", "text", (col) => col.notNull())
    .addColumn("duration", "integer", (col) => col.notNull())
    .addColumn("min_tier", "integer", (col) => col.notNull())
    .addColumn("eut_consumed", "integer", (col) => col.notNull())
    .addColumn("eut_produced", "integer", (col) => col.notNull())
    .addForeignKeyConstraint("recipe_category_foreign_key", ["recipe_type", "recipe_category"], "recipe_category", [
      "recipe_type",
      "recipe_category",
    ])
    .execute();
};
