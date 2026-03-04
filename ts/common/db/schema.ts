import { Kysely, sql } from "kysely";

export const createIdsTriggerSql = async (db: Kysely<any>, column: string) => {
  const query = sql<never>`
CREATE TRIGGER trg_recipe_insert_${sql.raw(column)}_ids
AFTER INSERT ON recipe
BEGIN
    UPDATE recipe 
    SET ${sql.raw(column)}_ids = (
      SELECT group_concat(json_extract(value, '$.accepted_ids[0]'), '|')
      FROM json_each(NEW.${sql.raw(column)}s)
    )
    WHERE rowid = NEW.rowid;
END;
`;
  const compiled = query.compile(db);
  console.log("Compiled SQL string:\n", compiled.sql);
  console.log("Parameters attached (should be empty for this DDL):", compiled.parameters);
  await query.execute(db);
};

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
    .createTable("recipe_type")
    .addColumn("recipe_type", "text", (col) => col.primaryKey())
    .addColumn("display_machine", "text", (col) => col.notNull().references("ingredient.id"))
    .addColumn("all_machines", "jsonb", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("recipe")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("recipe_type", "text", (col) => col.notNull().references("recipe_type.recipe_type"))
    .addColumn("inputs", "text", (col) => col.notNull())
    .addColumn("outputs", "text", (col) => col.notNull())
    .addColumn("duration", "integer", (col) => col.notNull())
    .addColumn("min_tier", "integer", (col) => col.notNull())
    .addColumn("eut_consumed", "integer", (col) => col.notNull())
    .addColumn("eut_produced", "integer", (col) => col.notNull())
    .addColumn("input_ids", "text", (col) => col.defaultTo(""))
    .addColumn("output_ids", "text", (col) => col.defaultTo(""))
    .execute();

  await createIdsTriggerSql(db, "input");
  await createIdsTriggerSql(db, "output");
};
