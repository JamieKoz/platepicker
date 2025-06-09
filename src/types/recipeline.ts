import { Ingredient } from "./ingredient";
import { Measurement } from "./measurement";

export interface RecipeLine {
  id?: number;
  recipe_id?: number;
  user_meal_id?: number;
  ingredient_id?: number;
  ingredient_name: string;
  quantity: number | null;
  measurement_id?: number;
  measurement_name: string;
  measurement_abbreviation: string;
  recipe_group_id?: number;
  recipe_group_name?: string;
  user_meal_group_id?: number;
  user_meal_group_name?: string;
  notes?: string; 
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  
  ingredient?: Ingredient;
  measurement?: Measurement;
}
