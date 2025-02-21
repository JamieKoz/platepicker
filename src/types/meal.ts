export interface Meal {
  id: number;
  user_id: number;
  recipe_id: number | null;
  title: string;
  ingredients: string | null;
  instructions: string | null;
  image_name: string | null;
  cleaned_ingredients: string | null;
  cooking_time: string | null;
  serves: string | null;
  dietary: string[] | null;
  active: boolean;
  created_at: string;
  updated_at: string;

}
