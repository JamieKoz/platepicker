<template>
  <ion-page class="mt-8">
    <ion-content :fullscreen="true">
      <div class="flex items-center mb-6 pt-2">
        <div class="mt-2">
          <Back-Arrow />
        </div>
        <h1 class="text-xl font-semibold ml-2">Filter Meals</h1>
      </div>

      <div class="p-2">
        <div class="flex justify-between">
          <span class="text-xs pt-2">Note: Deselect all if you want all options</span>
          <div class="">
            <ion-button fill="clear" size="small" color="medium" @click="resetFilters">
              Clear All
            </ion-button>
          </div>
        </div>
        <!-- Categories -->
        <div class="mb-6">
          <ion-label class="text-lg font-medium mb-2 block">Categories</ion-label>
          <div class="flex flex-wrap gap-2">
            <ion-chip v-for="category in categoryStore.categories" :key="category.id"
              :class="['m-0 h-8 text-white', selectedCategories.includes(category.id) ? 'bg-yellow-500 font-medium' : 'bg-gray-800']"
              @click="toggleCategory(category.id)">
              {{ category.name }}
            </ion-chip>
          </div>
        </div>

        <!-- Cuisines -->
        <div class="mb-6">
          <ion-label class="text-lg font-medium mb-2 block">Cuisines</ion-label>
          <div class="flex flex-wrap gap-2">
            <ion-chip v-for="cuisine in cuisineStore.cuisine" :key="cuisine.id"
              :class="['m-0 h-8 text-white', selectedCuisines.includes(cuisine.id) ? 'bg-yellow-500 font-medium' : 'bg-gray-800']"
              @click="toggleCuisine(cuisine.id)">
              {{ cuisine.name }}
            </ion-chip>
          </div>
        </div>

        <!-- Dietary Requirements -->
        <div class="mb-6">
          <ion-label class="text-lg font-medium mb-2 block">Dietary Requirements</ion-label>
          <div class="flex flex-wrap gap-2">
            <ion-chip v-for="dietary in dietaryStore.dietary" :key="dietary.id"
              :class="['m-0 h-8 text-white', selectedDietary.includes(dietary.id) ? 'bg-yellow-500 font-medium' : 'bg-gray-800']"
              @click="toggleDietary(dietary.id)">
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
  IonLabel,
  IonRange
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import BackArrow from '@/components/navigation/BackArrow.vue';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useDietaryStore } from '@/store/useDietaryStore';
import { useCuisineStore } from '@/store/useCuisineStore';

const router = useRouter();
const categoryStore = useCategoryStore();
const cuisineStore = useCuisineStore();
const dietaryStore = useDietaryStore();

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
    // Fetch filter options using stores
    await Promise.all([
      categoryStore.fetchCategories(),
      cuisineStore.fetchCuisine(),
      dietaryStore.fetchDietary()
    ]);
    
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
