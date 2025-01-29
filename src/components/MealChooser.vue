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

  <ion-content v-else class="ion-padding">
    <ion-grid class="h-full">
      <!-- Competition View -->
      <ion-row v-if="!winner" class="h-full flex justify-between items-center meal-row">
        <ion-col class="flex justify-center items-center">
          <MealCard :mealData="meal1" @replaceMeal="replaceMeal" />
        </ion-col>
        <ion-col class="flex justify-center items-center">
          <MealCard :mealData="meal2" @replaceMeal="replaceMeal" />
        </ion-col>
      </ion-row>

      <!-- Winner View -->
      <ion-row v-else class="h-full flex justify-center items-start">
        <ion-col class="flex flex-col items-center">
          <div class="w-full flex justify-between items-center mb-4">
            <div class="flex-1"></div> <!-- Empty div for spacing -->
            <h2 class="text-2xl font-bold flex-1 text-center">Winner!</h2>
            <div class="flex-1 flex justify-end">
              <ion-button fill="clear" @click="handleShare">
                <ion-icon :icon="share" class="text-white" />
              </ion-button>
            </div>
          </div>
          <div class="winner-container">
            <MealCard :mealData="winner" class="winner-card" />
          </div>


          <div class="mt-4 mb-16">
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
  </ion-content>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/api/axios';
import { refresh, share, clipboardOutline, mailOutline, chatbubbleOutline, closeOutline, shareSocialOutline } from 'ionicons/icons';
import { useMealStore } from '@/store/useMealStore';
import MealCard from '@/components/MealCard.vue';
import RetryConnection from '@/components/RetryConnection.vue';
import { IonCol, IonGrid, IonRow, IonImg, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, toastController, actionSheetController, IonActionSheet } from '@ionic/vue';
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

      if (clickedMeal.recipe_id != null) {
        await trackMealSelection(clickedMeal.recipe_id);
      }

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
          const shareText = `${winner.value?.title}`;
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
.meal-row {
  /* Cards take 50% of the viewport height */
  height: 50vh;
}

.winner-meal {
  width: 100vw;
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

.ingredients-section {
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
  overflow-y: auto;
}

.instructions-text {
  line-height: 1.6;
  white-space: pre-wrap;
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
</style>
