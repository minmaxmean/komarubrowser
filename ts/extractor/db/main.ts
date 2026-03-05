import path from "path";
import { SqliteDialect, Kysely, type Insertable } from "kysely";
import Database from "better-sqlite3";

import { getDb } from "@komarubrowser/common/db/database.js";
import { migrate } from "@komarubrowser/common/db/schema.js";
import type { NewRecipe } from "@komarubrowser/common/db/recipe.js";
import { Database as KBDatabase, KyselyDB } from "@komarubrowser/common/db/database.js";
import { EnergyTierID, energyTiers } from "@komarubrowser/common/db/energyTier.js";

import * as utils from "@komarubrowser/extractor_utils/utils.js";
import * as argUtils from "@komarubrowser/extractor_utils/argutils.js";
import {
  IngredientJson,
  readIngredientsJson,
  readMachinesJson,
  readRecipesJson,
  RecipeJson,
  RecipeMachines,
} from "@komarubrowser/extractor_utils/jsonSchema.js";

import { buildManifestItems } from "./manifest.js";
import { NewRecipeCategoryType } from "@komarubrowser/common/db/recipeType.js";

async function initDb(dbPath: string): Promise<KyselyDB> {
  const db = new Database(dbPath);
  const dialect = new SqliteDialect({ database: db });
  await migrate(new Kysely<any>({ dialect }));
  return getDb(dialect, false);
}

const pickDisplayMachine = (machines: string[]): string => {
  for (const energyTier of energyTiers) {
    for (const machine of machines) {
      if (machine.includes(energyTier.name.toLowerCase())) {
        return machine;
      }
    }
  }
  return machines[0];
};

const buildRecipeTypes = (
  { machines, recipeCategories }: RecipeMachines,
  recipies: RecipeJson[],
): NewRecipeCategoryType[] => {
  const interestingRecipeCategories = new Set(
    recipies.map(({ recipeType, recipeCategory }) => `${recipeType}#${recipeCategory}`),
  );
  const machineRecipePairs = machines.flatMap((machine) =>
    machine.recipeTypes.map((recipeType) => ({ machineId: machine.machineId, recipeType })),
  );
  const m = Map.groupBy(machineRecipePairs, (p) => p.recipeType);
  return recipeCategories
    .filter(({ recipeType, recipeCategory }) => interestingRecipeCategories.has(`${recipeType}#${recipeCategory}`))
    .map(({ recipeType, recipeCategory, displayName }): NewRecipeCategoryType => {
      const all_machines = m.get(recipeType)?.map((m) => m.machineId);
      if (!all_machines) {
        console.log("###DEBUG");
        console.table(machineRecipePairs);
        throw Error(`could not find machines for ${recipeType}`);
      }
      return {
        recipe_type: recipeType,
        recipe_category: recipeCategory,
        display_name: displayName,
        machine_id: pickDisplayMachine(all_machines),
        all_machines: JSON.stringify(all_machines),
      };
    });
};

const IGNORED_TEXTURE_MODS = new Set(["thermal", "minecraft", "systeams", "thermal_extra"]);
const ignoreMissingTexture = (id: string) => IGNORED_TEXTURE_MODS.has(id.split(":")[0]);

export async function buildDb(args: BuildDBArgs): Promise<void> {
  const { INGREDIENTS_FILE, RECIPES_FILE, RECIPE_CATEGORIES: MACHINES_FILE, DB_OUTPUT, EXTRACTED_PNG_DIR } = args;
  console.log({ args, cwd: process.cwd() });
  console.log("Building SQLite database...");

  const tempDbDir = await utils.makeTmpDir(`db`);
  const tempDbPath = path.join(tempDbDir, "komaru.db");
  const db = await initDb(tempDbPath);

  const insertMany = async <T extends keyof KBDatabase>(
    table: T,
    items: Insertable<KBDatabase[T]>[],
  ): Promise<void> => {
    const chunkSize = 500;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await db.insertInto(table).values(chunk).execute();
    }
  };

  try {
    // 1. Process Manifest
    const manifestRows = await buildManifestItems(EXTRACTED_PNG_DIR);
    console.log(`Inserting ${manifestRows.length} manifest entries...`);

    await insertMany("manifest", manifestRows);

    // // Create a set for fast lookup: "jar/mod/type/filename"
    const manifestSet = new Set(manifestRows.map((m) => m.filepath));

    // 2. Process Ingredients
    console.log(`Reading ingredients from ${INGREDIENTS_FILE}...`);
    const ingredients = await readIngredientsJson(INGREDIENTS_FILE);

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
    await insertMany("ingredient", ingredientRows);

    // 3. Process Recipes
    console.log(`Reading recipes from ${RECIPES_FILE}...`);
    const recipesJson = await readRecipesJson(RECIPES_FILE);
    const recipeRows: NewRecipe[] = recipesJson.map((r) => ({
      id: r.id,
      recipe_type: r.recipeType,
      recipe_category: r.recipeCategory,
      duration: r.duration,
      eut_consumed: r.eutConsumed,
      eut_produced: r.eutProduced,
      min_tier: r.minTier as EnergyTierID,
      inputs: JSON.stringify(
        r.inputs.map((i) => ({
          accepted_ids: i.acceptedIds,
          amount: i.amount,
          chance: i.chance,
          perTick: i.perTick,
        })),
      ),
      outputs: JSON.stringify(
        r.outputs.map((i) => ({
          accepted_ids: i.acceptedIds,
          amount: i.amount,
          chance: i.chance,
          perTick: i.perTick,
        })),
      ),
    }));
    console.log(`  Found ${recipeRows.length} recipes...`);

    console.log(`Reading recipe categories from ${MACHINES_FILE}...`);
    const machines = await readMachinesJson(MACHINES_FILE);
    const recipeCategories = buildRecipeTypes(machines, recipesJson);
    console.log(`  Inserting ${recipeCategories.length} recipe categories...`);
    await insertMany("recipe_category", recipeCategories);

    console.log(`Inserting ${recipeRows.length} recipes...`);
    await insertMany("recipe", recipeRows);

    console.log(`Committing database to ${DB_OUTPUT}...`);
    await utils.atomicMove(tempDbPath, DB_OUTPUT);

    console.log(`Database successfully built at ${DB_OUTPUT}`);
  } catch (err) {
    try {
      await utils.rmrf(tempDbPath);
    } catch {}
    throw err;
  } finally {
    await db.destroy();
  }
}

type BuildDBArgs = {
  INGREDIENTS_FILE: string;
  RECIPE_CATEGORIES: string;
  RECIPES_FILE: string;
  EXTRACTED_PNG_DIR: string;
  DB_OUTPUT: string;
};

const REQUIRED_ARGS = ["output", "ingredients", "recipes", "recipe_categories", "extracted_pngs"] as const;

(async () => {
  const parsed = argUtils.parseArgs(REQUIRED_ARGS);
  await buildDb({
    INGREDIENTS_FILE: parsed["ingredients"]!,
    RECIPES_FILE: parsed["recipes"],
    RECIPE_CATEGORIES: parsed["recipe_categories"],
    DB_OUTPUT: parsed["output"],
    EXTRACTED_PNG_DIR: parsed["extracted_pngs"],
  });
})();
