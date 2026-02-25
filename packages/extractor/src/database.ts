import Database from "better-sqlite3";
import type { IngredientRow, ManifestRow, RecipeRow } from "@komarubrowser/common/tables";

export async function initDb(dbPath: string): Promise<Database.Database> {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE ingredients (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      is_fluid INTEGER NOT NULL,
      tags TEXT NOT NULL,
      source_jar TEXT NOT NULL,
      original_texture_location TEXT NOT NULL,
      texture_location TEXT,
      hex_color TEXT,
      FOREIGN KEY (texture_location) REFERENCES manifest(filepath)
    );

    CREATE TABLE manifest (
      filepath TEXT PRIMARY KEY,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL
    );

    
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
  if (ingredients.length === 0) {
    throw Error("Something went wrong: no manifest rows found");
  }
  const insert = db.prepare(`
    INSERT INTO ingredients (id, display_name, is_fluid, tags, source_jar, original_texture_location, texture_location, hex_color)
    VALUES (@id, @display_name, @is_fluid, @tags, @source_jar, @original_texture_location, @texture_location, @hex_color)
  `);

  const insertMany = db.transaction((rows: IngredientRow[]) => rows.forEach((row) => insert.run(row)));

  insertMany(ingredients);
  console.log(`Inserted ${ingredients.length} rows to ingredients`);
}

export function insertManifest(db: Database.Database, manifest: ManifestRow[]): void {
  if (manifest.length === 0) {
    throw Error("Something went wrong: no manifest rows found");
  }
  const insert = db.prepare(`
    INSERT INTO manifest (filepath, width, height)
    VALUES (@filepath, @width, @height)
  `);

  const insertMany = db.transaction((rows: ManifestRow[]) => rows.forEach((row) => insert.run(row)));

  insertMany(manifest);
  console.log(`Inserted ${manifest.length} rows to manifest`);
}

export function insertRecipes(db: Database.Database, recipes: RecipeRow[]): void {
  if (recipes.length === 0) {
    throw Error("Something went wrong: no manifest rows found");
  }
  const insert = db.prepare(`
    INSERT INTO recipes (id, machine, inputs, outputs, duration, min_tier, eut_consumed, eut_produced)
    VALUES (@id, @machine, @inputs, @outputs, @duration, @min_tier, @eut_consumed, @eut_produced)
  `);

  const insertMany = db.transaction((rows: RecipeRow[]) => rows.forEach((row) => insert.run(row)));

  insertMany(recipes);
  console.log(`Inserted ${recipes.length} rows to recipes`);
}
