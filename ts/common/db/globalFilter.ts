export type IngredientFilter = {
  idLike: string[];
  displayNameLike: string[];
  namespace: string[];
};

export type GlobalFilter = {
  ingredient: IngredientFilter;
};

export type GlobalFilterGetter = () => GlobalFilter;
