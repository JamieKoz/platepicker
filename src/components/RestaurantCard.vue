# RestaurantCard.vue
<template>
 <div v-if="restaurantData" class="ion-activatable ripple-parent rectangle meal-card"
    @click="handleCardClick">
    <ion-card class="card-content my-2 mx-2">
      <div class="meal-image-container">
        <vue-swiper 
          :modules="swiperModules" 
          :navigation="true"
          :slides-per-view="1" 
          :space-between="0"
          @swiper="setSwiper"
        >
          <vue-swiper-slide v-for="(photo, index) in restaurantData.photos" :key="index">
            <img :src="getPhotoUrl(photo.photo_reference)" :alt="`${restaurantData.name} photo ${index + 1}`"
              class="meal-image" @error="handleImageError" />
          </vue-swiper-slide>
        </vue-swiper>
        <!-- Add navigation button overlays -->
        <div class="navigation-buttons">
          <button class="nav-button prev" @click.stop="navigatePrev">
            <ion-icon :icon="chevronBack"></ion-icon>
          </button>
          <button class="nav-button next" @click.stop="navigateNext">
            <ion-icon :icon="chevronForward"></ion-icon>
          </button>
        </div>
      </div>
      <ion-card-title class="card-title-section">
        <ion-card-subtitle class="text-white text-center">{{ restaurantData.name }}</ion-card-subtitle>
        <ion-card-content class="card-details">
          <div class="flex justify-between">
            <span>
              <span class="filled-rating">{{ '★'.repeat(Math.min(Math.round(restaurantData.rating || 0), 5)) }}</span>
              <span class="empty-rating">{{ '★'.repeat(5 - Math.min(Math.round(restaurantData.rating || 0), 5))
                }}</span>
              <span class="ml-1 text-xs">({{ restaurantData.user_ratings_total?.toLocaleString() || 0 }})</span>
            </span>

            <span class="">
            </span>
            <p v-if="restaurantData.price_level" class="">
              <span class="filled-rating">{{ '$'.repeat(Math.min(Math.round(restaurantData.price_level || 0), 4))
                }}</span>
              <span class="empty-rating">{{ '$'.repeat(4 - Math.min(Math.round(restaurantData.price_level || 0), 4))
                }}</span>
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
import { ref } from 'vue';
import { IonSpinner, IonCard, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/vue';
import type { Restaurant } from '@/types/restaurant';
import { Swiper as VueSwiper, SwiperSlide as VueSwiperSlide } from 'swiper/vue';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const swiper = ref(null);
const swiperModules = [Pagination];
const props = defineProps<{
  restaurantData: Restaurant;
}>();

const emit = defineEmits<{
  (e: 'chooseRestaurant', restaurant: Restaurant): void;
}>();

const handleCardClick = (event: MouseEvent) => {
  // Check if click was on navigation buttons
  if (!(event.target as HTMLElement).closest('.nav-button')) {
    emit('chooseRestaurant', props.restaurantData);
  }
};
function setSwiper(swiperInstance: any) {
  swiper.value = swiperInstance;
}

function getPhotoUrl(photoReference?: string) {
  if (!photoReference) {
    return '/placeholder-restaurant.jpg';
  }
  return `https://maps.googleapis.com/maps/api/place/photo?height=500&maxwidth=800&photo_reference=${photoReference}&key=AIzaSyA0_KFXP-WfyEfVzAt7tmVwQ3zZnV09w4A&t=${Date.now()}`;

}

const navigatePrev = () => {
  if (swiper.value) {
    swiper.value.slidePrev();
  }
};

const navigateNext = () => {
  if (swiper.value) {
    swiper.value.slideNext();
  }
};
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-restaurant.jpg';
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

.filled-rating {
  color: gold;
}

.empty-rating {
  color: #666;
}

:deep(.swiper) {
  width: 100%;
  height: 100%;
}

:deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.7;
}

:deep(.swiper-pagination-bullet-active) {
  background: white;
  opacity: 1;
}


.meal-image-container :deep(.swiper-slide) {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navigation-buttons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; /* Allow clicks to pass through to the card */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.nav-button {
  pointer-events: auto; /* Make buttons clickable */
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 10;
}

.nav-button:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* Remove Swiper's default buttons */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  display: none;
}
</style>
