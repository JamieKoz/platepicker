<template>
  <div v-if="!restaurantData" class="w-[90vw] h-[40vh] flex items-center justify-center rounded-xl border-solid border-2 border-gray-500">
    <ion-card :key="`skeleton-${uniqueComponentId}`" class="h-[95%] flex flex-col my-2 mx-2 skeleton-loader">
      <div class="skeleton-image-container">
        <div class="skeleton-image" />
      </div>

      <div class="card-title-section">
        <div class="skeleton-text-container">
          <div class="skeleton-title"></div>
          <div class="flex justify-between mt-4">
            <div class="skeleton-subtitle w-2/5"></div>
            <div class="skeleton-subtitle w-1/5"></div>
          </div>
          <div class="skeleton-details mt-2"></div>
        </div>
      </div>
    </ion-card>
  </div>
  <div v-else class="ion-activatable relative overflow-hidden border-solid border-2 border-yellow-500 rounded-xl flex flex-col w-[90vw] h-[40vh]" @click="handleCardClick">
    <ion-card :key="`card-${uniqueComponentId}-${restaurantData.place_id}`" class="flex flex-col justify-between h-full my-2 mx-2">
      <div class="meal-image-container overflow-hidden relative">
        <vue-swiper :key="`swiper-${swiperKey}-${uniqueComponentId}`" :modules="swiperModules" :pagination="{ clickable: true }" :slides-per-view="1"
          :space-between="0" :preload-images="true" :lazy="true" @swiper="setSwiper">
          <div class="absolute top-2 right-2 p-1 z-10 text-white rounded-md text-xs bg-gray-900 opacity-70">
            {{ currentSlideIndex !== undefined ? `${currentSlideIndex + 1}/${visiblePhotos.length}` : `${visiblePhotos.length}` }}
          </div>

          <template v-if="visiblePhotos.length > 0">
            <vue-swiper-slide 
              v-for="(photo, index) in visiblePhotos" 
              :key="`slide-${uniqueComponentId}-${index}`"
            >
              <img 
                :src="getPhotoUrl(photo)" 
                :alt="`${restaurantData.name} photo ${index + 1}`" 
                class="w-full h-full object-cover object-center min-h-[200px] min-w-[200px]"
                @error="handleImageError($event, index)" 
                loading="lazy" 
              />
            </vue-swiper-slide>
          </template>
          <template v-else>
            <vue-swiper-slide :key="`no-photos-${uniqueComponentId}`">
              <div class="absolute top-2 right-2 p-1 z-10 text-white rounded-md text-xs max-w-4/5 bg-gray-900 opacity-70 text-nowrap overflow-hidden">No photos available</div>
              <img :src="placeholderImage" :alt="restaurantData.name" class="w-full h-full object-cover object-center" />
            </vue-swiper-slide>
          </template>
        </vue-swiper>

        <!-- Photo loading indicator -->
        <div class="photo-loading-indicator" v-if="isLoadingMorePhotos">
          <div class="loading-spinner"></div>
        </div>

        <!-- Custom navigation buttons outside Swiper -->
        <div class="absolute top-0 left-0 right-0 bottom-0 flex justify-between items-center px-1" v-if="visiblePhotos.length > 1">
          <button class="nav-button prev text-white border-none flex items-center justify-center cursor-pointer z-10" @click.stop="navigatePrev">
            <ion-icon :icon="chevronBack"></ion-icon>
          </button>
          <button class="nav-button next text-white border-none flex items-center justify-center cursor-pointer z-10" @click.stop="navigateNext">
            <ion-icon :icon="chevronForward"></ion-icon>
          </button>
        </div>
      </div>
      <ion-card-title class="flex flex-col overflow-hidden p-4 card-title-section">
        <ion-card-subtitle class="text-white text-center">{{ restaurantData.name }}</ion-card-subtitle>
        <ion-card-content class="p-2 overflow-y-auto">
          <div class="flex justify-between">
            <span>
              <span class="text-yellow-300">{{ '★'.repeat(Math.min(Math.round(restaurantData.rating || 0), 5)) }}</span>
              <span class="text-gray-200">{{ '★'.repeat(5 - Math.min(Math.round(restaurantData.rating || 0), 5))
                }}</span>
              <span class="ml-1 text-xs">({{ restaurantData.user_ratings_total?.toLocaleString() || 0 }})</span>
            </span>

            <span class=""></span>
            <p v-if="restaurantData.price_level" class="">
              <span class="text-yellow-300">{{ '$'.repeat(Math.min(Math.round(restaurantData.price_level || 0), 4))
                }}</span>
              <span class="text-gray-200">{{ '$'.repeat(4 - Math.min(Math.round(restaurantData.price_level || 0), 4))
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
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
import api from '@/api/axios';
import { useRestaurantStore } from '@/store/useRestaurantStore';

const swiper = ref<Swiper | null>(null);
const swiperModules = [Pagination, Navigation];
const isLoadingMorePhotos = ref(false);
const swiperKey = ref(0);
const currentSlideIndex = ref(0);
const imageCache = ref(new Map<string, string>());
const restaurantStore = useRestaurantStore();
const uniqueComponentId = ref(Math.random().toString(36).substring(2, 10));

const props = defineProps<{
  restaurantData?: Restaurant | null;
}>();

// Maximum number of photos to display
const MAX_PHOTOS = 7;

const emit = defineEmits<{
  (e: 'chooseRestaurant', restaurant: Restaurant): void;
}>();

// Only use photos that have valid references, skipping the primary photo
const visiblePhotos = computed(() => {
  if (!props.restaurantData) return [];

  const results = [];
  
  try {
    if (props.restaurantData.photos && Array.isArray(props.restaurantData.photos)) {
      props.restaurantData.photos.forEach(photo => {
        if (photo && photo.photo_reference && results.length < MAX_PHOTOS) {
          results.push(photo);
        }
      });
    }
    
    // If we have no photos at all, then try to use the primary photo as a fallback
    if (results.length === 0 && props.restaurantData.primary_photo?.photo_reference) {
      results.push(props.restaurantData.primary_photo);
    }
    
    return results;
  } catch (error) {
    console.error("Error in visiblePhotos computed property:", error);
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
  
  // Update current slide index when slide changes
  swiperInstance.on('slideChange', () => {
    currentSlideIndex.value = swiperInstance.activeIndex;
  });
  
  // Set initial slide index
  currentSlideIndex.value = swiperInstance.activeIndex || 0;
}

function getPhotoUrl(photo: any): string {
  if (!photo || !photo.photo_reference) {
    return placeholderImage;
  }

  const photoRef = photo.photo_reference;
  
  // Check cache first
  const cachedUrl = imageCache.value.get(photoRef);
  if (cachedUrl) {
    return cachedUrl === 'error' ? placeholderImage : cachedUrl;
  }

  // Extract the actual photo reference if it's a nested URL
  let actualPhotoRef = photoRef;
  
  // If the photo reference is a URL that contains another photo_reference parameter
  if (typeof photoRef === 'string' && photoRef.includes('photo_reference=')) {
    try {
      // Try to extract just the photo reference part
      const match = photoRef.match(/photo_reference=([^&]+)/);
      if (match && match[1]) {
        actualPhotoRef = decodeURIComponent(match[1]);
      }
    } catch (e) {
      console.error('Error extracting photo reference:', e);
      return placeholderImage;
    }
  }
  if (actualPhotoRef && actualPhotoRef.length > 500) {
    console.error('Photo reference too long, likely invalid');
    imageCache.value.set(photoRef, 'error');
    return placeholderImage;
  }
  // Return photo URL directly from our proxy endpoint
  const proxyUrl = `${api.defaults.baseURL}/restaurants/photo-proxy?photo_reference=${encodeURIComponent(actualPhotoRef)}&maxwidth=800&maxheight=450`;
  
  // Add to cache to prevent duplicate retrievals
  imageCache.value.set(photoRef, proxyUrl);
  
  return proxyUrl;
}

function handleImageError(event: Event, index: number) {
  const img = event.target as HTMLImageElement;
  
  // Mark as failed in cache
  if (visiblePhotos.value[index]) {
    const photoRef = visiblePhotos.value[index].photo_reference;
    imageCache.value.set(photoRef, 'error');
  }
  
  // Replace with placeholder
  img.src = placeholderImage;
}

const navigatePrev = (event: Event) => {
  event.stopPropagation();
  if (swiper.value) {
    swiper.value.slidePrev();
  }
}

const navigateNext = (event: Event) => {
  event.stopPropagation();
  if (swiper.value) {
    swiper.value.slideNext();
  }
}

const updateSwiper = () => {
  swiperKey.value++;
  
  setTimeout(() => {
    if (swiper.value) {
      swiper.value.update();
    }
  }, 200);
}

const loadAdditionalPhotos = async () => {
  if (!props.restaurantData || !props.restaurantData.place_id || isLoadingMorePhotos.value) {
    return;
  }

  const placeId = props.restaurantData.place_id;
  
  // Check if we already have enough photos
  if (visiblePhotos.value.length >= MAX_PHOTOS) {
    return;
  }
  
  isLoadingMorePhotos.value = true;

  try {
    // Check if photos are already in the store cache
    const cachedPhotos = restaurantStore.photoCache[placeId];
    
    if (cachedPhotos && cachedPhotos.length > 0) {
      // Use cached photos from store
      updateRestaurantPhotos(cachedPhotos);
    } else {
      // Fetch photos from API
      const response = await api.get(`/restaurants/photos/${placeId}`);
      
      if (response.data.photos && Array.isArray(response.data.photos) && response.data.photos.length > 0) {
        updateRestaurantPhotos(response.data.photos);
      }
    }
  } catch (error) {
    console.error("Error fetching photos:", error);
  } finally {
    isLoadingMorePhotos.value = false;
    updateSwiper();
  }
};

const updateRestaurantPhotos = (photos: any[]) => {
  if (!props.restaurantData) return;
  
  // Initialize photos array if it doesn't exist
  if (!props.restaurantData.photos) {
    props.restaurantData.photos = [];
  }
  
  // Convert photo format
  const newPhotos = photos
    .filter(photo => photo && (photo.photo_reference || photo.url))
    .map(photo => {
      const photoRef = photo.photo_reference || 
        (photo.url && typeof photo.url === 'string' && photo.url.match(/photo_reference=([^&]+)/) ? 
          decodeURIComponent(photo.url.match(/photo_reference=([^&]+)/)[1]) : 
          photo.url);
          
      return {
        photo_reference: photoRef,
        width: photo.width || 800,
        height: photo.height || 450,
        id: Math.random().toString(36).substring(2, 9)
      };
    });
  
  // Add all new photos to the photos array
  props.restaurantData.photos = [...newPhotos].slice(0, MAX_PHOTOS);
};

onMounted(() => {
  if (props.restaurantData) {
    loadAdditionalPhotos();
  }
});

// Watch for restaurant data changes to load photos for new restaurants
watch(() => props.restaurantData?.place_id, (newPlaceId) => {
  if (newPlaceId) {
    // Generate a new component ID when restaurant changes
    uniqueComponentId.value = Math.random().toString(36).substring(2, 10);
    // Clear cache when restaurant changes
    imageCache.value = new Map<string, string>();
    loadAdditionalPhotos();
  }
}, { immediate: true });
</script><style scoped>

.meal-card {
  width: 90vw;
  height: 40vh;
}

.card-content {
  height: 95%;
}

.meal-image-container {
  height: 70%;
  min-height: 70%;
  max-height: 70%;
}

.card-title-section {
  height: 30%;
  min-height: 30%;
  max-height: 30%;
}

.restaurant-card-placeholder {
  width: 90vw;
  height: 40vh;
}

.location-text {
  font-size: 0.5rem;
}

.meal-image-container :deep(.swiper-slide) {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button {
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
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

</style>
