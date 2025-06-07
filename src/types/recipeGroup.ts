import { RecipeLine } from "./recipeline";

export interface RecipeGroup {
  id?: number;
  recipe_id: number;
  name: string;
  description?: string;
  sort_order: number;
  recipe_lines?: RecipeLine[];
}
