// useRestaurantStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { Restaurant } from '@/types/restaurant';

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref<Restaurant[]>([]);
  const BASE_URL = 'http://127.0.0.1:8000/api';
  
  const fetchRestaurantsByAddress = async (placeId: string) => {
    console.log('Store received place_id:', placeId);
    try {
      const response = await axios.get(`${BASE_URL}/restaurants/nearby`, {
        params: {
          place_id: placeId
        }
      });
      if (!response.data) {
        throw new Error('No data received');
      }
      // Randomize the restaurants
      restaurants.value = response.data.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  };
  
  const getNewRestaurant = (): Restaurant | null => {
    if (restaurants.value.length > 0) {
      return restaurants.value.shift() || null;
    }
    return null;
  };

  const restaurantCounter = computed(() => restaurants.value.length);

  return {
    restaurants,
    restaurantCounter,
    fetchRestaurantsByAddress,
    getNewRestaurant,
  };
});
