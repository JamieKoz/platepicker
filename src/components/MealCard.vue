<template>
  <div v-if="mealData"
    class="relative overflow-hidden border-solid border-2 border-yellow-500 rounded-xl flex flex-col h-full"
    @click="chooseMeal(mealData)">
    <ion-card class="flex flex-col justify-between h-full my-2 mx-2">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="flex flex-1 items-center justify-center min-h-[65%] max-h-[65%]">
        <ion-img :src="mealData.image_url"
          class="h-full w-full object-cover object-center aspect-4/3"></ion-img>
      </div>
      <ion-card-title class="py-2 overflow-hidden font-bold p-2 text-lg break-word white-space">
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
  <div v-else class="relative overflow-hidden border-solid border-2 border-gray-500 rounded-xl flex flex-col h-full justify-center items-center">
    <p class="text-gray-400">No meal data available</p>
  </div>
</template>

<script setup lang="ts">
import { IonCard, IonCardTitle, IonRippleEffect, IonImg, IonCardSubtitle, IonCardContent, IonIcon } from '@ionic/vue';
import { alarmSharp, leafSharp, restaurantSharp } from 'ionicons/icons';
import type { Meal } from '@/types/meal';
import type { Recipe } from '@/types/recipe';
import type { Dietary } from '@/types/dietary';

defineProps<{
  mealData: Meal | Recipe | null
}>();

const emit = defineEmits<{
  (e: 'replaceMeal', meal: Meal): void
}>();

const isMeal = (data: Meal | Recipe): data is Meal => {
  // Add logic to determine if it's a Meal
  // This depends on what properties distinguish a Meal from a Recipe
  // For example, if Meal has a specific property that Recipe doesn't:
  return 'mealSpecificProperty' in data;
};

const chooseMeal = (data: Meal | Recipe | null) => {
 if (!data) return;

 if (isMeal(data)) {
    emit('replaceMeal', data);
  } else {
    const mealFromRecipe: Meal = {
      id: data.id,
      title: data.title,
      image_name: data.image_name,
      instructions: data.instructions,
    } as Meal;
    
    emit('replaceMeal', mealFromRecipe);
  }
};

const formatDietary = (dietary: string | string[] | Dietary[] | null | undefined): string => {
  if (!dietary) return 'N/A';
  
  // Case 1: It's an array of Dietary objects (new relational format)
  if (Array.isArray(dietary) && dietary.length > 0 && typeof dietary[0] === 'object') {
    return (dietary as Dietary[])
      .map(item => item.name)
      .join(' | ');
  }
  
  // Case 2: It's a string (old format)
  if (typeof dietary === 'string') {
    const dietaryArray = dietary.split(',');
    return dietaryArray
      .map(item => item.trim().charAt(0).toUpperCase() + item.trim().slice(1))
      .join(' | ');
  }
  
  // Case 3: It's already an array of strings
  return (dietary as string[])
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' | ');
};
</script>
