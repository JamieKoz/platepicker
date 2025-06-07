// types/recipe.ts
import { Category } from '@/types/category';
import { Cuisine } from '@/types/cuisine';
import { Dietary } from '@/types/dietary';
import { RecipeLine } from './recipeline';
import { RecipeGroup } from './recipeGroup';
export interface Recipe {
  id: number;
  title: string;
  instructions: string | null;
  image_name: string | null;
  cooking_time?: string;
  serves?: string;
  cuisine?: string;
  // category?: string;
  dietary?: string | string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  
  // New relational fields
  recipe_lines?: RecipeLine[];
  categories?: Category[];
  cuisines?: Cuisine[];
  dietary_items?: Dietary[];

  category_ids?: number[];
  cuisine_ids?: number[];
  dietary_ids?: number[];

  recipe_groups?: RecipeGroup[];
  ungrouped_recipe_lines?: RecipeLine[];
  all_recipe_lines?: RecipeLine[];
}
