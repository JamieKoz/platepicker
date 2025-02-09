export interface Restaurant {
  id?: number;
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
  types?: string[];
  photos?: Array<{
    height: number;
    width: number;
    photo_reference: string;
  }>;
}
