<template>
  <div v-if="mealData" class="ion-activatable relative overflow-hidden border-solid border-2 border-gray-500 rounded-xl flex flex-col meal-card" @click="chooseMeal(mealData)">
    <ion-card class="flex flex-col justify-between h-full my-2 mx-2">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="meal-image flex flex-1 items-center justify-center">
        <ion-img :src="`https://dy9kit23m04xx.cloudfront.net/food-images/${mealData.image_name}.jpg`" class="h-full w-full object-cover"></ion-img>
      </div>
      <ion-card-title class="py-4 overflow-hidden font-bold p-2 text-lg break-word white-space">
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
  .meal-card {
    width: 90vw;
    height: 40vh;
  }

  .meal-image {
    height: 70%;
  }

</style>
