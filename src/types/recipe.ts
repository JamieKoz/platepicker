export interface Recipe {
  id: number;
  title: string;
  ingredients: string | null;
  instructions: string | null;
  image_name: string | null;
  cleaned_ingredients: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
