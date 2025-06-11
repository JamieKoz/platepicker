// types/meal.ts
import { Category } from './category';
import { Cuisine } from './cuisine';
import { Dietary } from './dietary';
import { RecipeGroup } from './recipeGroup';  // This can represent both recipe groups and user meal groups
import { RecipeLine } from './recipeline';

export interface Meal {
  id: number;
  user_id?: string | number;
  recipe_id?: number | null;
  title: string;
  instructions?: string | null;
  image_name?: string | null;
  image_url?: string;
  cooking_time?: string | number;
  serves?: string | number;
  active: boolean | number;
  created_at?: string;
  updated_at?: string;
  
  // Relationship arrays
  recipe_lines?: RecipeLine[];
  categories?: Category[];
  cuisines?: Cuisine[];
  dietary_items?: Dietary[];
  dietary?: Dietary[];
  
  // Group-related fields (using same naming as Recipe for consistency)
  recipe_groups?: RecipeGroup[];  // Contains user meal groups for user meals
  ungrouped_recipe_lines?: RecipeLine[];
  all_recipe_lines?: RecipeLine[];
  
  // ID arrays for form submission
  category_ids?: number[];
  cuisine_ids?: number[];
  dietary_ids?: number[];
}
