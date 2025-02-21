// useRestaurantStore.ts with direct photo return
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { Restaurant, PhotoReference } from '@/types/restaurant';

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref<Restaurant[]>([]);
  const photoCache = ref<Record<string, PhotoReference[]>>({});
  const BASE_URL = 'http://127.0.0.1:8000/api';
  const isLoading = ref(false);
  const isLoadingAdditionalPhotos = ref(false);
  
  /**
   * Fetch restaurants by address (place ID)
   */
  const fetchRestaurantsByAddress = async (placeId: string) => {
    isLoading.value = true;
    try {
      const response = await axios.get(`${BASE_URL}/restaurants/nearby`, {
        params: {
          place_id: placeId
        },
        timeout: 15000
      });
      
      if (!response.data) {
        throw new Error('No data received');
      }
      
      // Randomize the restaurants
      restaurants.value = response.data.sort(() => Math.random() - 0.5);
      
      // Start preloading photos for upcoming restaurants
      preloadPhotosForUpcomingRestaurants();
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      restaurants.value = [];
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Fetch restaurants by coordinates
   */
  const fetchRestaurantsByLocation = async (lat: number, lng: number) => {
    isLoading.value = true;
    try {
      const response = await axios.get(`${BASE_URL}/restaurants/reverse-geocode`, {
        params: { lat, lng },
        timeout: 15000
      });
      
      if (!response.data) {
        throw new Error('No data received');
      }
      
      // Randomize the restaurants
      restaurants.value = response.data.sort(() => Math.random() - 0.5);
      
      // Start preloading photos for upcoming restaurants
      preloadPhotosForUpcomingRestaurants();
    } catch (error) {
      console.error('Error fetching restaurants by location:', error);
      restaurants.value = [];
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Get the next restaurant from the queue
   */
  const getNewRestaurant = (): Restaurant | null => {
    if (restaurants.value.length > 0) {
      const nextRestaurant = restaurants.value.shift() || null;
      
      // Preload the upcoming restaurants after taking one
      if (restaurants.value.length > 0) {
        preloadPhotosForUpcomingRestaurants(1);
      }
      
      return nextRestaurant;
    }
    return null;
  };
  
  /**
   * Preload photos for upcoming restaurants to improve perceived performance
   */
  const preloadPhotosForUpcomingRestaurants = (count = 1) => {
    // Only preload for the very next restaurant to avoid rate limiting
    const restaurantsToPreload = restaurants.value.slice(0, count);
    
    // Only preload one restaurant at a time to avoid rate limiting
    if (restaurantsToPreload.length > 0) {
      const restaurant = restaurantsToPreload[0];
      if (!photoCache.value[restaurant.place_id]) {
        // Don't await - let it load in the background
        fetchAdditionalPhotos(restaurant.place_id);
      }
    }
  };
  
  /**
   * Fetch additional photos for a restaurant with throttling
   * Important: This now returns the photos directly without modifying the restaurant
   */
  const fetchAdditionalPhotos = async (placeId?: string): Promise<PhotoReference[]> => {
    // Safety check for undefined placeId
    if (!placeId) {
      console.error("Attempted to fetch photos with undefined place_id");
      return [];
    }
    
    // Return cached photos if available
    if (photoCache.value[placeId]) {
      console.log("Returning cached photos for", placeId);
      return photoCache.value[placeId];
    }
    
    // Skip if already loading additional photos for another restaurant
    if (isLoadingAdditionalPhotos.value) {
      console.log("Already loading photos for another restaurant, skipping");
      return [];
    }
    
    isLoadingAdditionalPhotos.value = true;
    console.log("Starting photo fetch for", placeId);
    
    try {
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use a variable for the API endpoint for easier debugging
      const photoEndpoint = `${BASE_URL}/restaurants/photos/${placeId}`;
      console.log("Fetching from endpoint:", photoEndpoint);
      
      const response = await axios.get(photoEndpoint, {
        timeout: 15000 // Increased timeout for slower connections
      });
      
      console.log("Response received:", response.status);
      
      if (response.data && response.data.photos && response.data.photos.length > 0) {
        // Get up to 3 photos to reduce API load
        const limitedPhotos = response.data.photos.slice(0, 3);
        
        // Cache the photos
        photoCache.value[placeId] = limitedPhotos;
        console.log(`Cached ${limitedPhotos.length} photos for ${placeId}`);
        
        // IMPORTANT: Now just return the photos directly
        // The component will handle updating the restaurant object
        return limitedPhotos;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching additional photos:', error);
      return [];
    } finally {
      console.log("Photo fetch completed for", placeId);
      isLoadingAdditionalPhotos.value = false;
      
      // Add additional delay after finishing to help with rate limiting
      setTimeout(() => {
        console.log("Post-fetch cooldown completed");
      }, 1500);
    }
  };
  
  /**
   * Get all photos for a restaurant (from cache or fetch new)
   */
  const getRestaurantPhotos = async (placeId: string): Promise<PhotoReference[]> => {
    if (photoCache.value[placeId]) {
      return photoCache.value[placeId];
    }
    
    return await fetchAdditionalPhotos(placeId);
  };
  
  const restaurantCounter = computed(() => restaurants.value.length);
  
  return {
    restaurants,
    restaurantCounter,
    fetchRestaurantsByAddress,
    fetchRestaurantsByLocation,
    getNewRestaurant,
    getRestaurantPhotos,
    fetchAdditionalPhotos,
    photoCache, // Expose the cache directly
    isLoading,
    isLoadingAdditionalPhotos
  };
});
