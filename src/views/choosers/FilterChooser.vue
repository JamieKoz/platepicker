<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <div class="p-4">
        <!-- Header with back button -->
        <div class="flex items-center mb-6">
          <ion-button fill="clear" @click="router.go(-1)">
            <ion-icon :icon="arrowBack" slot="icon-only"></ion-icon>
          </ion-button>
          <h1 class="text-xl font-semibold ml-2">Filter Meals</h1>
        </div>

        <div class="flex justify-end">
          <ion-button fill="clear" size="small" color="medium" @click="resetFilters">
            Clear All
          </ion-button>
        </div>
        <!-- Categories -->
        <div class="mb-6">
          <ion-label class="text-lg font-medium mb-2 block">Categories</ion-label>
          <div class="flex flex-wrap gap-2">
            <ion-chip v-for="category in categories" :key="category.id"
              :color="selectedCategories.includes(category.id) ? 'primary' : ''" @click="toggleCategory(category.id)"
              class="m-0 h-8 text-white">
              {{ category.name }}
            </ion-chip>
          </div>
        </div>

        <!-- Cuisines -->
        <div class="mb-6">
          <ion-label class="text-lg font-medium mb-2 block">Cuisines</ion-label>
          <div class="flex flex-wrap gap-2">
            <ion-chip v-for="cuisine in cuisines" :key="cuisine.id"
              :color="selectedCuisines.includes(cuisine.id) ? 'primary' : ''" @click="toggleCuisine(cuisine.id)"
              class="m-0 h-8 text-white">
              {{ cuisine.name }}
            </ion-chip>
          </div>
        </div>

        <!-- Dietary Requirements -->
        <div class="mb-6">
          <ion-label class="text-lg font-medium mb-2 block">Dietary Requirements</ion-label>
          <div class="flex flex-wrap gap-2">
            <ion-chip v-for="dietary in dietaryRequirements" :key="dietary.id"
              :color="selectedDietary.includes(dietary.id) ? 'primary' : ''" @click="toggleDietary(dietary.id)"
              class="m-0 h-8 text-white">
              {{ dietary.name }}
            </ion-chip>
          </div>
        </div>

        <div class="mb-6">
          <ion-label class="text-lg font-medium mb-2 block">
            Cooking Time: {{ cookingTime > 0 ? `${cookingTime} minutes or less` : 'Any time' }}
          </ion-label>
          <div class="px-2">
            <ion-range v-model="cookingTime" :min="0" :max="120" :step="15" :pin="true" :ticks="true" :snaps="true"
              color="primary">
              <ion-label slot="start">Any</ion-label>
              <ion-label slot="end">120 min</ion-label>
            </ion-range>
          </div>
        </div>

        <!-- Apply button -->
        <ion-button expand="block" @click="applyFilters" class="mt-6">
          Let's Go
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonChip, 
  IonPage, 
  IonContent, 
  IonButton, 
  IonIcon,
  IonLabel,
  IonRange
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { arrowBack } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import api from '@/api/axios';
import type { Category } from '@/types/category';
import type { Cuisine } from '@/types/cuisine';
import type { Dietary } from '@/types/dietary';

const router = useRouter();

// Data stores
const categories = ref<Category[]>([]);
const cuisines = ref<Cuisine[]>([]);
const dietaryRequirements = ref<Dietary[]>([]);

// Selected filters
const selectedCategories = ref<number[]>([]);
const selectedCuisines = ref<number[]>([]);
const selectedDietary = ref<number[]>([]);
const cookingTime = ref(0);

// Toggle selection for categories
const toggleCategory = (id: number) => {
  const index = selectedCategories.value.indexOf(id);
  if (index === -1) {
    selectedCategories.value.push(id);
  } else {
    selectedCategories.value.splice(index, 1);
  }
};

// Toggle selection for cuisines
const toggleCuisine = (id: number) => {
  const index = selectedCuisines.value.indexOf(id);
  if (index === -1) {
    selectedCuisines.value.push(id);
  } else {
    selectedCuisines.value.splice(index, 1);
  }
};

// Toggle selection for dietary requirements
const toggleDietary = (id: number) => {
  const index = selectedDietary.value.indexOf(id);
  if (index === -1) {
    selectedDietary.value.push(id);
  } else {
    selectedDietary.value.splice(index, 1);
  }
};

// Check if any filters are selected
// Reset all filters
const resetFilters = () => {
  selectedCategories.value = [];
  selectedCuisines.value = [];
  selectedDietary.value = [];
  cookingTime.value = 0;
};

// Apply filters and navigate
const applyFilters = () => {
  // Store filters in localStorage for persistence
  localStorage.setItem('mealFilters', JSON.stringify({
    categories: selectedCategories.value,
    cuisines: selectedCuisines.value,
    dietary: selectedDietary.value,
    cooking_time: cookingTime.value > 0 ? cookingTime.value : null
  }));
  
  // Prepare query parameters
  const query: Record<string, string> = {};
  
  if (selectedCategories.value.length) {
    query.categories = selectedCategories.value.join(',');
  }
  
  if (selectedCuisines.value.length) {
    query.cuisines = selectedCuisines.value.join(',');
  }
  
  if (selectedDietary.value.length) {
    query.dietary = selectedDietary.value.join(',');
  }

  if(cookingTime.value > 0){
    query.cooking_time = cookingTime.value.toString();
  }
   
  router.push({
    path: '/meal-chooser',
    query
  });
};

// Load data on component mount
onMounted(async () => {
  try {
    // Fetch filter options from API
    const [categoriesRes, cuisinesRes, dietaryRes] = await Promise.all([
      api.get('/categories'),
      api.get('/cuisines'),
      api.get('/dietary')
    ]);
    
    categories.value = categoriesRes.data;
    cuisines.value = cuisinesRes.data;
    dietaryRequirements.value = dietaryRes.data;
    
    // Load saved filters from localStorage if available
    const savedFilters = localStorage.getItem('mealFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      selectedCategories.value = filters.categories || [];
      selectedCuisines.value = filters.cuisines || [];
      selectedDietary.value = filters.dietary || [];
      cookingTime.value = filters.cooking_time || 0;
    }
  } catch (error) {
    console.error("Error fetching reference data:", error);
  }
});
</script>

<style scoped>
ion-chip {
  transition: transform 0.1s ease;
}

ion-chip:active {
  transform: scale(0.95);
}
</style>
