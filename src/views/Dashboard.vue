// src/views/DashboardView.vue
<template>
  <ion-page>
    <ion-content>
      <div class="p-4">
        <!-- Welcome Section -->
        <div class="mt-12">
          <h1 class="text-2xl font-bold mb-2">Welcome{{user ? ', ' + user?.firstName : ''}}!</h1>
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
          <h2 class="text-xl font-semibold mb-4">Top Meal Right Now</h2>
          <div v-if="loadingTopMeal" class="flex justify-center">
            <ion-spinner></ion-spinner>
          </div>
          <ion-card v-else-if="topMeal" class="top-meal-card">
            <img :src="topMeal.imageUrl" :alt="topMeal.name" class="w-full h-48 object-cover">
            <ion-card-content>
              <h3 class="text-lg font-semibold mb-2">{{ topMeal.name }}</h3>
              <div class="flex items-center mb-2">
                <ion-icon :icon="starOutline" class="text-yellow-400 mr-1"></ion-icon>
                <span>{{ topMeal.rating }} ({{ topMeal.ratingCount }} ratings)</span>
              </div>
              <p class="text-sm text-gray-400">{{ topMeal.description }}</p>
            </ion-card-content>
          </ion-card>
          <div v-else class="text-center text-gray-400">
            No top meal data available
          </div>
        </div>

        <!-- Recent Activity or Stats -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Your Stats</h2>
          <ion-card>
            <ion-card-content>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <p class="text-2xl font-bold">{{ userStats.mealsChosen || 0 }}</p>
                  <p class="text-sm text-gray-400">Meals Chosen</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold">{{ userStats.restaurantsVisited || 0 }}</p>
                  <p class="text-sm text-gray-400">Restaurants Visited</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUser, useAuth } from '@clerk/vue';
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
const topMeal = ref<any>(null);
const userStats = ref({
  mealsChosen: 0,
  restaurantsVisited: 0
});

// Fetch top meal data
const fetchTopMeal = async () => {
  try {
    loadingTopMeal.value = true;
    // Replace with your actual API call
    // const response = await api.get('/top-meal');
    // topMeal.value = response.data;
    
    // Mockup data for now
    topMeal.value = {
      name: "Spicy Thai Curry",
      imageUrl: "https://via.placeholder.com/400x300",
      rating: 4.8,
      ratingCount: 245,
      description: "A delicious Thai curry with coconut milk and fresh vegetables"
    };
  } catch (error) {
    console.error('Error fetching top meal:', error);
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
