import * as fs from "fs/promises";
import * as z from "zod";

const readJson = async (filepath: string): Promise<unknown> => {
  const json = await fs.readFile(filepath, "utf-8");
  return JSON.parse(json);
};

const zResourceID = z.string().includes(":");
export type ResourceID = z.Infer<typeof zResourceID>;

const zIngredientJson = z.object({
  id: zResourceID,
  displayName: z.string(),
  hexColor: z.string().optional(),
  isFluid: z.boolean(),
  sourceJar: z.string(),
  tags: z.array(zResourceID),
  textureLocation: z.string().optional(),
});
export type IngredientJson = z.infer<typeof zIngredientJson>;
export const readIngredientsJson = async (filepath: string): Promise<IngredientJson[]> => {
  const data = await readJson(filepath);
  return z.array(zIngredientJson).parse(data);
};

const zRecipeIngredient = z.object({
  amount: z.int().positive(),
  chance: z.int().nonnegative().lte(100_00), // 100_00 represents 100%
  acceptedIds: z.array(zResourceID),
  perTick: z.boolean().optional(),
});
const zRecipeJson = z.object({
  id: zResourceID,
  recipeType: zResourceID,
  recipeCategory: z.string(),
  duration: z.int(),
  eutConsumed: z.int(),
  eutProduced: z.int(),
  minTier: z.int(),
  inputs: z.array(zRecipeIngredient),
  outputs: z.array(zRecipeIngredient),
});
export type RecipeJson = z.Infer<typeof zRecipeJson>;

export const readRecipesJson = async (filepath: string): Promise<RecipeJson[]> => {
  const data = await readJson(filepath);
  return z.array(zRecipeJson).parse(data);
};

const zRecipeCategory = z.object({
  recipeType: zResourceID,
  recipeCategory: z.string(),
  displayName: z.string(),
});
export type RecipeCategoryJson = z.Infer<typeof zRecipeCategory>;

const zMachineJson = z.object({
  machineId: zResourceID,
  recipeTypes: z.array(zResourceID),
});
export type MachineJson = z.Infer<typeof zMachineJson>;

const zRecipeMachines = z.object({
  recipeCategories: z.array(zRecipeCategory),
  machines: z.array(zMachineJson),
});
export type RecipeMachines = z.Infer<typeof zRecipeMachines>;

export const readMachinesJson = async (filepath: string) => {
  const data = await readJson(filepath);
  return zRecipeMachines.parse(data);
};
