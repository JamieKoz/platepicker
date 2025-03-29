// types/recipe.ts
import { Category } from '@/types/category';
import { Cuisine } from '@/types/cuisine';
import { Dietary } from '@/types/dietary';
import { RecipeLine } from './recipeline';
export interface Recipe {
  id: number;
  title: string;
  ingredients: string | null;
  instructions: string | null;
  image_name: string | null;
  cooking_time?: string;
  serves?: string;
  cuisine?: string;
  // category?: string;
  dietary?: string | string[];
  cleaned_ingredients: string | null;
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
}
