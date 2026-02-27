export type IngredientJson = {
  id: string;
  displayName: string;
  isFluid: boolean;
  tags: string[];
  sourceJar: string;
  textureLocation?: string;
  hexColor?: string;
};

export type IngredientRow = {
  id: string;
  display_name: string;
  is_fluid: number;
  tags: string;
  source_jar: string;
  original_texture_location: string;
  texture_location: string | null;
  hex_color?: string;
};

export const toIngredientRow = (i: IngredientJson, actualTextureLocation: string | null): IngredientRow => {
  return {
    id: i.id,
    display_name: i.displayName,
    is_fluid: i.isFluid ? 1 : 0,
    tags: JSON.stringify(i.tags),
    source_jar: i.sourceJar,
    original_texture_location: i.textureLocation ?? "", // minecraft:empty doesn't have texture
    texture_location: actualTextureLocation,
    hex_color: i.hexColor,
  };
};
