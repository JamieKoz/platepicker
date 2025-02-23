// src/views/DashboardView.vue
<template>
  <ion-page>
    <ion-content>
      <div class="p-4">
        <!-- Welcome Section -->
        <div class="mt-12">
          <h1 class="text-2xl font-bold mb-2">Welcome{{user ? ' back, ' + user?.firstName : ''}}!</h1>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
          <div class="grid grid-cols-2 gap-4">
            <ion-card class="action-card" @click="router.push('/buy-or-cook')">
              <ion-card-content class="flex flex-col items-center justify-center p-4">
                <ion-icon :icon="restaurantOutline" class="text-4xl mb-2"></ion-icon>
                <h2 class="text-lg font-semibold">Find Food</h2>
              </ion-card-content>
            </ion-card>

            <ion-card class="action-card" @click="router.push('/profile')">
              <ion-card-content class="flex flex-col items-center justify-center p-4">
                <ion-icon :icon="personOutline" class="text-4xl mb-2"></ion-icon>
                <h2 class="text-lg font-semibold">Profile</h2>
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
          <div v-else-if="topMeals.length > 0" class="space-y-4">
            <ion-card v-for="(topMeal, index) in topMeals" :key="topMeal.meal.id" class="top-meal-card">
              <img :src="`https://dy9kit23m04xx.cloudfront.net/food-images/${topMeal.meal.image_name}.jpg`"
                :alt="topMeal.meal.title" class="w-full h-48 object-cover">
              <ion-card-content>
                <div class="flex justify-between items-center mb-2">
                  <h3 class="text-lg text-white font-semibold">{{ topMeal.meal.title }}</h3>
                  <div class="text-sm text-gray-400">
                    {{ topMeal.total_tally }} picks
                  </div>
                </div>
                <p class="text-sm text-gray-400 line-clamp-2">{{ topMeal.meal.instructions }}</p>
              </ion-card-content>
            </ion-card>
          </div>
          <div v-else class="text-center text-gray-400">
            No top meals data available
          </div>
        </div>

        <!-- Recent Activity or Stats -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Explore Meals</h2>
          <!-- <ion-card> -->
          <!--<ion-card-content> -->
          <ion-button @click="navigateTo('/list')">Check out the meal list
            <ion-icon :icon="arrowForward" class="ml-2" />
          </ion-button>
          <!-- </ion-card-content> -->
          <!-- </ion-card> -->
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axios';
import { useUser, useAuth } from '@clerk/vue';

import { arrowForward } from 'ionicons/icons';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner
} from '@ionic/vue';
import {
  restaurantOutline,
  personOutline,
  starOutline
} from 'ionicons/icons';
const { user } = useUser();

const router = useRouter();
const loadingTopMeal = ref(true);
const userStats = ref({
  mealsChosen: 0,
  restaurantsVisited: 0
});

interface TopMeal {
  total_tally: number;
  meal: {
  id: number;
  title: string;
  image_name: string;
  instructions: string;
  }
};
// Fetch top meal data
const topMeals = ref<TopMeal[]>([]);

const fetchTopMeal = async () => {
  try {
    loadingTopMeal.value = true;
    const response = await api.get('user-meals/top-meals');
    topMeals.value = response.data;
  } catch (error) {
    console.error('Error fetching top meals:', error);
  } finally {
    loadingTopMeal.value = false;
  }
};

// Fetch user stats
const fetchUserStats = async () => {
  try {
    // Replace with your actual API call
    // const response = await api.get('/user-stats');
    // userStats.value = response.data;
    
    // Mockup data for now
    userStats.value = {
      mealsChosen: 15,
      restaurantsVisited: 8
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
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
  fetchUserStats();
});
</script>

<style scoped>
.action-card {
  min-height: 120px;
}

.top-meal-card {
  overflow: hidden;
}
</style>
