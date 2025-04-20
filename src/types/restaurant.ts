// types/restaurant.ts

export interface PhotoReference {
  reference: string;
  height?: number;
  width?: number;
  html_attributions?: string[];
}

// Photo with URL for display
export interface RestaurantPhoto {
  url: string;
  width: number;
  height: number;
  attributions: string[];
}

// Restaurant with progressive loading support
export interface Restaurant {
  id?: number;
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  price_level?: number;
  types?: string[];
  has_additional_photos?: boolean;

  primary_photo?: PhotoReference;
  photos?: Array<PhotoReference>;

  opening_hours?: {
    open_now: boolean;
  };
}
