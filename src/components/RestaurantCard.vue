# RestaurantCard.vue
<template>
  <div v-if="!restaurantData"
    class="relative overflow-hidden border-solid border-2 border-gray-500 rounded-xl flex flex-col h-full">
    <ion-card :key="`skeleton-${uniqueComponentId}`" class="h-full flex flex-col my-2 mx-2 bg-[#2a2a2a] rounded-xl overflow-hidden">
      <div class="h-[65%] min-h-[65%] max-h-[65%] flex items-center justify-center">
        <div class="w-full h-full bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] bg-[length:1000px_100%] animate-shimmer-slow"></div>
      </div>

      <div class="h-[35%] min-h-[35%] max-h-[35%]">
        <div class="skeleton-text-container p-2">
          <div class="h-6 mx-auto bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] bg-[length:1000px_100%] animate-shimmer-medium rounded"></div>
          <div class="flex justify-between mt-4">
            <div class="h-4 w-2/5 bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] animate-shimmer-slow rounded"></div>
            <div class="h-4 w-1/5 bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] animate-shimmer-slow rounded"></div>
          </div>
          <div class="h-4 w-3/5 mt-2 bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] animate-shimmer-medium rounded"></div>
        </div>
      </div>
    </ion-card>
  </div>

  <div v-else
    class="relative overflow-hidden border-solid border-2 border-yellow-500 rounded-xl flex flex-col h-full"
    @click="handleCardClick">
    <ion-card :key="`card-${uniqueComponentId}-${restaurantData.place_id}`" class="flex flex-col justify-between h-full my-2 mx-2">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="flex flex-1 overflow-hidden items-center justify-center min-h-[65%] max-h-[65%]">
        <vue-swiper :key="`swiper-${swiperKey}-${uniqueComponentId}`" :modules="swiperModules" :pagination="{ clickable: true }" :slides-per-view="1"
          :space-between="0" :preload-images="true" :lazy="true" @swiper="setSwiper" class="h-full w-full">
          <div class="absolute top-2 right-2 p-1 z-10 text-white rounded-md text-xs bg-gray-900 opacity-70">
            {{ currentSlideIndex !== undefined ? `${currentSlideIndex + 1}/${visiblePhotos.length}` : `${visiblePhotos.length}` }}
          </div>

          <template v-if="visiblePhotos.length > 0">
            <vue-swiper-slide 
              v-for="(photo, index) in visiblePhotos" 
              :key="`slide-${uniqueComponentId}-${index}`"
              class="h-full w-full flex items-center justify-center"
            >
              <img 
                :src="getPhotoUrl(photo)" 
                :alt="`${restaurantData.name} photo ${index + 1}`" 
                class="w-full h-full object-cover object-center"
                @error="handleImageError($event, index)" 
                loading="lazy" 
              />
            </vue-swiper-slide>
          </template>
          <template v-else>
            <vue-swiper-slide :key="`no-photos-${uniqueComponentId}`" class="h-full w-full flex items-center justify-center">
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
          <button class="pointer-events-auto bg-black opacity-30 w-10 h-10 rounded-full transition-colors duration-200 hover:bg-black/50 flex items-center justify-center cursor-pointer z-10 text-white border-none" @click.stop="navigatePrev">
            <ion-icon :icon="chevronBack"></ion-icon>
          </button>
          <button class="pointer-events-auto bg-black opacity-30 w-10 h-10 rounded-full transition-colors duration-200 hover:bg-black/50 flex items-center justify-center cursor-pointer z-10 text-white border-none" @click.stop="navigateNext">
            <ion-icon :icon="chevronForward"></ion-icon>
          </button>
        </div>
      </div>
      <ion-card-title class="py-2 overflow-hidden font-bold p-2 text-lg break-word white-space">
        <ion-card-subtitle class="text-white text-center">{{ restaurantData.name }}</ion-card-subtitle>
        <ion-card-content class="p-2">
          <div class="flex justify-between w-full">
            <span>
              <span class="mr-1 text-xs">{{ restaurantData.rating?.toLocaleString() || 0 }}</span>
              <!-- Full yellow stars -->
              <div class="relative inline-block">
                <!-- Base layer - Gray stars -->
                <div class="text-gray-200">★★★★★</div>
                <!-- Overlay - Yellow stars with clipping -->
                <div class="absolute top-0 left-0 text-yellow-300 overflow-hidden whitespace-nowrap"
                   :style="{ width: `${calculateYellowWidth(restaurantData.rating || 0)}%` }">★★★★★</div>
              </div>
              
              <span class="ml-1 text-xs">({{ restaurantData.user_ratings_total?.toLocaleString() || 0 }})</span>
            </span>

            <p v-if="restaurantData.price_level" class="text-right">
              <span class="text-yellow-300">{{ '$'.repeat(Math.min(Math.round(restaurantData.price_level || 0), 4))
                }}</span>
              <span class="text-gray-200">{{ '$'.repeat(4 - Math.min(Math.round(restaurantData.price_level || 0), 4)) }}</span>
            </p>
          </div>
          <p class="mt-1" style="font-size: 0.5rem;">{{ restaurantData.vicinity }}</p>
        </ion-card-content>
      </ion-card-title>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon } from '@ionic/vue';
import type { PhotoReference, Restaurant } from '@/types/restaurant';
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
// Updated visiblePhotos computed property and photo handling
// Only use photos that have valid references
const visiblePhotos = computed(() => {
  if (!props.restaurantData) return [];

  const results: PhotoReference[] = [];
  
  try {
    // First add the primary photo if available
    if (props.restaurantData.primary_photo) {
      const primaryRef = props.restaurantData.primary_photo.reference;
      
      if (primaryRef && typeof primaryRef === 'string' && primaryRef.length > 10 && primaryRef.length < 400) {
        results.push({
          reference: primaryRef,
          width: props.restaurantData.primary_photo.width || 450,
          height: props.restaurantData.primary_photo.height || 350
        });
      } else {
        console.log("Primary photo has invalid reference:", 
                   primaryRef ? (primaryRef.length > 40 ? primaryRef.substring(0, 40) + '...' : primaryRef) : "undefined");
      }
    }
    
    // Then add photos from the photos array
    if (props.restaurantData.photos && Array.isArray(props.restaurantData.photos)) {
      props.restaurantData.photos.forEach(photo => {
        const photoRef = photo.reference || photo.reference;
        
        // Only add valid photo references and avoid duplicates
        if (photoRef && typeof photoRef === 'string' && photoRef.length > 10 && photoRef.length < 400) {
          // Check if it's not a duplicate of an already added photo
          const isDuplicate = results.some(p => (p.reference || p.reference) === photoRef);
          
          if (!isDuplicate && results.length < MAX_PHOTOS) {
            results.push({
              reference: photoRef,
              width: photo.width || 450,
              height: photo.height || 350
            });
          }
        }
      });
    }
    
    // Check cache for additional photos if we don't have enough
    if (results.length < 2 && props.restaurantData.place_id && restaurantStore.photoCache[props.restaurantData.place_id]) {
      const cachedPhotos = restaurantStore.photoCache[props.restaurantData.place_id];
      
      cachedPhotos.forEach(photo => {
        const photoRef = photo.reference || photo.reference;
        
        if (photoRef && typeof photoRef === 'string' && photoRef.length > 10 && photoRef.length < 400) {
          // Check for duplicates
          const isDuplicate = results.some(p => (p.reference || p.reference) === photoRef);
          
          if (!isDuplicate && results.length < MAX_PHOTOS) {
            results.push({
              reference: photoRef,
              width: photo.width || 450,
              height: photo.height || 350
            });
          }
        }
      });
    }
    
    console.log(`Restaurant ${props.restaurantData.name}: Found ${results.length} valid photos to display`);
    
    return results;
  } catch (error) {
    console.error("Error in visiblePhotos computed property:", error);
    return [];
  }
});const handleCardClick = (event: MouseEvent) => {
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
  // If no photo object provided, use placeholder
  if (!photo) {
    console.log("No photo provided, using placeholder");
    return placeholderImage;
  }

  // Get the reference, checking both possible property names
  const photoRef = photo.reference || photo.photo_reference;
  
  if (!photoRef) {
    console.log("No photo reference found in photo object:", photo);
    return placeholderImage;
  }
  
  // Check cache first
  const cachedUrl = imageCache.value.get(photoRef);
  if (cachedUrl) {
    return cachedUrl === 'error' ? placeholderImage : cachedUrl;
  }

  // Validate the photo reference
  if (typeof photoRef !== 'string') {
    console.error('Invalid photo reference (not a string):', photoRef);
    imageCache.value.set(photoRef, 'error');
    return placeholderImage;
  }
  
  // Check if reference is a reasonable length
  // Google photo references are typically 100-300 characters
  if (photoRef.length < 10 || photoRef.length > 400) {
    console.error(`Invalid photo reference length (${photoRef.length})`, 
                 photoRef.length > 40 ? photoRef.substring(0, 40) + '...' : photoRef);
    imageCache.value.set(photoRef, 'error');
    return placeholderImage;
  }
  
  // Return photo URL from our proxy endpoint
  try {
    const proxyUrl = `${api.defaults.baseURL}/restaurants/photo-proxy?photo_reference=${encodeURIComponent(photoRef)}&maxwidth=800&maxheight=600`;
    
    // Add to cache
    imageCache.value.set(photoRef, proxyUrl);
    
    return proxyUrl;
  } catch (error) {
    console.error('Error generating photo URL:', error);
    imageCache.value.set(photoRef, 'error');
    return placeholderImage;
  }
}function handleImageError(event: Event, index: number) {
  const img = event.target as HTMLImageElement;
  
  // Mark as failed in cache
  if (visiblePhotos.value[index]) {
    const photoRef = visiblePhotos.value[index].reference;
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
  if (props.restaurantData.photos && props.restaurantData.photos.length >= MAX_PHOTOS) {
    console.log(`Already have ${props.restaurantData.photos.length} photos, not loading more`);
    return;
  }
  
  console.log(`Loading additional photos for restaurant ${props.restaurantData.name} (${placeId})`);
  isLoadingMorePhotos.value = true;

  try {
    // First, check if we already have photos in the store cache
    if (restaurantStore.photoCache[placeId] && restaurantStore.photoCache[placeId].length > 0) {
      console.log(`Found ${restaurantStore.photoCache[placeId].length} cached photos in store`);
      updateRestaurantPhotos(restaurantStore.photoCache[placeId]);
    } else {
      // If not in cache, fetch from API through store
      console.log(`Fetching photos from API for ${placeId}`);
      const photos = await restaurantStore.getRestaurantPhotos(placeId);
      
      if (photos && photos.length > 0) {
        console.log(`Received ${photos.length} photos from API`);
        updateRestaurantPhotos(photos);
      } else {
        console.log('No photos received from API');
      }
    }
  } catch (error) {
    console.error("Error fetching photos:", error);
  } finally {
    isLoadingMorePhotos.value = false;
    // Force swiper to update after photos are loaded
    updateSwiper();
  }
};
const updateRestaurantPhotos = (photos: any[]) => {
  if (!props.restaurantData) return;
  
  console.log(`Updating restaurant photos for ${props.restaurantData.name}, received ${photos.length} new photos`);
  
  // Initialize photos array if it doesn't exist
  if (!props.restaurantData.photos) {
    props.restaurantData.photos = [];
  }
  
  // Convert photo format 
  const newPhotos = photos
    .filter(photo => photo && (photo.reference || photo.photo_reference))
    .map(photo => {
      // Handle different photo formats - the API might return either reference or photo_reference
      const photoRef = photo.reference || photo.photo_reference;
      
      return {
        reference: photoRef,
        width: photo.width || 450,
        height: photo.height || 350
      };
    });
  
  console.log(`Processed ${newPhotos.length} photos with valid references`);
  
  // Add the new photos to the restaurant
  if (newPhotos.length > 0) {
    // Ensure we're not adding duplicates
    const existingRefs = props.restaurantData.photos?.map(p => p.reference) || [];
    const uniqueNewPhotos = newPhotos.filter(p => !existingRefs.includes(p.reference));
    
    // Add the unique new photos
    props.restaurantData.photos = [...props.restaurantData.photos, ...uniqueNewPhotos];
    console.log(`Added ${uniqueNewPhotos.length} unique new photos, total: ${props.restaurantData.photos.length}`);
  }
  
  // Update the swiper to show the new photos
  updateSwiper();
};
const calculateYellowWidth = (rating: number) => {
  // Convert rating to percentage (e.g., 3.7/5 = 74%)
  return Math.min(Math.max(Math.floor((rating / 5) * 100), 0), 100);
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
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer-slow {
  animation: shimmer 8s infinite linear;
}

.animate-shimmer-medium {
  animation: shimmer 6s infinite linear;
}

.animate-shimmer-fast {
  animation: shimmer 4s infinite linear;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev), 
:deep(.swiper-pagination) {
  display: none;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.photo-loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
</style>
