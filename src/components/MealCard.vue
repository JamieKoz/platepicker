<template>
  <div v-if="mealData" class="ion-activatable ripple-parent rectangle meal-card" @click="chooseMeal(mealData)">
    <ion-card class="card-content my-2 mx-2">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="meal-image">
        <ion-img :src="`https://dy9kit23m04xx.cloudfront.net/food-images/${mealData.image_name}.jpg`" class="h-full w-full object-cover"></ion-img>
      </div>
      <ion-card-title class="py-4">
        <ion-card-subtitle class="text-white text-center">{{ mealData.title }}</ion-card-subtitle>
      </ion-card-title>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { IonCard, IonCardTitle, IonRippleEffect, IonImg, IonCardSubtitle } from '@ionic/vue';
import type { Meal } from '@/types/meal';

defineProps<{
  mealData: Meal | null
}>();

const emit = defineEmits<{
  (e: 'replaceMeal', meal: Meal): void
}>();

const chooseMeal = (meal: Meal) => {
  emit('replaceMeal', meal);
};
</script>

<style scoped>
  .ripple-parent {
    position: relative;
    overflow: hidden;
    border: 1px solid #ddd;
    border-radius: .75rem;
  }

  .meal-card {
    display: flex;
    flex-direction: column;
    width: 90vw;
    height: 40vh;
  }

  .meal-image {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 70%;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .ion-card-header {
    flex: 0 1 auto;
    padding: 10px;
    text-align: center;
  }

  .ion-card-title {
    font-size: 1.2rem;
    font-weight: bold;
    padding: 5px;
    white-space: normal;
    word-wrap: break-word;
    overflow: hidden;
  }
</style>
