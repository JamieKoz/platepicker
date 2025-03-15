import { Category } from '@/types/category';
import { Cuisine } from '@/types/cuisine';
import { Dietary } from '@/types/dietary';

export interface Meal {
  id: number;
  user_id: number;
  recipe_id: number | null;
  title: string;
  ingredients: string | null;
  instructions: string | null;
  image_name: string | null;
  cleaned_ingredients: string | null;
  cooking_time?: string;
  serves?: string;
  cuisine?: string;
  category?: string;
  dietary?: string | string[];
  active: boolean;
  created_at: string;
  updated_at: string;

  categories?: Category[];
  cuisines?: Cuisine[];
  dietary_items?: Dietary[];
}
