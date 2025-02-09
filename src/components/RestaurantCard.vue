# RestaurantCard.vue
<template>
  <div v-if="restaurantData" class="ion-activatable ripple-parent rectangle meal-card" @click="$emit('chooseRestaurant', restaurantData)">
    <ion-card class="card-content my-2 mx-2">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="meal-image">
        <ion-img :src="getPhotoUrl(restaurantData.photos?.[0]?.photo_reference)" :alt="restaurantData.name"
          class="w-full h-full object-cover rounded-t-lg" onerror="this.src='/placeholder-restaurant.jpg'"></ion-img>
      </div>
      <ion-card-title class="py-4">
        <ion-card-subtitle class="text-white text-center">{{ restaurantData.name }}</ion-card-subtitle>
        <ion-card-content>

        <span class="text-yellow-400">
          {{ '⭐'.repeat(Math.min(Math.round(restaurantData.rating || 0), 5)) }}
        </span>
        <span class="ml-2 text-xs">
          ({{ restaurantData.user_ratings_total?.toLocaleString() || 0 }})
        </span>
        <p class="text-xs">{{ restaurantData.vicinity }}</p>
        <p v-if="restaurantData.price_level" class="text-xs mt-1">
          {{ '💰'.repeat(Math.min(restaurantData.price_level, 4)) }}
        </p>
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
