import * as fs from "fs/promises";
import * as z from "zod";

export const resourceID = z.stringFormat("", (val) => val.includes(":"));

export const IngredientZ = z.object({
  id: z.string(),
  displayName: z.string(),
  hexColor: z.string().optional(),
  isFluid: z.boolean(),
  sourceJar: z.string(),
  tags: z.array(z.string()),
  textureLocation: z.string().optional(),
});
export type IngredientJson = z.infer<typeof IngredientZ>;

export const RecipeIngredientZ = z.object({
  amount: z.int().positive(),
  chance: z.int().positive().lte(100_00), // 100_00 represents 100%
  acceptedIds: z.array(z.string()),
  perTick: z.boolean().optional(),
});
export type RecipeIngredientJson = z.Infer<typeof RecipeIngredientZ>;

export const RecipeZ = z.object({
  id: z.string(),
  recipeType: z.string(),
  duration: z.int(),
  eutConsumed: z.int(),
  eutProduced: z.int(),
  minTier: z.int(),
  inputs: z.array(RecipeIngredientZ),
  outputs: z.array(RecipeIngredientZ),
});
export type RecipeJson = z.Infer<typeof RecipeZ>;

type ReadJsonZArg = typeof IngredientZ | typeof RecipeZ;
export const readJsonZ = async <T extends ReadJsonZArg>(filepath: string, item: T) => {
  const json = await fs.readFile(filepath, "utf-8");
  const data = JSON.parse(json);
  return z.array(item).parse(data);
};
