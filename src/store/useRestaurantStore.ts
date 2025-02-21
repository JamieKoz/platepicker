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
  
  const preloadPhotosForUpcomingRestaurants = (count = 1) => {
    const restaurantsToPreload = restaurants.value.slice(0, count);
    
    if (restaurantsToPreload.length > 0) {
      const restaurant = restaurantsToPreload[0];
      if (!photoCache.value[restaurant.place_id]) {
        fetchAdditionalPhotos(restaurant.place_id);
      }
    }
  };
  
  const fetchAdditionalPhotos = async (placeId?: string): Promise<PhotoReference[]> => {
    if (!placeId) {
      console.error("Attempted to fetch photos with undefined place_id");
      return [];
    }
    
    if (photoCache.value[placeId]) {
      console.log("Returning cached photos for", placeId);
      return photoCache.value[placeId];
    }
    
    if (isLoadingAdditionalPhotos.value) {
      console.log("Already loading photos for another restaurant, skipping");
      return [];
    }
    
    isLoadingAdditionalPhotos.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const photoEndpoint = `${BASE_URL}/restaurants/photos/${placeId}`;
      
      const response = await axios.get(photoEndpoint, {
        timeout: 15000
      });
      
      if (response.data && response.data.photos && response.data.photos.length > 0) {
        const limitedPhotos = response.data.photos.slice(0, 3);
        photoCache.value[placeId] = limitedPhotos;
        return limitedPhotos;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching additional photos:', error);
      return [];
    } finally {
      isLoadingAdditionalPhotos.value = false;
      
      setTimeout(() => {
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
