import Database from "better-sqlite3";
import type { IngredientRow, ManifestRow, RecipeRow } from "@komarubrowser/common/tables";
import { rmrf } from "./utils.js";

export async function initDb(dbPath: string): Promise<Database.Database> {
  await rmrf(dbPath);

  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE ingredients (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      is_fluid INTEGER NOT NULL,
      tags TEXT NOT NULL,
      asset_path TEXT NOT NULL,
      source_jar TEXT NOT NULL,
      icon_url TEXT
    );

    CREATE TABLE manifest (
      filename TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      jar TEXT NOT NULL,
      mod TEXT NOT NULL,
      type TEXT NOT NULL
    );

    CREATE INDEX idx_manifest_jar_mod ON manifest (jar, mod);
    
    CREATE TABLE recipes (
      id TEXT PRIMARY KEY,
      machine TEXT NOT NULL,
      inputs TEXT NOT NULL,
      outputs TEXT NOT NULL,
      duration INTEGER NOT NULL,
      min_tier INTEGER NOT NULL,
      eut_consumed INTEGER NOT NULL,
      eut_produced INTEGER NOT NULL
    );
  `);

  return db;
}

export function insertIngredients(db: Database.Database, ingredients: IngredientRow[]): void {
  const insert = db.prepare(`
    INSERT INTO ingredients (id, display_name, is_fluid, tags, asset_path, source_jar, icon_url)
    VALUES (@id, @display_name, @is_fluid, @tags, @asset_path, @source_jar, @icon_url)
  `);

  const insertMany = db.transaction((rows: IngredientRow[]) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(ingredients);
}

export function insertManifest(db: Database.Database, manifest: ManifestRow[]): void {
  const insert = db.prepare(`
    INSERT INTO manifest (filename, width, height, jar, mod, type)
    VALUES (@filename, @width, @height, @jar, @mod, @type)
  `);

  const insertMany = db.transaction((rows: ManifestRow[]) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(manifest);
}

export function insertRecipes(db: Database.Database, recipes: RecipeRow[]): void {
  const insert = db.prepare(`
    INSERT INTO recipes (id, machine, inputs, outputs, duration, min_tier, eut_consumed, eut_produced)
    VALUES (@id, @machine, @inputs, @outputs, @duration, @min_tier, @eut_consumed, @eut_produced)
  `);

  const insertMany = db.transaction((rows: RecipeRow[]) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(recipes);
}
