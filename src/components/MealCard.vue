<template>
  <div v-if="mealData"
    class="ion-activatable relative overflow-hidden border-solid border-2 border-gray-500 rounded-xl flex flex-col w-[90vw] h-[43vh]"
    @click="chooseMeal(mealData)">
    <ion-card class="flex flex-col justify-between h-full my-1 mx-2">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="h-[70%] flex flex-1 items-center justify-center">
        <ion-img :src="`https://dy9kit23m04xx.cloudfront.net/food-images/${mealData.image_name}.jpg`"
          class="h-full w-full object-cover object-center max-h-[210px] min-h-[210px]"></ion-img>
      </div>
      <ion-card-title class="py-3 overflow-hidden font-bold p-2 text-lg break-word white-space">
        <ion-card-subtitle class="text-white text-center">{{ mealData.title }}</ion-card-subtitle>
        <ion-card-content class="p-2 overflow-y-auto">
          <div class="flex flex-col">
            <div class="flex justify-between w-full">
              <span class="text-xs inline-flex items-center bg-blue-400 rounded-lg p-1">
                <ion-icon :icon="alarmSharp" class="mr-1 text-white" style="font-size: 12px;"></ion-icon>
                  {{ mealData.cooking_time ? `Under ${mealData.cooking_time} minutes` : 'N/A' }}
              </span>
              <span class="text-xs inline-flex items-center bg-purple-900 rounded-lg p-1">
                <ion-icon :icon="restaurantSharp" class="mr-1 text-white" style="font-size: 12px;"></ion-icon>
                Serves {{ mealData.serves ?? '2+' }}
              </span>
            </div>
            <div class="mt-1">
              <span class="text-xs inline-flex items-center bg-green-500 rounded-lg p-1">
                <ion-icon :icon="leafSharp" class="mr-1 text-white" style="font-size: 12px;"></ion-icon>
                  {{ formatDietary(mealData.dietary) }}
              </span>
            </div>
          </div>
        </ion-card-content>
      </ion-card-title>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { IonCard, IonCardTitle, IonRippleEffect, IonImg, IonCardSubtitle, IonCardContent, IonIcon } from '@ionic/vue';
import { alarmSharp, leafSharp, restaurantSharp } from 'ionicons/icons';
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

const formatDietary = (dietary: string | string[] | null | undefined): string => {
  if (!dietary) return 'N/A';
  
  const dietaryArray = Array.isArray(dietary) ? dietary : dietary.split(',');
  return dietaryArray
    .map(item => item.trim().charAt(0).toUpperCase() + item.trim().slice(1))
    .join(' | ');
};
</script>
