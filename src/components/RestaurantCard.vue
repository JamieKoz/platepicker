# RestaurantCard.vue
<template>
  <div v-if="restaurantData" class="ion-activatable ripple-parent rectangle meal-card" @click="$emit('chooseRestaurant', restaurantData)">
    <ion-card class="card-content my-2 mx-2">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="meal-image-container">
        <ion-img :src="getPhotoUrl(restaurantData.photos?.[0]?.photo_reference)" 
                :alt="restaurantData.name"
                class="meal-image"
                onerror="this.src='/placeholder-restaurant.jpg'">
        </ion-img>
      </div>
      <ion-card-title class="card-title-section">
        <ion-card-subtitle class="text-white text-center">{{ restaurantData.name }}</ion-card-subtitle>
        <ion-card-content class="card-details">
          <div class="flex justify-between">
          <span class=""> {{ '⭐'.repeat(Math.min(Math.round(restaurantData.rating || 0), 5)) }}({{ restaurantData.user_ratings_total?.toLocaleString() || 0 }})</span>
              
            <span class="">
            </span>
            <p v-if="restaurantData.price_level" class="">
              {{ '$'.repeat(Math.min(restaurantData.price_level, 4)) }}
            </p>
          </div>
          <p class="mt-1 location-text text-xs">{{ restaurantData.vicinity }}</p>
        </ion-card-content>
      </ion-card-title>
    </ion-card>
  </div>
  <div v-else class="restaurant-card-placeholder">
    <div class="flex items-center justify-center h-full">
      <ion-spinner></ion-spinner>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';
import type { Restaurant } from '@/types/restaurant';

const props = defineProps<{
  restaurantData: Restaurant;
}>();

defineEmits<{
  (e: 'chooseRestaurant', restaurant: Restaurant): void;
}>();

function getPhotoUrl(photoReference?: string) {
  if (!photoReference) {
    return '/placeholder-restaurant.jpg';
  }
  return `https://maps.googleapis.com/maps/api/place/photo?height=500&maxwidth=800&photo_reference=${photoReference}&key=AIzaSyA0_KFXP-WfyEfVzAt7tmVwQ3zZnV09w4A`;
}
</script>

<style scoped>
.ripple-parent {
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 0.75rem;
}

.meal-card {
  width: 90vw;
  height: 40vh;
}

.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.meal-image-container {
  height: 70%;
  min-height: 70%;
  max-height: 70%;
  overflow: hidden;
  position: relative;
}

.meal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.card-title-section {
  height: 30%;
  min-height: 30%;
  max-height: 30%;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-details {
  padding: 0.5rem;
  overflow-y: auto;
}

.restaurant-card-placeholder {
  width: 90vw;
  height: 40vh;
  border: 1px solid #ddd;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.location-text {
  font-size: 0.75rem;
}
</style>
