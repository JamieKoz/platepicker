<template>
  <div v-if="!restaurantData" class="restaurant-card-placeholder">
    <ion-card class="card-content my-2 mx-2 skeleton-loader">
      <div class="skeleton-image-container">
        <div class="skeleton-image" />
      </div>

      <div class="card-title-section">
        <div class="skeleton-text-container">
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
  <div v-else class="ion-activatable ripple-parent rectangle meal-card" @click="handleCardClick">
    <ion-card class="card-content my-2 mx-2">
      <div class="meal-image-container">
        <!-- Key the swiper instance to force re-rendering when photos change -->
        <vue-swiper :key="swiperKey" :modules="swiperModules" :pagination="{ clickable: true }" :slides-per-view="1"
          :space-between="0" @swiper="setSwiper">
          <div class="debug-photo-count">{{ currentSlideIndex !== undefined ? `${currentSlideIndex +
            1}/${allPhotos.length}` : `${allPhotos.length}` }}</div>


          <template v-if="allPhotos.length > 0">
            <vue-swiper-slide v-for="(photo, index) in allPhotos" :key="'photo-' + Math.random()">
              <img :src="getPhotoUrl(photo)" :alt="`${restaurantData.name} photo ${index + 1}`" class="meal-image"
                @error="handleImageError" @load="handleImageLoad(index)" />
            </vue-swiper-slide>
          </template>
          <template v-else>
            <vue-swiper-slide>
              <div class="debug-photo-info">No photos available</div>
              <img :src="placeholderImage" :alt="restaurantData.name" class="meal-image" />
            </vue-swiper-slide>
          </template>
        </vue-swiper>

        <!-- Photo loading indicator -->
        <div class="photo-loading-indicator" v-if="isLoadingMorePhotos">
          <div class="loading-spinner"></div>
        </div>

        <!-- Custom navigation buttons outside Swiper -->
        <div class="navigation-buttons" v-if="allPhotos.length > 1">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon } from '@ionic/vue';
import type { Restaurant } from '@/types/restaurant';
import type { Swiper } from 'swiper';
import { Swiper as VueSwiper, SwiperSlide as VueSwiperSlide } from 'swiper/vue';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import placeholderImage from '@/assets/meal-placeholder.png';
import { useRestaurantStore } from '@/store/useRestaurantStore';

const swiper = ref<Swiper | null>(null);
const swiperModules = [Pagination, Navigation];
const isLoadingMorePhotos = ref(false);
const swiperKey = ref(0); // Key to force swiper re-rendering
const currentSlideIndex = ref(0); 
const loadedImages = ref(new Set()); // Track loaded images
const BASE_URL = 'http://127.0.0.1:8000/api';
const props = defineProps<{
  restaurantData?: Restaurant | null;
}>();

const emit = defineEmits<{
  (e: 'chooseRestaurant', restaurant: Restaurant): void;
}>();

const allPhotos = computed(() => {
  const results = [];
  
  try {
    let total = 0;
    
    if (props.restaurantData?.primary_photo?.photo_reference) {
      results.push(props.restaurantData.primary_photo);
      total++;
    }
    
    // Add additional photos if available
    if (props.restaurantData?.photos && Array.isArray(props.restaurantData.photos)) {
      // Make sure we're only adding valid photo objects
      props.restaurantData.photos.forEach(photo => {
        if (photo && typeof photo === 'object' && photo.photo_reference) {
          results.push(photo);
          total++;
        }
      });
    }
    
    if (results.length > 0) {
      results.slice(0, 3).forEach((photo, i) => {
      });
    }
    
    return results;
  } catch (error) {
    console.error("Error in allPhotos computed property:", error);
    return [];
  }
});

const handleCardClick = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.nav-button') && props.restaurantData) {
    emit('chooseRestaurant', props.restaurantData);
  }
};

function setSwiper(swiperInstance: any) {
  swiper.value = swiperInstance;
  
  // Add event listener to track current slide
  swiperInstance.on('slideChange', () => {
    currentSlideIndex.value = swiperInstance.activeIndex;
  });
}

function handleImageLoad(index: number) {
  loadedImages.value.add(index);
}

function getPhotoUrl(photo: any): string {
  if (!photo) {
    return placeholderImage;
  }
  
  const photoRef = photo.photo_reference;
  if (!photoRef) {
    return placeholderImage;
  }
  
  if (photoRef.startsWith('http')) {
    return photoRef;
  }
  
  return `https://maps.googleapis.com/maps/api/place/photo?height=400&maxwidth=600&photo_reference=${photoRef}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
}

function handleImageError(event: Event) {
  console.log("Image failed to load, using placeholder");
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

function updateSwiper() {
  swiperKey.value++;
  
  setTimeout(() => {
    if (swiper.value) {
      swiper.value.update();
    }
  }, 200);
}

const loadAdditionalPhotos = async () => {
  if (!props.restaurantData || !props.restaurantData.place_id) {
    console.error("No restaurant data available");
    return;
  }

  const hasMultiplePhotos = allPhotos.value.length > 1;
  if (hasMultiplePhotos) {
    console.log("Already has multiple photos, skipping");
    return;
  }

  const placeId = props.restaurantData.place_id;
  
  isLoadingMorePhotos.value = true;
  
  try {
    const response = await fetch(`${BASE_URL}/restaurants/photos/${placeId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!props.restaurantData.photos) {
      props.restaurantData.photos = [];
    }
    
    if (data.photos && data.photos.length > 0) {
      const photosToAdd = data.photos.slice(1, 5);
      
      for (const photo of photosToAdd) {
        if (photo && photo.url) {
          props.restaurantData.photos.push({
            photo_reference: photo.url,
            width: photo.width || 400,
            height: photo.height || 300
          });
        }
      }
      
      updateSwiper();
    }
  } catch (error) {
    console.error("Error fetching photos:", error);
  } finally {
    isLoadingMorePhotos.value = false;
  }
};


onMounted(() => {
  if (props.restaurantData) {
    loadAdditionalPhotos();
  }
});

// Watch for restaurant data changes to load photos for new restaurants
watch(() => props.restaurantData?.place_id, (newPlaceId) => {
  if (newPlaceId) {
    loadAdditionalPhotos();
  }
});

// Watch for changes in photo arrays
watch(() => [
  props.restaurantData?.photos?.length,
  props.restaurantData?.primary_photo
], () => {
  updateSwiper();
}, { deep: true });
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
  pointer-events: none;
  /* Allow clicks to pass through to the card */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.nav-button {
  pointer-events: auto;
  /* Make buttons clickable */
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
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%);
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
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 4px;
}

.skeleton-subtitle {
  height: 16px;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%);
  animation: shimmer 15s infinite linear;
  border-radius: 4px;
}

.skeleton-details {
  height: 16px;
  width: 60%;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%);
  animation: shimmer 10s infinite linear;
  border-radius: 4px;
}
.debug-photo-count {
  position: absolute;
  top: 5px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  font-size: 12px;
  z-index: 100;
  border-radius: 4px;
}

.debug-photo-info {
  position: absolute;
  top: 30px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  font-size: 12px;
  z-index: 100;
  border-radius: 4px;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
