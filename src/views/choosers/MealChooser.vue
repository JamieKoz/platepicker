<template>
  <ion-page class="mt-12">
    <ion-content>
      <ion-header class="ion-no-border">
        <ion-toolbar class="transparent-toolbar">
          <Back-Arrow />
          <ion-title class="text-center">{{ mealStore.mealCounter }}</ion-title>
        </ion-toolbar>

      </ion-header>
      <RetryConnection v-if="loadError" message="Unable to load meals. Please check your connection."
        @retry="handleRetry" />
      <ion-content v-else class="ion-no-padding !overflow-hidden">
        <ion-grid class="h-full ion-no-padding">
          <!-- Competition View -->
          <ion-row v-if="!winner" class="competition-row mx-2">
            <ion-col class="flex justify-center items-center h-full p-2">
              <div :class="{ 'slide-out-right': animateMeal1, 'slide-in-left': newMealAnimation1 }"
                class="meal-container h-full w-full">
                <MealCard :mealData="meal1" @replaceMeal="handleMealSelected" />
              </div>
            </ion-col>
            <ion-col class="flex justify-center items-center h-full p-2">
              <div :class="{ 'slide-out-right': animateMeal2, 'slide-in-left': newMealAnimation2 }"
                class="meal-container h-full w-full">
                <MealCard :mealData="meal2" @replaceMeal="handleMealSelected" />
              </div>
            </ion-col>
          </ion-row>
          <!-- Winner View -->
          <ion-row v-else class="h-full flex justify-center items-start">
            <ion-col class="flex flex-col items-center mx-6">
              <div class="w-full flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold flex-1 text-center">Winner!</h2>
              </div>
              <div>
                <MealCard :mealData="winner" />
              </div>
              <div class="flex-1 flex justify-end">
                <ion-button fill="clear" @click="handleShare">
                  <ion-icon :icon="shareOutline" class="bg-gray-900 rounded-xl p-2 text-white" />
                </ion-button>
                <ion-button v-if="showRefreshButton" @click="handleRefresh" fill="clear">
                  <ion-icon :icon="refresh" class="bg-gray-900 rounded-xl p-2 text-white" />
                </ion-button>
              </div>

              <div class="mt-4 mb-16">
                <div class="rounded-md mb-6 mx-6">
                  <h3 class="text-xl font-semibold mb-4">Ingredients</h3>
                    <ul v-if="winner.recipe_lines && winner.recipe_lines.length > 0" class="ingredient-list">
                      <li v-for="line in winner.recipe_lines" :key="line.id" class="ingredient-item">
                        {{ formatRecipeLine(line) }}
                      </li>
                  </ul>
                </div>
                <div class="rounded-md mb-6 mx-6">
                  <h3 class="text-xl font-semibold mb-4">Instructions</h3>
                  <div class="whitespace-pre-wrap">
                    {{ winner.instructions }}
                  </div>
                </div>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api/axios';
import { refresh, clipboardOutline, mailOutline, chatbubbleOutline, closeOutline, shareSocialOutline, shareOutline } from 'ionicons/icons';
import { useMealStore } from '@/store/useMealStore';
import { useUser } from '@clerk/vue';
import { useRouter, useRoute } from 'vue-router';
import { decimalToFraction } from '@/utils/fractionHelpers';
import MealCard from '@/components/MealCard.vue';
import BackArrow from '@/components/navigation/BackArrow.vue';
import RetryConnection from '@/components/RetryConnection.vue';
import { IonPage, IonCol, IonGrid, IonRow, IonImg, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, toastController, actionSheetController, IonActionSheet } from '@ionic/vue';
import type { Meal } from '@/types/meal';
import { RecipeLine } from '@/types/recipeline';

const route = useRoute();
const mealStore = useMealStore();
let meal1 = ref<Meal | null>(null);
let meal2 = ref<Meal | null>(null);
const winner = ref<Meal | null>(null);
const loadError = ref(false);

// Animation states
const animateMeal1 = ref(false);
const animateMeal2 = ref(false);
const newMealAnimation1 = ref(false);
const newMealAnimation2 = ref(false);
const { user } = useUser();
const router = useRouter();

const getFiltersFromRoute = () => {
  const filters: any = {};
  
  if (route.query.categories) {
    filters.categories = route.query.categories as string;
  }
  
  if (route.query.cuisines) {
    filters.cuisines = route.query.cuisines as string;
  }
  
  if (route.query.dietary) {
    filters.dietary = route.query.dietary as string;
  }

   if (route.query.cooking_time) {
    filters.cooking_time = route.query.cooking_time;
  }

  return filters;
};

// Updated formatRecipeLine function with fraction conversion
const formatRecipeLine = (line: RecipeLine): string => {
  let result = '';
  
  if (line.quantity) {
    // Convert quantity to fraction format
    result += decimalToFraction(line.quantity);
  }
  
  if (line.measurement && line.measurement.name) {
    if(line.measurement.name !== 'Units'){
      result += ' ' + line.measurement.abbreviation + ' ';
    } else{
      result += ' ';
    }
  }   
  
  if (line.ingredient && line.ingredient.name) {
    result += line.ingredient.name;
  } else if (line.ingredient_name) {
    result += line.ingredient_name;
  }
  
  return result.trim();
};
// Fetch initial meals on mount
onMounted(() => fetchInitialMeals());

async function fetchInitialMeals() {
  try {
    loadError.value = false;
    const filters = getFiltersFromRoute();
    await mealStore.fetchMeals(filters);
    const newMeal1 = mealStore.getNewMeal();
    const newMeal2 = mealStore.getNewMeal();
    if (newMeal1) meal1.value = newMeal1;
    if (newMeal2) meal2.value = newMeal2;
  } catch (error) {
    console.error('Error fetching meals:', error);
    loadError.value = true;
  }
}

watch(() => route.query, (newQuery) => {
  if (newQuery.categories || newQuery.cuisines || newQuery.dietary) {
    fetchInitialMeals();
  }
}, { deep: true });

async function handleRetry() {
  await fetchInitialMeals();
}

async function trackMealSelection(meal: Meal) {
  try {
    const mealId = meal.id;
    await api.post(`/user-meals/${mealId}/increment-tally`);
  } catch (error) {
    console.error('Error tracking meal selection:', error);
  }
}

const handleMealSelected = async (clickedMeal: Meal) => {
  await trackMealSelection(clickedMeal);

  if (mealStore.mealCounter === 0) {
    winner.value = clickedMeal;
    meal1.value = null;
    meal2.value = null;
    return;
  }

  // Determine which meal was clicked and which needs to be replaced
  const isMeal1Clicked = clickedMeal.id === meal1.value?.id;
  const mealToAnimate = isMeal1Clicked ? animateMeal2 : animateMeal1;
  const newMealAnimation = isMeal1Clicked ? newMealAnimation2 : newMealAnimation1;
  const mealToReplace = isMeal1Clicked ? meal2 : meal1;

  // Animate the other meal sliding out
  mealToAnimate.value = true;

  // After animation completes, replace the meal and animate in
  setTimeout(async () => {
    try {
      const newMeal = mealStore.getNewMeal();
      if (!newMeal) return;

      // Reset animation state
      mealToAnimate.value = false;

      // Replace the meal
      mealToReplace.value = newMeal;

      // Animate the new meal sliding in
      newMealAnimation.value = true;

      // Remove the slide-in class after animation completes
      setTimeout(() => {
        newMealAnimation.value = false;
      }, 500);

    } catch (error) {
      console.error('Error replacing meal:', error);
      loadError.value = true;
    }
  }, 400);
};

const showRefreshButton = computed(() => {
  return winner.value !== null;
});

const handleRefresh = async () => {
  winner.value = null;

  try {
    if (!user.value) {
      await router.push('/sign-in');
      return;
    }
  } catch (error) {
    console.error("Error during refresh: ", error);
  }
  await fetchInitialMeals();
};

const formattedIngredients = computed(() => {
  if (!winner.value?.recipe_lines || !winner.value.recipe_lines.length) {
    return [];
  }

  // Format each recipe line to a readable string
  return winner.value.recipe_lines.map(line => formatRecipeLine(line));
});

// Update share handlers to use the new formatting

const handleShare = async () => {
  if (!winner.value) return;

  const actionSheet = await actionSheetController.create({
    header: 'Share Recipe',
    cssClass: 'custom-action-sheet',
    buttons: [
      {
        text: 'Copy',
        cssClass: 'custom-button',
        role: 'copy',
        data: {
          action: 'copy',
        },
        icon: clipboardOutline,
        handler: async () => {
          // Create a formatted recipe text
          const shareText = `${winner.value?.title}\n\nIngredients:\n${formattedIngredients.value.join('\n')}\n\nInstructions:\n${winner.value?.instructions}`;
          
          try {
            await navigator.clipboard.writeText(shareText);
            const toast = await toastController.create({
              message: 'Recipe copied to clipboard!',
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();
          } catch (error) {
            console.error('Error copying to clipboard:', error);
          }
        }
      },
      {
        text: 'Share via Email',
        cssClass: 'custom-button',
        icon: mailOutline,
        handler: () => {
          const subject = encodeURIComponent(winner.value?.title || 'Recipe');
          const body = encodeURIComponent(`${winner.value?.title}\n\nIngredients:\n${formattedIngredients.value.join('\n')}\n\nInstructions:\n${winner.value?.instructions}`);
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }
      },
      {
        text: 'Share via Messages',
        cssClass: 'custom-button',
        icon: chatbubbleOutline,
        handler: () => {
          const text = encodeURIComponent(`${winner.value?.title}\n\nIngredients:\n${formattedIngredients.value.join('\n')}\n\nInstructions:\n${winner.value?.instructions}`);
          window.location.href = `sms:?&body=${text}`;
        }
      },
      {
        text: 'Share via Social Media',
        cssClass: 'custom-button',
        icon: shareSocialOutline,
        handler: () => {
          const text = `Check out this recipe for ${winner.value?.title}!`;
          if (navigator.share) {
            navigator.share({
              title: winner.value?.title,
              text: text
            });
          } else {
            // Fallback for browsers that don't support Web Share API
            const toast = toastController.create({
              message: 'Social sharing not supported on this device',
              duration: 2000,
              position: 'bottom'
            });
            toast.then(t => t.present());
          }
        }
      },
      {
        text: 'Cancel',
        cssClass: 'custom-button',
        icon: closeOutline,
        role: 'cancel'
      }
    ]
  });

  await actionSheet.present();
};
</script>

<style scoped>
.competition-row {
  height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
}

.transparent-toolbar {
  --background: transparent;
  --border-width: 0;
  --border-color: transparent;
}

.meal-container {
  transition: transform 0.3s ease-out;
}

.slide-out-right {
  transform: translateX(100vw);
}

.slide-in-left {
  animation: slideInFromLeft 0.3s forwards;
}

@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100vw);
  }
  100% {
    transform: translateX(0);
  }
}

:global(.header-md::after) {
  background-image: none;
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

:global(.custom-action-sheet .custom-button) {
  --button-inner-justify-content: space-between !important;
  --justify-content: space-between !important;
}

:global(.custom-action-sheet .action-sheet-button.custom-button .action-sheet-button-inner) {
  justify-content: space-between !important;
  width: 100%;
  flex-direction: row-reverse !important;
}

:global(.custom-action-sheet .action-sheet-icon) {
  margin: 0;
}

:global(ion-grid), :global(ion-row), :global(ion-col) {
  padding: 0;
}

@media (min-height: 700px) {
  .competition-row {
    height: calc(100vh - 125px);
  }
}
</style>
