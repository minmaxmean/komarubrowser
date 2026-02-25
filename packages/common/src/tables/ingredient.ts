export interface IngredientRow {
  id: string;
  display_name: string;
  is_fluid: number;
  tags: string;
  source_jar: string;
  icon_url: string | null;
}
