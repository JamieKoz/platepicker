import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/axios';
import type { Meal } from '@/types/meal';
import { useUser } from '@clerk/vue';

export const useMealStore = defineStore('mealStore', () => {
  const meals = ref<Meal[]>([]);
  const { user } = useUser();
  
  // Fetch meals from API with optional filters
  const fetchMeals = async (filters?: {
    categories?: string,
    cuisines?: string,
    dietary?: string
    max_cooking_time?: number | string
  }) => {
    try {
      const headers: { [key: string]: string } = {};
      if (user.value?.id) {
        headers['X-User-ID'] = user.value.id;
      }
      
      // Add filters as query parameters if provided
      const params = filters || {};
      
      const response = await api.get<Meal[]>('/recipe', { 
        headers,
        params
      });
      
      if (!response.data) {
        throw new Error('No data received');
      }
      meals.value = response.data;
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw error;
    }
  };
  
  // Get a new meal and remove it from the array
  const getNewMeal = (): Meal | null => {
    if (meals.value.length > 0) {
      return meals.value.shift() || null;
    }
    return null;
  };
  
  // Meal counter reflects remaining meals
  const mealCounter = computed(() => meals.value.length);
  
  return {
    mealCounter,
    meals,
    fetchMeals,
    getNewMeal,
  };
});
