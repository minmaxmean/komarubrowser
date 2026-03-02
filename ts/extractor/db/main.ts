import path from "path";
import Database from "better-sqlite3";
import { getSuperRepo, type SuperRepo } from "@komarubrowser/common/db/init.js";
import { SqliteDialect, Kysely } from "kysely";
import { buildManifestItems } from "./manifest.js";
import * as utils from "../utils/utils.js";
import * as argUtils from "../utils/argutils.js";
import { migrate } from "@komarubrowser/common/db/database.js";

export async function initDb(dbPath: string): Promise<SuperRepo> {
  const db = new Database(dbPath);
  const dialect = new SqliteDialect({ database: db });
  const k = new Kysely<any>({ dialect });
  await migrate(k);
  return getSuperRepo(dialect);
}

type IngredientJson = {
  id: string;
  displayName: string;
  hexColor: string;
  isFluid: boolean;
  sourceJar: string;
  tags: string[];
  textureLocation?: string;
};

const IGNORED_TEXTURE_MODS = new Set(["thermal", "minecraft", "systeams", "thermal_extra"]);
const ignoreMissingTexture = (id: string) => IGNORED_TEXTURE_MODS.has(id.split(":")[0]);

export async function buildDb(args: BuildDBArgs): Promise<void> {
  const { INGREDIENTS_FILE, RECIPES_FILE, DB_OUTPUT, EXTRACTED_PNG_DIR } = args;
  console.log({ args, cwd: process.cwd() });
  console.log("Building SQLite database...");

  const tempDbDir = await utils.makeTmpDir(`db`);
  const tempDbPath = path.join(tempDbDir, "komaru.db");
  const superRepo = await initDb(tempDbPath);

  try {
    // 1. Process Manifest
    const manifestRows = await buildManifestItems(EXTRACTED_PNG_DIR);
    console.log(`Inserting ${manifestRows.length} manifest entries...`);

    await superRepo.manifest.insertMany(manifestRows);

    // // Create a set for fast lookup: "jar/mod/type/filename"
    const manifestSet = new Set(manifestRows.map((m) => m.filepath));

    // 2. Process Ingredients
    console.log(`Reading ingredients from ${INGREDIENTS_FILE}...`);
    const ingredients: IngredientJson[] = await utils.readJson(INGREDIENTS_FILE);

    const deduplicated = new Map<string, IngredientJson>();
    for (const i of ingredients) {
      const existing = deduplicated.get(i.id);
      if (!existing || (!existing.isFluid && i.isFluid)) {
        deduplicated.set(i.id, i);
      }
    }
    const getTextureLocation = (i: IngredientJson): string | null => {
      if (!i.textureLocation) return null;
      const textureLocation = "assets/" + i.textureLocation.replace(":", "/");
      if (!manifestSet.has(textureLocation)) {
        if (!ignoreMissingTexture(i.id) && !textureLocation.startsWith("assets/minecraft")) {
          throw Error(`texture for item not found in manifest: id: ${i.id} textureLocation: ${textureLocation}`);
        }
        return null;
      }
      return textureLocation;
    };

    const ingredientRows = Array.from(deduplicated.values()).map((ing) => {
      const actualTextureLocation = getTextureLocation(ing);
      return {
        id: ing.id,
        display_name: ing.displayName,
        is_fluid: ing.isFluid ? 1 : 0,
        tags: JSON.stringify(ing.tags),
        source_jar: ing.sourceJar,
        original_texture_location: ing.textureLocation || "",
        texture_location: actualTextureLocation,
        hex_color: ing.hexColor,
      };
    });
    console.log(`Inserting ${ingredientRows.length} ingredients (deduplicated from ${ingredients.length})...`);
    await superRepo.ingredients.insertMany(ingredientRows);

    // // 3. Process Recipes
    // console.log(`Reading recipes from ${RECIPES_FILE}...`);
    // const recipes: Recipe[] = await utils.readJson(RECIPES_FILE);
    // const recipeRows: RecipeRow[] = recipes.map(toRecipeRow);
    //
    // console.log(`Inserting ${recipeRows.length} recipes...`);
    // insertRecipes(db, recipeRows);

    await superRepo.close();

    console.log(`Committing database to ${DB_OUTPUT}...`);
    await utils.atomicMove(tempDbPath, DB_OUTPUT);

    console.log(`Database successfully built at ${DB_OUTPUT}`);
  } catch (err) {
    await superRepo.close();
    try {
      await utils.rmrf(tempDbPath);
    } catch {}
    throw err;
  }
}

type BuildDBArgs = {
  INGREDIENTS_FILE: string;
  RECIPES_FILE: string;
  EXTRACTED_PNG_DIR: string;
  DB_OUTPUT: string;
};

const REQUIRED_ARGS = ["output", "ingredients", "recipes", "extracted_pngs"] as const;

(async () => {
  const parsed = argUtils.parseArgs(REQUIRED_ARGS);
  await buildDb({
    INGREDIENTS_FILE: parsed["ingredients"]!,
    RECIPES_FILE: parsed["recipes"],
    DB_OUTPUT: parsed["output"],
    EXTRACTED_PNG_DIR: parsed["extracted_pngs"],
  });
})();
