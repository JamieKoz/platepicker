<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="mt-12 transparent-toolbar">
        <BackArrow />
        <ion-title class="text-center text-xl">{{ mealData?.title || 'Meal Details' }}</ion-title>
        <ion-buttons slot="end">
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-no-padding !overflow-hidden">
      <div v-if="loading" class="flex justify-center items-center h-full">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else-if="error" class="flex flex-col justify-center items-center h-full p-4">
        <ion-icon :icon="alertCircleOutline" class="text-4xl text-red-500 mb-4"></ion-icon>
        <p class="text-center text-lg">{{ error }}</p>
        <ion-button @click="fetchMeal" class="mt-4">Try Again</ion-button>
      </div>

      <ion-grid v-else-if="mealData" class="h-full ion-no-padding">
        <ion-row class="h-full flex justify-center items-start mt-4">
          <ion-col class="flex flex-col items-center mx-6">
            <!-- This div wraps the MealCard -->
            <div class="meal-detail-wrapper">
              <MealCard :mealData="mealData" />
            </div>
            
            <div class="flex-1 flex justify-end">
              <ion-button fill="clear" @click="handleShare">
                <ion-icon :icon="shareOutline" class="bg-slate-200 dark:bg-gray-900 rounded-xl p-2 dark:text-white" />
              </ion-button>
            </div>
            
            <div class="mt-4 mb-16">
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="category in mealData.categories" :key="category.id" 
                  class="bg-blue-600 text-white text-xs rounded-full px-3 py-1">
                  {{ category.name }}
                </span>
                <span v-for="cuisine in mealData.cuisines" :key="cuisine.id" 
                  class="bg-purple-600 text-white text-xs rounded-full px-3 py-1">
                  {{ cuisine.name }}
                </span>
              </div>
              
              <div class="rounded-md mb-6 px-4 pt-1 pb-4 bg-amber-50 dark:bg-gray-900">
                <h3 class="text-xl font-semibold mb-4">Ingredients</h3>
                
                <!-- Grouped ingredients display -->
                <div v-if="groupedIngredients && Object.keys(groupedIngredients).length > 0" class="space-y-4">
                  <div v-for="(ingredients, groupName) in groupedIngredients" :key="groupName" class="mb-2">
                    <!-- Group header -->
                    <h4 v-if="groupName !== 'Main Ingredients'" class="text-lg font-medium mb-2 border-b border-blue-400 pb-1">
                      {{ groupName }}
                    </h4>
                    <h4 v-else class="text-lg font-medium mb-2 border-b border-blue-400 pb-1">
                      {{ groupName }}
                    </h4>
                    
                    <!-- Ingredients in this group -->
                    <ul class="ingredient-list mb-4">
                      <li v-for="line in ingredients" :key="line.id || line.ingredient_name" class="ingredient-item mb-2">
                        <input type="checkbox"><span class="ml-4">{{ formatRecipeLine(line) }}</span></input>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <!-- Fallback for no ingredients -->
                <p v-else class="dark:text-gray-400">No ingredients listed</p>
              </div>

              <div class="rounded-md mb-6 px-4 pt-1 pb-4 bg-amber-50 dark:bg-gray-900">
                <h3 class="text-xl font-semibold mb-4">Instructions</h3>
                <div v-if="mealData.instructions" class="whitespace-pre-wrap dark:text-gray-200">
                  {{ mealData.instructions }}
                </div>
                <p v-else class="dark:text-gray-400">No instructions provided</p>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api/axios';
import MealCard from '@/components/MealCard.vue';
import BackArrow from '@/components/navigation/BackArrow.vue';
import { decimalToFraction } from '@/utils/fractionHelpers';
import { 
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, 
  IonButtons, IonButton, IonIcon, IonSpinner, IonGrid, IonRow, IonCol,
} from '@ionic/vue';
import { shareOutline, alertCircleOutline } from 'ionicons/icons';
import type { Recipe } from '@/types/recipe';
import type { Meal } from '@/types/meal';
import type { RecipeLine } from '@/types/recipeline';

// Accept props for the endpoint configuration
const props = defineProps<{
  endpoint: string;
}>();

const route = useRoute();
const mealData = ref<Recipe | Meal | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Computed property to group ingredients by their groups
const groupedIngredients = computed(() => {
  if (!mealData.value?.recipe_lines) return {};
  
  const groups: Record<string, RecipeLine[]> = {};
  
  mealData.value.recipe_lines.forEach(line => {
    let groupName = 'Main Ingredients';
    
    // Determine group name based on endpoint type
    if (props.endpoint === 'recipes') {
      // For recipes, check recipe_group_id
      if (line.recipe_group_id && mealData.value?.recipe_groups) {
        const group = mealData.value.recipe_groups.find(g => g.id === line.recipe_group_id);
        groupName = group?.name || 'Main Ingredients';
      }
    } else {
      // For user meals, check user_meal_group_id
      if (line.user_meal_group_id && mealData.value?.recipe_groups) {
        const group = mealData.value.recipe_groups.find(g => g.id === line.user_meal_group_id);
        groupName = group?.name || 'Main Ingredients';
      }
    }
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(line);
  });
  
  const sortedGroups: Record<string, RecipeLine[]> = {};
  
  Object.keys(groups)
    .filter(key => key !== 'Main Ingredients')
    .sort()
    .forEach(key => {
      sortedGroups[key] = groups[key];
    });
  
  if (groups['Main Ingredients']) {
    sortedGroups['Main Ingredients'] = groups['Main Ingredients'];
  }
  return sortedGroups;
});

// Updated formatRecipeLine function with fraction conversion
const formatRecipeLine = (line: RecipeLine): string => {
  let result = '';
  
  // Handle quantity - check for valid number and convert to fraction
  if (line.quantity !== undefined && line.quantity !== null && line.quantity > 0) {
    result += decimalToFraction(line.quantity);
  }
  
  // Handle measurement
  if (line.measurement && line.measurement.name) {
    if (line.measurement.name !== 'Units') {
      result += ` ${line.measurement.abbreviation || line.measurement.name}`;
    }
    result += ' ';
  } else if (line.measurement_name && line.measurement_name !== 'Units') {
    result += ` ${line.measurement_abbreviation || line.measurement_name}`;
    result += ' ';
  } else if (result) {
    // If we have a quantity but no measurement, add a space
    result += ' ';
  }
  
  // Handle ingredient name
  if (line.ingredient && line.ingredient.name) {
    result += line.ingredient.name;
  } else if (line.ingredient_name) {
    result += line.ingredient_name;
  }
  
  if(line.notes){
    let notes = ' ';
    notes += '(';
    notes += line.notes;
    notes += ')';
    result += notes;
  }
  return result.trim();
};

const fetchMeal = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const id = route.params.id;
    const response = await api.get(`/${props.endpoint}/${id}`);
    mealData.value = response.data;
  } catch (err: any) {
    console.error('Error fetching meal details:', err);
    error.value = err.response?.data?.error || 'Failed to load meal details';
  } finally {
    loading.value = false;
  }
};

const handleShare = async () => {
  if (!mealData.value) return;
  
  try {
    const shareData = {
      title: mealData.value.title,
      text: `Check out this recipe for ${mealData.value.title}!`,
      url: window.location.href
    };
    
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      // Here you could show a toast notification that the URL was copied
    }
  } catch (err) {
    console.error('Error sharing:', err);
  }
};

onMounted(() => {
  fetchMeal();
});
</script>

<style scoped>
.transparent-toolbar {
  --background: transparent;
  --border-width: 0;
  --border-color: transparent;
}

.meal-detail-wrapper {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.ingredient-list {
  list-style-type: none;
  padding: 0;
}

.ingredient-item {
  position: relative;
  padding-left: 1.5rem;
}

.ingredient-item::before {
  /* content: "•"; */
  position: absolute;
  left: 0.5rem;
  color: #666;
}

:global(.header-md::after) {
  background-image: none;
}
</style>
