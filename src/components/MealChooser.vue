<template>
  <ion-header class="text-center"> {{ mealStore.mealCounter }}</ion-header>
  <ion-grid class="flex items-center justify-center">
    <ion-row v-if="!winner" class="flex justify-between items-center meal-row">
      <ion-col class="flex justify-center items-center flex-1">
        <MealCard :mealData="meal1" @replaceMeal="replaceMeal"/>
      </ion-col>
      <ion-col class="flex justify-center items-center flex-1">
        <MealCard :mealData="meal2" @replaceMeal="replaceMeal"/>
      </ion-col>
    </ion-row>

    <ion-row v-else class="flex flex-col justify-center winner-row">
      <ion-col>
        <h2 class="text-center text-2xl font-bold">{{ winner.title }}</h2>
        
      <div class="meal-image">
        <ion-img :src="`http://127.0.0.1:8000/storage/food-images/${winner.image_name}.jpg`" class="h-full w-full object-fit"></ion-img>
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
import { ref, onMounted } from 'vue';
import MealCard from '@/components/MealCard.vue';
import { IonCol, IonGrid, IonRow, IonImg } from '@ionic/vue';
import { useMealStore } from '@/store/useMealStore';

const mealStore = useMealStore();
let meal1 = ref(null);
let meal2 = ref(null);
const winner = ref(null); // Track the winning meal

// Fetch initial meals on mount
onMounted(async () => {
  await mealStore.fetchMeals();
  meal1.value = mealStore.getNewMeal();
  meal2.value = mealStore.getNewMeal();
});

// Replace meal handler
const replaceMeal = (clickedMeal) => {
  if (mealStore.mealCounter === 0) {
    winner.value = clickedMeal; // The last clicked meal is the winner
    meal1.value = null;
    meal2.value = null;
  } else {
    // Replace only the other meal, not the one that was clicked
    if (clickedMeal === meal1.value) {
      meal2.value = mealStore.getNewMeal(); // Replace the other meal
    } else if (clickedMeal === meal2.value) {
      meal1.value = mealStore.getNewMeal(); // Replace the other meal
      
    }
  }
};
</script>

<style scoped>
  /* Ensure the meal cards are responsive */
  .meal-row {
    width: 100vw; /* Full width of the viewport */
    height: 50vh; /* Cards take 50% of the viewport height */
  }

  /* Force each card to take 45% of the screen width and adjust height */
  .meal-card {
    width: 90vw;
    height: 40vh;
  }

  .winner-row {
    width: 100vw;
    height: 80vh; /* Winner section takes up 80% of the viewport height */
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
</style>
