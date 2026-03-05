import * as fs from "fs/promises";
import * as z from "zod";

export const zResourceID = z.stringFormat("resource_id", (val) => val.includes(":"));

export const zIngredientJson = z.object({
  id: zResourceID,
  displayName: z.string(),
  hexColor: z.string().optional(),
  isFluid: z.boolean(),
  sourceJar: z.string(),
  tags: z.array(z.string()),
  textureLocation: z.string().optional(),
});
export type IngredientJson = z.infer<typeof zIngredientJson>;

export const zRecipeIngredient = z.object({
  amount: z.int().positive(),
  chance: z.int().positive().lte(100_00), // 100_00 represents 100%
  acceptedIds: z.array(z.string()),
  perTick: z.boolean().optional(),
});
export type RecipeIngredientJson = z.Infer<typeof zRecipeIngredient>;

export const zRecipe = z.object({
  id: zResourceID,
  recipeType: z.string(),
  duration: z.int(),
  eutConsumed: z.int(),
  eutProduced: z.int(),
  minTier: z.int(),
  inputs: z.array(zRecipeIngredient),
  outputs: z.array(zRecipeIngredient),
});
export type RecipeJson = z.Infer<typeof zRecipe>;

export const zMachine = z.object({
  id: z.string(),
  recipeTypes: z.array(z.string()),
});

type ReadJsonZArg = typeof zIngredientJson | typeof zRecipe;
export const readJsonZ = async <T extends ReadJsonZArg>(filepath: string, item: T) => {
  const json = await fs.readFile(filepath, "utf-8");
  const data = JSON.parse(json);
  return z.array(item).parse(data);
};
