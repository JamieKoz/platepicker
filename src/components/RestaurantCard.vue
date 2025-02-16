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
          <p class="mt-1 location-text">{{ restaurantData.vicinity }}</p>
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
  if (!(event.target as HTMLElement).closest('.nav-button')) {
    emit('chooseRestaurant', props.restaurantData);
  }
};
function setSwiper(swiperInstance: any) {
  swiper.value = swiperInstance;
}

function getPhotoUrl(photoReference?: string) {
  if (!photoReference) {
    return `<svg fill="#000000" version="1.1" width="800px" height="800px" viewBox="0 0 302.459 302.46" xml:space="preserve">
<g>
	<g>
		<path d="M163.816,222.91c38.745,0,70.269-31.514,70.269-70.259c0-38.745-31.523-70.274-70.269-70.274    c-38.743,0-70.264,31.524-70.264,70.274C93.552,191.396,125.068,222.91,163.816,222.91z"/>
		<path d="M163.816,241.771c49.226,0,89.118-39.903,89.118-89.119c0-49.228-39.893-89.123-89.118-89.123    c-49.221,0-89.119,39.895-89.119,89.123C74.697,201.867,114.595,241.771,163.816,241.771z M163.816,77.183    c41.608,0,75.469,33.862,75.469,75.469c0,41.609-33.86,75.464-75.469,75.464c-41.609,0-75.464-33.854-75.464-75.464    C88.352,111.045,122.207,77.183,163.816,77.183z"/>
		<path d="M302.459,250.062l-5.2-200.026c0-4.307-3.493-7.8-7.8-7.8c-1.152,0-2.234,0.264-3.214,0.718v-0.074    c0,0-0.203,0.13-0.493,0.328c-0.746,0.412-1.416,0.919-1.995,1.539c-5.708,4.685-23.907,23.78-25.431,49.592    c-2.311,39.372,16.813,55.317,23.328,69.921l-5.199,85.798c0,4.306,8.693,7.8,12.999,7.8    C293.766,257.862,302.459,254.369,302.459,250.062z"/>
		<path d="M13.614,128.206l13.461,6.724c1.534,0.769,3.225,1.33,4.992,1.747l-5.2,117.007c0,3.615,8.696,6.54,13,6.54    c4.306,0,13-2.925,13-6.54l-5.2-117.606c1.831-0.576,3.595-1.279,5.139-2.224l9.973-6.073c7.196-4.39,12.619-14.045,12.619-22.475    V52.88c0-4.307-3.494-7.8-7.8-7.8c-4.304,0-7.8,3.493-7.8,7.8v47.225h-4.332V52.88c0-4.307-3.494-7.8-7.8-7.8    c-4.304,0-7.8,3.493-7.8,7.8v47.225h-4.347V52.88c0-4.307-3.494-7.8-7.8-7.8c-4.304,0-7.8,3.493-7.8,7.8v47.225H15.6V54.565    c0-4.306-3.494-7.8-7.8-7.8c-4.304,0-7.8,3.494-7.8,7.8v51.612C0,114.852,5.855,124.327,13.614,128.206z"/>
	</g>
</g>
</svg>`;
  }
  return `https://maps.googleapis.com/maps/api/place/photo?height=500&maxwidth=800&photo_reference=${photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&t=${Date.now()}`;

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
  img.src = `<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 302.459 302.46" xml:space="preserve">
<g>
	<g>
		<path d="M163.816,222.91c38.745,0,70.269-31.514,70.269-70.259c0-38.745-31.523-70.274-70.269-70.274    c-38.743,0-70.264,31.524-70.264,70.274C93.552,191.396,125.068,222.91,163.816,222.91z"/>
		<path d="M163.816,241.771c49.226,0,89.118-39.903,89.118-89.119c0-49.228-39.893-89.123-89.118-89.123    c-49.221,0-89.119,39.895-89.119,89.123C74.697,201.867,114.595,241.771,163.816,241.771z M163.816,77.183    c41.608,0,75.469,33.862,75.469,75.469c0,41.609-33.86,75.464-75.469,75.464c-41.609,0-75.464-33.854-75.464-75.464    C88.352,111.045,122.207,77.183,163.816,77.183z"/>
		<path d="M302.459,250.062l-5.2-200.026c0-4.307-3.493-7.8-7.8-7.8c-1.152,0-2.234,0.264-3.214,0.718v-0.074    c0,0-0.203,0.13-0.493,0.328c-0.746,0.412-1.416,0.919-1.995,1.539c-5.708,4.685-23.907,23.78-25.431,49.592    c-2.311,39.372,16.813,55.317,23.328,69.921l-5.199,85.798c0,4.306,8.693,7.8,12.999,7.8    C293.766,257.862,302.459,254.369,302.459,250.062z"/>
		<path d="M13.614,128.206l13.461,6.724c1.534,0.769,3.225,1.33,4.992,1.747l-5.2,117.007c0,3.615,8.696,6.54,13,6.54    c4.306,0,13-2.925,13-6.54l-5.2-117.606c1.831-0.576,3.595-1.279,5.139-2.224l9.973-6.073c7.196-4.39,12.619-14.045,12.619-22.475    V52.88c0-4.307-3.494-7.8-7.8-7.8c-4.304,0-7.8,3.493-7.8,7.8v47.225h-4.332V52.88c0-4.307-3.494-7.8-7.8-7.8    c-4.304,0-7.8,3.493-7.8,7.8v47.225h-4.347V52.88c0-4.307-3.494-7.8-7.8-7.8c-4.304,0-7.8,3.493-7.8,7.8v47.225H15.6V54.565    c0-4.306-3.494-7.8-7.8-7.8c-4.304,0-7.8,3.494-7.8,7.8v51.612C0,114.852,5.855,124.327,13.614,128.206z"/>
	</g>
</g>
</svg>`;
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
</style>
