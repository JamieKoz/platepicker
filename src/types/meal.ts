import { Category } from './category';
import { Cuisine } from './cuisine';
import { Dietary } from './dietary';
import { RecipeGroup } from './recipeGroup';
import { RecipeLine } from './recipeline';

export interface Meal {
  id: number;
  user_id?: string | number;
  recipe_id?: number | null;
  title: string;
  instructions?: string | null;
  image_name?: string | null;
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
  
  // ID arrays for form submission
  category_ids?: number[];
  cuisine_ids?: number[];
  dietary_ids?: number[];


  user_meal_groups?: RecipeGroup[];
  ungrouped_user_meal_lines?: RecipeLine[];
  all_user_meal_lines?: RecipeLine[];
}
