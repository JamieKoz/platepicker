<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <Back-Arrow />
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-6">Your Top Meals</h1>

        <div v-if="loading" class="flex justify-center items-center h-48">
          <ion-spinner></ion-spinner>
        </div>

        <div v-else-if="error" class="text-center p-4">
          <ion-text color="danger">{{ error }}</ion-text>
          <ion-button @click="fetchfavourites" class="mt-4">
            Try Again
          </ion-button>
        </div>

        <div v-else-if="favourites.length === 0" class="text-center p-4">
          <ion-text color="medium">
            No favourites yet! Start picking your meals to see your top choices here.
          </ion-text>
        </div>

        <div v-else class="space-y-6">
          <div v-for="(favourite, index) in favourites" :key="favourite.id"
            class="border border-white rounded-lg shadow-md overflow-hidden">
            <div class="relative">
              <!-- Medal for top 3 -->
              <div class="absolute top-2 left-2 z-10">
                <ion-badge :color="getMedalColor(index)" class="text-lg px-4 py-2">
                  #{{ index + 1 }}
                </ion-badge>
              </div>

              <ion-img :src="`https://dy9kit23m04xx.cloudfront.net/food-images/${favourite.meal.image_name}.jpg`"
                class="w-full h-48 object-cover"></ion-img>
            </div>

            <ion-card-title class="p-4 bg-gray-900 ">
              <h2 class="text-xl text-white font-semibold mb-2">{{ favourite.meal.title }}</h2>
              <div class="flex justify-between items-center text-sm opacity-60">
                <ion-card-subtitle class="opacity-60">
                  Selected {{ favourite.tally }} times
                </ion-card-subtitle>
              </div>
            </ion-card-title>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  onIonViewWillEnter,
  IonPage, 
  IonContent, 
  IonImg, 
  IonBadge, 
  IonSpinner, 
  IonText,
  IonButton,
  IonCardTitle,
  IonCardSubtitle
} from '@ionic/vue';
import api from '@/api/axios';
import type { Favourite } from '@/types/favourite';
import BackArrow from '@/components/navigation/BackArrow.vue';

const favourites = ref<Favourite[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const getMedalColor = (index: number): string => {
  const colors = ['warning', 'medium', 'tertiary']; // gold, silver, bronze
  return colors[index];
};

const fetchfavourites = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.get('/user-meals/favourites');
    favourites.value = response.data;
  } catch (err) {
    error.value = 'Unable to load your favourites. Please try again.';
    console.error('Error fetching favourites:', err);
  } finally {
    loading.value = false;
  }
};
onIonViewWillEnter(() => {
  fetchfavourites();
});
</script>

<style scoped></style>
