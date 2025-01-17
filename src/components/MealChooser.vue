<template>
  <ion-header class="ion-no-border">
      <ion-toolbar class="transparent-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon :icon="arrowBack" />
          </ion-button>
        </ion-buttons>
        <ion-title class="text-center">{{ mealStore.mealCounter }}</ion-title>
        <ion-buttons slot="end" v-if="showRefreshButton">
          <ion-button @click="handleRefresh">
            <ion-icon :icon="refresh" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  <ion-grid class="flex items-center justify-center">
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
        <h2 class="text-center text-2xl font-bold">{{ winner.title }}</h2>

        <div class="meal-image">
          <ion-img :src="`https://dy9kit23m04xx.cloudfront.net/food-images/${winner.image_name}.jpg`"
            class="h-full w-full object-fit"></ion-img>
        </div>
        <ion-content class="ion-padding overflow-auto">
          {{ winner.cleaned_ingredients }}>
          <p>{{ winner.instructions }}</p>

        </ion-content>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import MealCard from '@/components/MealCard.vue';
import { IonCol, IonGrid, IonRow, IonImg, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { arrowBack, refresh } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useMealStore } from '@/store/useMealStore';
import type { Meal } from '@/types/meal';

const router = useRouter();
const mealStore = useMealStore();
let meal1 = ref<Meal | null>(null);
let meal2 = ref<Meal | null>(null);
const winner = ref<Meal | null>(null);

// Fetch initial meals on mount
onMounted(async () => {
  await mealStore.fetchMeals();
  const newMeal1 = mealStore.getNewMeal();
  const newMeal2 = mealStore.getNewMeal();
  if(newMeal1) meal1.value = newMeal1;
  if(newMeal2) meal2.value = newMeal2;
});

// Replace meal handler
const replaceMeal = (clickedMeal: Meal) => {
if (mealStore.mealCounter === 0) {
    winner.value = clickedMeal;
    meal1.value = null;
    meal2.value = null;
  } else {
    const newMeal = mealStore.getNewMeal();
    if (!newMeal) return;

    if (clickedMeal.id === meal1.value?.id) {
      meal2.value = newMeal;
    } else if (clickedMeal.id === meal2.value?.id) {
      meal1.value = newMeal;
    }
  }
};
const showRefreshButton = computed(() => {
  return mealStore.mealCounter === 0 && winner.value !== null;
});

const goBack = () => {
  router.push('/home');
};

const handleRefresh = async () => {
  winner.value = null;
  await mealStore.fetchMeals();
  const newMeal1 = mealStore.getNewMeal();
  const newMeal2 = mealStore.getNewMeal();
  if(newMeal1) meal1.value = newMeal1;
  if(newMeal2) meal2.value = newMeal2;
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
</style>
