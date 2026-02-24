import Database from "better-sqlite3";
import * as fs from "fs/promises";
import * as path from "path";
import { DB_OUTPUT, pathExists } from "./shared.js";
import type { IngredientRow, ManifestRow } from "@komarubrowser/common/tables";

export async function initDb(dbPath: string = DB_OUTPUT): Promise<Database.Database> {
  if (await pathExists(dbPath)) {
    await fs.unlink(dbPath);
  }

  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE ingredients (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      is_fluid INTEGER NOT NULL,
      tags TEXT NOT NULL,
      asset_path TEXT NOT NULL,
      source_jar TEXT NOT NULL
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
  `);

  return db;
}

export function insertIngredients(db: Database.Database, ingredients: IngredientRow[]): void {
  const insert = db.prepare(`
    INSERT INTO ingredients (id, display_name, is_fluid, tags, asset_path, source_jar)
    VALUES (@id, @display_name, @is_fluid, @tags, @asset_path, @source_jar)
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
