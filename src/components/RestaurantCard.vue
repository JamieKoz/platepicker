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
          <template v-if="restaurantData.photos && restaurantData.photos.length > 0">
            <vue-swiper-slide v-for="(photo, index) in restaurantData.photos" :key="index">
              <img :src="getPhotoUrl(photo.photo_reference)" :alt="`${restaurantData.name} photo ${index + 1}`"
                class="meal-image" @error="handleImageError" />
            </vue-swiper-slide>
          </template>
          <template v-else>
            <vue-swiper-slide>
              <img :src="placeholderImage" :alt="restaurantData.name" class="meal-image" />
            </vue-swiper-slide>
          </template>
        </vue-swiper>
        
        <!-- Only show navigation if we have multiple photos -->
        <div class="navigation-buttons" v-if="restaurantData.photos && restaurantData.photos.length > 1">
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
          <p class="mt-1 location-text">{{ restaurantData.vicinity }}</p>
        </ion-card-content>
      </ion-card-title>
    </ion-card>
  </div>

  <div v-else class="restaurant-card-placeholder">
  <ion-card class="card-content my-2 mx-2 skeleton-loader">
    <div class="skeleton-image-container">
      <div class="skeleton-image" />
    </div>
    
    <div class="card-title-section">
      <div class="">
        <div class="skeleton-title"></div>
        <div class="flex justify-between mt-4">
          <div class="skeleton-subtitle" style="width: 40%"></div>
          <div class="skeleton-subtitle" style="width: 20%"></div>
        </div>
        <div class="skeleton-details mt-2"></div>
      </div>
    </div>
  </ion-card>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonSpinner, IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon } from '@ionic/vue';
import type { Restaurant } from '@/types/restaurant';
import { Swiper as VueSwiper, SwiperSlide as VueSwiperSlide } from 'swiper/vue';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import placeholderImage from '@/assets/meal-placeholder.png';

const swiper = ref(null);
const swiperModules = [Pagination];
const props = defineProps<{
  restaurantData: Restaurant;
}>();

const emit = defineEmits<{
  (e: 'chooseRestaurant', restaurant: Restaurant): void;
}>();

const handleCardClick = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.nav-button')) {
    emit('chooseRestaurant', props.restaurantData);
  }
};
function setSwiper(swiperInstance: any) {
  swiper.value = swiperInstance;
}

function getPhotoUrl(photoReference?: string) {
  if (!photoReference) {
    return placeholderImage;
  }
  return `https://maps.googleapis.com/maps/api/place/photo?height=500&maxwidth=800&photo_reference=${photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&t=${Date.now()}`;
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = placeholderImage;
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
  height: 95%;
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
  font-size: 0.5rem;
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

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-loader {
  background: #2a2a2a;
  border-radius: 0.75rem;
  overflow: hidden;
  height: 95%;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 4s infinite linear;
}

.skeleton-image-container {
  height: 40vh;
  width: 90vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-title {
  height: 24px;
  margin: 0 auto;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 4px;
}

.skeleton-subtitle {
  height: 16px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  animation: shimmer 15s infinite linear;
  border-radius: 4px;
}

.skeleton-details {
  height: 16px;
  width: 60%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  animation: shimmer 10s infinite linear;
  border-radius: 4px;
}
</style>
