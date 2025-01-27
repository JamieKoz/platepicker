import type { Meal } from '@/types/meal';

export interface Favourite {
  id: number;
  tally: number;
  last_selected_at: string;
  meal: Meal;
}
