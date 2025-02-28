<template>
  <div v-if="!restaurantData" class="restaurant-card-placeholder flex items-center justify-center rounded-xl border-solid border-2 border-gray-500">
    <ion-card class="card-content flex flex-col my-2 mx-2 skeleton-loader">
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
  <div v-else class="ion-activatable relative overflow-hidden border-solid border-2 border-gray-500 rounded-xl flex flex-col meal-card" @click="handleCardClick">
    <ion-card class="flex flex-col justify-between h-full my-2 mx-2">
      <div class="meal-image-container overflow-hidden relative">
        <vue-swiper :key="swiperKey" :modules="swiperModules" :pagination="{ clickable: true }" :slides-per-view="1"
          :space-between="0" @swiper="setSwiper">
          <div class="absolute top-2 right-2 p-1 z-10 text-white rounded-md text-xs bg-gray-900 opacity-70">{{ currentSlideIndex !== undefined ? `${currentSlideIndex +
            1}/${allPhotos.length}` : `${allPhotos.length}` }}</div>


          <template v-if="allPhotos.length > 0">
            <vue-swiper-slide v-for="(photo, index) in allPhotos" :key="'photo-' + Math.random()">
              <img :src="getPhotoUrl(photo)" :alt="`${restaurantData.name} photo ${index + 1}`" class="w-full h-full object-cover object-center"
                @error="handleImageError" @load="handleImageLoad(index)" />
            </vue-swiper-slide>
          </template>
          <template v-else>
            <vue-swiper-slide>
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
        <div class="absolute top-0 left-0 right-0 bottom-0 flex justify-between items-center px-1" v-if="allPhotos.length > 1">
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

            <span class="">
            </span>
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
import { useRestaurantStore } from '@/store/useRestaurantStore';
import api from '@/api/axios';

const swiper = ref<Swiper | null>(null);
const swiperModules = [Pagination, Navigation];
const isLoadingMorePhotos = ref(false);
const swiperKey = ref(0); // Key to force swiper re-rendering
const currentSlideIndex = ref(0); 
const loadedImages = ref(new Set()); // Track loaded images
const props = defineProps<{
  restaurantData?: Restaurant | null;
}>();
const imageCache = ref(new Map<string, string>());
const loadingImages = ref(new Set<string>());
const imageLoadQueue = ref<QueueItem[]>([]);
const isProcessingQueue = ref(false);
const backoffTime = ref(500); // Starting delay in ms
const consecutiveErrors = ref(0);
const maxConsecutiveErrors = 3;

interface QueueItem {
  ref: string;
  url: string;
}
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
    
    // Preload adjacent slides when the slide changes
    preloadAdjacentSlides();
  });
  
  // Also preload on initial setup after a small delay to let the component settle
  setTimeout(() => {
    preloadAdjacentSlides();
  }, 1000);
}

function handleImageLoad(index: number) {
  loadedImages.value.add(index);
  
  // Force swiper update after successful load
  if (swiper.value) {
    swiper.value.update();
  }
}

function getPhotoUrl(photo: any): string {
  if (!photo) {
    return placeholderImage;
  }

  const photoRef = photo.photo_reference;
  if (!photoRef) {
    return placeholderImage;
  }

  // Check if photoRef is suspiciously long (Google photo refs are typically <100 chars)
  if (photoRef.length > 500 && !photoRef.startsWith('http')) {
    console.warn('Suspiciously long photo reference detected, skipping:',
      photoRef.substring(0, 50) + '...');
    return placeholderImage;
  }

  // Check if this is already in the cache
  const cachedUrl = imageCache.value.get(photoRef);
  if (cachedUrl) {
    return cachedUrl === 'error' ? placeholderImage : cachedUrl;
  }

  // Handle different URL formats
  // Case 1: Already a full URL from Google Photos
  if (photoRef.startsWith('http')) {
    // Check if it's a Google Photos URL with dimensions parameter
    if (photoRef.includes('lh3.googleusercontent.com/places/')) {
      // It's a Google Photos URL that might have dimension issues
      try {
        // Parse the URL to fix potential formatting issues
        const baseUrl = photoRef.split('=')[0]; // Remove any dimension parameters

        // Queue this for loading
        if (!loadingImages.value.has(photoRef)) {
          // Use maxheight instead of height and properly encode the photo reference
          const url = `https://maps.googleapis.com/maps/api/place/photo?` +
            `maxheight=400&` +
            `maxwidth=600&` +
            `photoreference=${encodeURIComponent(photoRef)}&` +
            `key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
          queueImageForLoading(photoRef, url);
        }

        return placeholderImage; // Show placeholder while loading
      } catch (e) {
        console.error("Error parsing photo URL:", e);
        return placeholderImage;
      }
    } else {
      // It's a regular full URL, queue it for loading
      if (!loadingImages.value.has(photoRef)) {
        queueImageForLoading(photoRef, photoRef);
      }
      return placeholderImage;
    }
  }

  // Case 2: It's a Google Places API photo reference
  // Queue this image for loading if not already loading
  if (!loadingImages.value.has(photoRef)) {
    const url = `https://maps.googleapis.com/maps/api/place/photo?height=400&maxwidth=600&photo_reference=${photoRef}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
    queueImageForLoading(photoRef, url);
  }

  // Return placeholder while loading
  return placeholderImage;
}

function queueImageForLoading(photoRef: string, url: string) {
  if (loadingImages.value.has(photoRef) || imageCache.value.has(photoRef)) {
    return;
  }
  
  // Store the URL with the reference
  imageLoadQueue.value.push({ ref: photoRef, url });
  loadingImages.value.add(photoRef);
  
  if (!isProcessingQueue.value) {
    processImageQueue();
  }
}

// Updated processImageQueue to handle the new queue format and implement rate limiting
async function processImageQueue() {
  if (imageLoadQueue.value.length === 0) {
    isProcessingQueue.value = false;
    return;
  }
  
  isProcessingQueue.value = true;
  
  // Get the next item from the queue
  const queueItem = imageLoadQueue.value.shift();
  if (!queueItem) {
    isProcessingQueue.value = false;
    return;
  }
  
  const { ref: photoRef, url } = queueItem;
  
  // If we've had too many consecutive errors, wait longer
  if (consecutiveErrors.value >= maxConsecutiveErrors) {
    console.log(`Too many consecutive errors (${consecutiveErrors.value}), waiting longer...`);
    setTimeout(() => {
      // Put this item back at the front of the queue
      imageLoadQueue.value.unshift(queueItem);
      consecutiveErrors.value = Math.max(0, consecutiveErrors.value - 1);
      processImageQueue();
    }, 5000); // Wait 5 seconds before trying again
    return;
  }
  
  try {
    // Create a new image to preload
    const img = new Image();
    
    // Set up promise to handle load/error
    await new Promise<void>((resolve) => {
      img.onload = () => {
        imageCache.value.set(photoRef, url);
        consecutiveErrors.value = 0; // Reset error counter on success
        backoffTime.value = Math.max(300, backoffTime.value * 0.8); // Reduce backoff on success
        resolve();
      };
      
      img.onerror = () => {
        // Simpler error handling
        console.error(`Image load failed for URL: ${url}`);
        imageCache.value.set(photoRef, 'error');
        consecutiveErrors.value++; // Increment error counter
        backoffTime.value = Math.min(backoffTime.value * 1.5, 5000); // Increase backoff on error
        resolve(); // Resolve anyway to continue the queue
      };
      
      // Set the src to start loading
      img.src = url;
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (!imageCache.value.has(photoRef)) {
          console.warn("Image load timed out:", url);
          imageCache.value.set(photoRef, 'error');
          consecutiveErrors.value++;
          resolve();
        }
      }, 5000);
    });
  } catch (error) {
    console.error("Error in image loading process:", error);
    imageCache.value.set(photoRef, 'error');
    consecutiveErrors.value++;
  } finally {
    loadingImages.value.delete(photoRef);
    
    // Use the current backoff time
    setTimeout(() => {
      processImageQueue();
    }, backoffTime.value);
  }
}
// Cleanup function for component unmount
function cleanup() {
  // Clear the queue when component unmounts
  imageLoadQueue.value = [];
  isProcessingQueue.value = false;
}


function preloadAdjacentSlides() {
  if (!props.restaurantData || allPhotos.value.length <= 1) return;
  
  // Get current index
  const current = currentSlideIndex.value;
  const total = allPhotos.value.length;
  
  // Determine which slides to preload (next and previous)
  const nextIndex = (current + 1) % total;
  const prevIndex = (current - 1 + total) % total;
  
  // Preload next and previous images if they exist
  if (nextIndex !== current && allPhotos.value[nextIndex]) {
    const nextPhoto = allPhotos.value[nextIndex];
    if (nextPhoto && nextPhoto.photo_reference) {
      // Just trigger the getPhotoUrl to queue it, but don't use the result
      getPhotoUrl(nextPhoto);
    }
  }
  
  if (prevIndex !== current && allPhotos.value[prevIndex]) {
    const prevPhoto = allPhotos.value[prevIndex];
    if (prevPhoto && prevPhoto.photo_reference) {
      // Just trigger the getPhotoUrl to queue it, but don't use the result
      getPhotoUrl(prevPhoto);
    }
  }
}

function handleImageError(event: Event) {
  console.log("Image failed to load, using placeholder");
  const img = event.target as HTMLImageElement;
  img.src = placeholderImage;
}

const navigatePrev = (event: Event) => {
  event.stopPropagation(); // Stop event propagation
  if (swiper.value) {
    swiper.value.slidePrev();
  }
}

const navigateNext = (event: Event) => {
  event.stopPropagation(); // Stop event propagation  
  if (swiper.value) {
    swiper.value.slideNext();
  }
}

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
    // Add a slight delay before loading additional photos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await api.get(`/restaurants/photos/${placeId}`);
    
    if (!props.restaurantData.photos) {
      props.restaurantData.photos = [];
    }
    
    if (response.data.photos && response.data.photos.length > 0) {
      // Only take up to 3 photos to avoid overloading the API
      const photosToAdd = response.data.photos.slice(1, 4);
      
      for (const photo of photosToAdd) {
        if (photo && photo.url) {
          // Check if this is a duplicate of an existing photo
          const isDuplicate = props.restaurantData.photos.some(
            existingPhoto => existingPhoto.photo_reference === photo.url
          );
          
          if (!isDuplicate) {
            props.restaurantData.photos.push({
              photo_reference: photo.url,
              width: photo.width || 400,
              height: photo.height || 300
            });
          }
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

onBeforeUnmount(() => {
  cleanup();
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
