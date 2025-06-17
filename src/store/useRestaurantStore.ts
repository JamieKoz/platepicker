// useRestaurantStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/axios';
import type { Restaurant, PhotoReference } from '@/types/restaurant';

// Update dining options to include custom
export type DiningOption = 'delivery' | 'takeaway' | 'drive_thru' | 'dine_in' | 'bars' | 'custom';

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref<Restaurant[]>([]);
  const photoCache = ref<Record<string, PhotoReference[]>>({});
  const isLoading = ref(false);
  const isLoadingAdditionalPhotos = ref(false);
  const currentDiningOption = ref<DiningOption>('delivery');
  const searchKeyword = ref<string | null>(null);

  /**
   * Set the current dining option
   */
  const setDiningOption = (option: DiningOption) => {
    currentDiningOption.value = option;
  };

  /**
   * Set the search keyword for custom searches
   */
  const setSearchKeyword = (keyword: string | null) => {
    searchKeyword.value = keyword;
  };

  /**
   * Fetch restaurants by address (place ID)
   */
  const fetchRestaurantsByAddress = async (placeId: string) => {
    isLoading.value = true;
    try {
      const params: any = {
        place_id: placeId,
        dining_option: currentDiningOption.value
      };

      // Add keyword if it's a custom search
      if (currentDiningOption.value === 'custom' && searchKeyword.value) {
        params.keyword = searchKeyword.value;
      }

      const response = await api.get('/restaurants/nearby', {
        params,
        timeout: 15000
      });

      if (!response.data) {
        throw new Error('No data received');
      }

      if (!response.data || !Array.isArray(response.data) || typeof response.data !== 'object') {
        restaurants.value = [];
        throw new Error('Unexpected data format received');
      }

      restaurants.value = response.data.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      restaurants.value = [];
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch restaurants by coordinates. Used by current location
   */
  const fetchRestaurantsByLocation = async (lat: number, lng: number) => {
    isLoading.value = true;
    try {
      const params: any = {
        lat,
        lng,
        dining_option: currentDiningOption.value
      };

      // Add keyword if it's a custom search
      if (currentDiningOption.value === 'custom' && searchKeyword.value) {
        params.keyword = searchKeyword.value;
      }

      const response = await api.get('/restaurants/reverse-geocode', {
        params,
        timeout: 15000
      });

      if (!response.data) {
        throw new Error('No data received');
      }

      restaurants.value = response.data.sort(() => Math.random() - 0.5);
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
      return nextRestaurant;
    }
    return null;
  };

  const fetchAdditionalPhotos = async (placeId?: string): Promise<PhotoReference[]> => {
    if (!placeId) {
      console.error("Attempted to fetch photos with undefined place_id");
      return [];
    }

    // Return cached photos if available
    if (photoCache.value[placeId] && photoCache.value[placeId].length > 0) {
      console.log("Returning cached photos for", placeId);
      return photoCache.value[placeId];
    }

    // If already loading photos for this restaurant, don't start another request
    if (isLoadingAdditionalPhotos.value) {
      console.log("Already loading photos, returning empty array");
      return [];
    }

    isLoadingAdditionalPhotos.value = true;
    try {
      console.log("Fetching additional photos for", placeId);

      const photoEndpoint = `/restaurants/photos/${placeId}`;

      const response = await api.get(photoEndpoint, {
        timeout: 15000
      });

      if (response.data && response.data.photos && response.data.photos.length > 0) {
        // Get up to 4 photos
        const limitedPhotos = response.data.photos.slice(0, 4);
        photoCache.value[placeId] = limitedPhotos;
        console.log(`Loaded ${limitedPhotos.length} photos for restaurant ${placeId}`);
        return limitedPhotos;
      }

      console.log(`No photos found for restaurant ${placeId}`);
      return [];
    } catch (error) {
      console.error('Error fetching additional photos:', error);
      return [];
    } finally {
      isLoadingAdditionalPhotos.value = false;
    }
  };

  /**
   * Get all photos for a restaurant (from cache or fetch new)
   */
  const getRestaurantPhotos = async (placeId: string): Promise<PhotoReference[]> => {
    try {
      if (!placeId) {
        console.warn('Attempted to get photos without a placeId');
        return [];
      }

      const photos = await fetchAdditionalPhotos(placeId);
      console.log(`getRestaurantPhotos returning ${photos.length} photos for ${placeId}`);
      return photos;
    } catch (error) {
      console.error('Error in getRestaurantPhotos:', error);
      return [];
    }
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
    photoCache,
    isLoading,
    isLoadingAdditionalPhotos,
    currentDiningOption,
    setDiningOption,
    searchKeyword,
    setSearchKeyword
  };
});
