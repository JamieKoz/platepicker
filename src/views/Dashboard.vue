// src/views/DashboardView.vue
<template>
  <ion-page>
    <ion-content>
      <div class="p-4">
        <!-- Welcome Section -->
        <div class="mt-12">
          <h1 class="text-2xl font-bold mb-2">Welcome{{user ? ' back, ' + user?.username : ''}}!</h1>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
          <div v-if="!user">
            <ion-card class="min-height-[120px] border-solid border-1 border-purple-500"
            @click="user ? navigateTo('/list') : navigateTo('sign-in')">
            <ion-card-content class="flex flex-col items-center justify-center p-4">
              <ion-icon :icon="user ? listOutline : personOutline" class="text-4xl mb-2 text-purple-500"></ion-icon>
              <h2 class="text-lg font-semibold text-purple-500">{{ user ? 'Configure your meal list' : 'Sign In for more features' }}</h2>
            </ion-card-content>
          </ion-card>
          </div>

          <div v-else class="grid grid-cols-2 gap-4">
            <ion-card class="min-height-[120px] border-solid border-1 border-yellow-500"
              @click="router.push('/buy-or-cook')">
              <ion-card-content class="flex flex-col items-center justify-center p-4">
                <ion-icon :icon="restaurantOutline" class="text-4xl mb-2 text-yellow-500"></ion-icon>
                <h2 class="text-lg font-semibold text-yellow-500">Find Food</h2>
              </ion-card-content>
            </ion-card>

            <ion-card class="min-height-[120px] border-solid border-1 border-blue-500"
              @click="user ? router.push('/profile') : router.push('/sign-in')">
              <ion-card-content class="flex flex-col items-center justify-center p-4">
                <ion-icon :icon="personOutline" class="text-4xl mb-2 text-blue-500"></ion-icon>
                <h2 class="text-lg font-semibold text-blue-500">{{user ? 'Profile' : 'Sign In'}}</h2>
              </ion-card-content>
            </ion-card>
          </div>
        </div>

        <!-- Top Meal Section -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Top Meals right now</h2>
          <div v-if="loadingTopMeal" class="flex justify-center">
            <ion-spinner></ion-spinner>
          </div>

          <div v-else-if="!topMeals || topMeals.length === 0" class="text-center text-gray-400">
            No top meals data available
          </div>

          <div v-else class="space-y-4">
            <div v-for="(topMeal, index) in topMeals" :key="index">
              <div class="border-2 border-yellow-500 rounded-lg">
                <ion-card v-if="isMealValid(topMeal)" class="overflow-hidden mx-2 my-2" @click="router.push(`/user-meals/${topMeal.meal.id}`)">
                  <img :src="`https://dy9kit23m04xx.cloudfront.net/food-images/${topMeal.meal.image_name}.jpg`"
                    :alt="topMeal.meal.title" class="w-full h-48 object-cover">
                  <ion-card-content>
                    <div class="flex justify-between items-center mb-2">
                      <h3 class="text-lg text-white font-semibold">{{ topMeal.meal.title }}</h3>
                      <div class="text-sm text-gray-400">
                        {{ topMeal.total_tally }} picks
                      </div>
                    </div>
                    <button class="text-sm text-blue-500 mt-1">See recipe</button>
                  </ion-card-content>
                </ion-card>
              </div>
              
            </div>
          </div>
        </div>

        
        <div v-if="user">
        <h2 class="text-xl font-semibold mb-4">We'd love your feedback!</h2>
        <ion-card class="min-height-[120px] border-solid border-1 border-green-500" @click="navigateTo('/feedback')">
          <ion-card-content class="flex flex-col items-center justify-center p-4">
            <ion-icon :icon="thumbsUpOutline" class="text-4xl mb-2 text-green-500"></ion-icon>
            <h2 class="text-lg font-semibold text-green-500">Leave a review</h2>
          </ion-card-content>
        </ion-card>
          </div>

        
        <div v-if="user" class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Explore Meals</h2>
          <ion-card class="min-height-[120px] border-solid border-1 border-purple-500"
            @click="navigateTo('/list')">
            <ion-card-content class="flex flex-col items-center justify-center p-4">
              <ion-icon :icon="listOutline" class="text-4xl mb-2 text-purple-500"></ion-icon>
              <h2 class="text-lg font-semibold text-purple-500">{{ 'Configure your meal list' }}</h2>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axios';
import { useUser } from '@clerk/vue';

import { IonPage, IonContent, IonCard, IonCardContent, IonIcon, IonSpinner } from '@ionic/vue';
import {
  restaurantOutline,
  personOutline,
  listOutline,
  thumbsUpOutline,
} from 'ionicons/icons';

interface TopMeal {
  total_tally: number;
  meal: {
  id: number;
  title: string;
  image_name: string;
  instructions: string;
  }
};
const { user } = useUser();
const router = useRouter();
const loadingTopMeal = ref(true);
const topMeals = ref<TopMeal[]>([]);
// const expandedMeals = reactive<Record<number, boolean>>({});

function isMealValid(topMeal: TopMeal) {
  return topMeal && 
         topMeal.meal && 
         topMeal.meal.id && 
         topMeal.meal.title && 
         topMeal.meal.image_name;
}
const fetchTopMeal = async () => {
  try {
    loadingTopMeal.value = true;
    const response = await api.get('/user-meals/top-meals');
    
    topMeals.value = Array.isArray(response.data) ? response.data : [];
    
    console.log(`Fetched ${topMeals.value.length} meals`);
    
    const validCount = topMeals.value.filter(meal => isMealValid(meal)).length;
    console.log(`${validCount} valid meals found`);
    
  } catch (error) {
    console.error('Error fetching top meals:', error);
    topMeals.value = []; // Reset to empty array on error
  } finally {
    loadingTopMeal.value = false;
  }
};

const navigateTo = async (path: string) => {
  try {
    await router.push(path);
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

onMounted(() => {
  fetchTopMeal();
});

</script>

<style scoped></style>
