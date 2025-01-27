<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="transparent-toolbar">
      <ion-title class="text-center">{{ mealStore.mealCounter }}</ion-title>
      <ion-buttons slot="end" v-if="showRefreshButton">
        <ion-button @click="handleRefresh">
          <ion-icon :icon="refresh" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <RetryConnection v-if="loadError" message="Unable to load meals. Please check your connection."
    @retry="handleRetry" />
  <ion-grid v-else class="flex items-center justify-center">
    <ion-row v-if="!winner" class="flex justify-between items-center meal-row">
      <ion-col class="flex justify-center items-center flex-1">
        <MealCard :mealData="meal1" @replaceMeal="replaceMeal" />
      </ion-col>
      <ion-col class="flex justify-center items-center flex-1">
        <MealCard :mealData="meal2" @replaceMeal="replaceMeal" />
      </ion-col>
    </ion-row>

    <ion-row v-else class="flex flex-col justify-center winner-row">
      <ion-col>
        <h2 class="text-center text-2xl font-bold mb-4">{{ winner.title }}</h2>
        <div class="meal-image mb-4">
          <ion-img :src="`https://dy9kit23m04xx.cloudfront.net/food-images/${winner.image_name}.jpg`"
            class="h-full w-full object-fit"></ion-img>
        </div>
        <div class="recipe-content">
          <div class="ingredients-section">
            <h3 class="text-xl font-semibold mb-4">Ingredients</h3>
            <ul class="ingredient-list">
              <li v-for="(ingredient, index) in formattedIngredients" :key="index" class="ingredient-item">
                {{ ingredient }}
              </li>
            </ul>
          </div>
          <div class="instructions-section">
            <h3 class="text-xl font-semibold mb-4">Instructions</h3>
            <div class="instructions-text">
              {{ winner.instructions }}
            </div>
          </div>
        </div>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/api/axios';
import { refresh } from 'ionicons/icons';
import { useMealStore } from '@/store/useMealStore';
import MealCard from '@/components/MealCard.vue';
import RetryConnection from '@/components/RetryConnection.vue';
import { IonCol, IonGrid, IonRow, IonImg, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import type { Meal } from '@/types/meal';

const mealStore = useMealStore();
let meal1 = ref<Meal | null>(null);
let meal2 = ref<Meal | null>(null);
const winner = ref<Meal | null>(null);
const loadError = ref(false);

// Fetch initial meals on mount
onMounted(() => fetchInitialMeals());

async function fetchInitialMeals() {
  try {
    loadError.value = false;
    await mealStore.fetchMeals();
    const newMeal1 = mealStore.getNewMeal();
    const newMeal2 = mealStore.getNewMeal();
    if (newMeal1) meal1.value = newMeal1;
    if (newMeal2) meal2.value = newMeal2;
  } catch (error) {
    console.error('Error fetching meals:', error);
    loadError.value = true;
  }
}

async function handleRetry() {
  await fetchInitialMeals();
}

async function trackMealSelection(mealId: number) {
  try {
    await api.post(`/user-meals/${mealId}/increment-tally`);
  } catch (error) {
    console.error('Error tracking meal selection:', error);
  }
}

// Replace meal handler
const replaceMeal = async (clickedMeal: Meal) => {
  try {
    if (mealStore.mealCounter === 0) {
      winner.value = clickedMeal;
      meal1.value = null;
      meal2.value = null;
    } else {
      const newMeal = mealStore.getNewMeal();
      if (!newMeal) return;
      await trackMealSelection(clickedMeal.id);
      if (clickedMeal.id === meal1.value?.id) {
        meal2.value = newMeal;
      } else if (clickedMeal.id === meal2.value?.id) {
        meal1.value = newMeal;
      }
    }
  } catch (error) {
    console.error('Error replacing meal:', error);
    loadError.value = true;
  }
};

const formattedIngredients = computed(() => {
  if (!winner.value?.ingredients) return [];
  
  try {
    const withoutQuotes = winner.value.ingredients.replace(/^"|"$/g, '');
    
    const cleanStr = withoutQuotes
      .replace(/^\[|\]$/g, '')  // Remove outer brackets
      .split("', '")            // Split on items
      .map(item => {
        return item
          .replace(/^'|'$/g, '') // Remove single quotes at start/end
          .replace(/\\/g, '')     // Remove all backslashes
          .trim()
          // Convert all Unicode escapes to their actual characters
          .replace(/u([0-9a-fA-F]{4})/g, (match, grp) => 
            String.fromCharCode(parseInt(grp, 16))
          );
      });

    return cleanStr;
  } catch (e) {
    console.error('Error parsing ingredients:', e);
    return [];
  }
});

const showRefreshButton = computed(() => {
  return mealStore.mealCounter === 0 && winner.value !== null;
});

const handleRefresh = async () => {
  winner.value = null;
  await fetchInitialMeals();
};
</script>

<style scoped>
/* Ensure the meal cards are responsive */
.meal-row {
  width: 100vw;
  /* Full width of the viewport */
  height: 50vh;
  /* Cards take 50% of the viewport height */
}

/* Force each card to take 45% of the screen width and adjust height */
.meal-card {
  width: 90vw;
  height: 40vh;
}

.winner-row {
  width: 100vw;
  height: 80vh;
  /* Winner section takes up 80% of the viewport height */
  display: flex;
  justify-content: center;
  align-items: center;
}

.meal-image {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 70%;
}
.transparent-toolbar {
  --background: transparent;
  --border-width: 0;
  --border-color: transparent;
}

:global(.header-md::after) {
  background-image: none;
}
.recipe-content {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.ingredients-section {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.ingredient-list {
  list-style-type: none;
  padding: 0;
}

.ingredient-list li {
  position: relative;
  padding-left: 1.5rem;
}

.ingredient-list li::before {
  content: "•";
  position: absolute;
  left: 0.5rem;
  color: #666;
}

.instructions-section {
  padding: 0 1rem;
}

.instructions-text {
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
