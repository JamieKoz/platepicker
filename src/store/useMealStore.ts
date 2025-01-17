import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { Meal } from '@/types/meal';

export const useMealStore = defineStore('mealStore', () => {
  const meals = ref<Meal[]>([]);
  const BASE_URL = 'http://localhost/api';

  // Fetch meals from API
  const fetchMeals = async () => {
    try {
      const response = await axios.get<Meal[]>(`${BASE_URL}/recipe`);
      meals.value = response.data;
    } catch (error) {
      console.error('Error fetching meals:', error);
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
