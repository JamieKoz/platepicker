import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useMealStore = defineStore('mealStore', () => {
  const meals = ref([]);
  const BASE_URL = 'http://127.0.0.1:8000/api';

  // Fetch meals from API
  const fetchMeals = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/recipe`);
      meals.value = response.data;
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  // Get a new meal and remove it from the array
  const getNewMeal = () => {
    if (meals.value.length > 0) {
      return meals.value.shift(); // Removes and returns the first meal
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
