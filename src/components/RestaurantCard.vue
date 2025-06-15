<!-- RestaurantCard.vue with improved image loading -->
<template>
  <div v-if="!restaurantData"
    class="relative overflow-hidden border-solid border-2 border-gray-500 rounded-xl flex flex-col h-full">
    <ion-card :key="`skeleton-${uniqueComponentId}`" class="h-full flex flex-col my-2 mx-2 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded-xl overflow-hidden">
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
      <div class="flex flex-1 overflow-hidden items-center justify-center min-h-[65%] max-h-[65%] dark:bg-gray-800">
        <vue-swiper 
          v-if="!props.isWinner && validPhotos.length > 0"
          :key="`swiper-${swiperKey}-${uniqueComponentId}`" 
          :modules="swiperModules" 
          :pagination="{ clickable: true }" 
          :slides-per-view="1"
          :space-between="0" 
          :preload-images="false" 
          :lazy="false" 
          @swiper="setSwiper" 
          class="h-full w-full">
          <div class="absolute top-2 right-2 p-1 z-10 text-white rounded-md text-xs dark:bg-gray-900 opacity-70">
            {{ currentSlideIndex !== undefined ? `${currentSlideIndex + 1}/${validPhotos.length}` : `${validPhotos.length}` }}
          </div>

          <vue-swiper-slide 
            v-for="(photo, index) in validPhotos" 
            :key="`slide-${photo.id}`"
            class="h-full w-full flex items-center justify-center dark:bg-gray-800"
          >
            <div class="relative w-full h-full">
              <!-- Loading state -->
              <div v-if="loadingStates[photo.id]" class="absolute inset-0 flex items-center justify-center dark:bg-gray-800">
                <div class="loading-spinner"></div>
              </div>
              
              <!-- Image -->
              <img 
                v-show="!loadingStates[photo.id]"
                :src="photo.url || placeholderImage" 
                :alt="`${restaurantData.name} photo ${index + 1}`" 
                class="w-full h-full object-cover object-center"
                @load="handleImageLoad(photo.id)"
                @error="handleImageError($event, photo.id)" 
              />
            </div>
          </vue-swiper-slide>
        </vue-swiper>
        
        <!-- Static image for winner -->
        <div v-else-if="props.isWinner && validPhotos.length > 0" class="h-full w-full flex items-center justify-center bg-gray-800">
          <img 
            :src="validPhotos[0].url || placeholderImage" 
            :alt="`${restaurantData.name} photo`" 
            class="w-full h-full object-cover object-center"
            @error="handleImageError($event, validPhotos[0].id)" 
          />
        </div>
        
        <!-- No photos placeholder -->
        <div v-else class="h-full w-full flex items-center justify-center dark:bg-gray-800">
          <div class="absolute top-2 right-2 p-1 z-10 text-white rounded-md text-xs max-w-4/5 dark:bg-gray-900 opacity-70 text-nowrap overflow-hidden">No photos available</div>
          <img :src="placeholderImage" :alt="restaurantData.name" class="w-full h-full object-cover object-center" />
        </div>

        <!-- Photo loading indicator -->
        <div class="photo-loading-indicator" v-if="isLoadingMorePhotos && !props.isWinner">
          <div class="loading-spinner"></div>
        </div>

        <!-- Custom navigation buttons outside Swiper -->
        <div class="absolute top-0 left-0 right-0 bottom-0 flex justify-between items-center px-1" v-if="!props.isWinner && validPhotos.length > 1">
          <button class="pointer-events-auto bg-black opacity-30 w-10 h-10 rounded-full transition-colors duration-200 hover:bg-black/50 flex items-center justify-center cursor-pointer z-10 text-white border-none" @click.stop="navigatePrev">
            <ion-icon :icon="chevronBack"></ion-icon>
          </button>
          <button class="pointer-events-auto bg-black opacity-30 w-10 h-10 rounded-full transition-colors duration-200 hover:bg-black/50 flex items-center justify-center cursor-pointer z-10 text-white border-none" @click.stop="navigateNext">
            <ion-icon :icon="chevronForward"></ion-icon>
          </button>
        </div>
      </div>
      <ion-card-title class="py-2 overflow-hidden font-bold p-2 text-lg break-word white-space bg-amber-50 dark:!bg-[var(--ion-card-background)]">
        <ion-card-subtitle class="text-black dark:text-white text-center">{{ restaurantData.name }}</ion-card-subtitle>
        <ion-card-content class="p-2">
          <div class="flex justify-between w-full">
            <span>
              <span class="mr-1 text-xs">{{ restaurantData.rating?.toLocaleString() || 0 }}</span>
              <!-- Full yellow stars -->
              <div class="relative inline-block">
                <!-- Base layer - Gray stars -->
                <div class="text-gray-400 dark:text-gray-200">★★★★★</div>
                <!-- Overlay - Yellow stars with clipping -->
                <div class="absolute top-0 left-0 text-yellow-300 overflow-hidden whitespace-nowrap"
                   :style="{ width: `${calculateYellowWidth(restaurantData.rating || 0)}%` }">★★★★★</div>
              </div>
              
              <span class="ml-1 text-xs">({{ restaurantData.user_ratings_total?.toLocaleString() || 0 }})</span>
            </span>

            <p v-if="restaurantData.price_level" class="text-right">
              <span class="text-yellow-300">{{ '$'.repeat(Math.min(Math.round(restaurantData.price_level || 0), 4))
                }}</span>
              <span class="text-gray-400 dark:text-gray-200">{{ '$'.repeat(4 - Math.min(Math.round(restaurantData.price_level || 0), 4)) }}</span>
            </p>
          </div>
          <p class="mt-1" style="font-size: 0.5rem;">{{ restaurantData.vicinity }}</p>
        </ion-card-content>
      </ion-card-title>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon, IonRippleEffect } from '@ionic/vue';
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

interface ProcessedPhoto {
  id: string;
  reference: string;
  url: string | null;
  width: number;
  height: number;
  failed: boolean;
}

const swiper = ref<Swiper | null>(null);
const swiperModules = [Pagination, Navigation];
const isLoadingMorePhotos = ref(false);
const swiperKey = ref(0);
const currentSlideIndex = ref(0);
const restaurantStore = useRestaurantStore();
const uniqueComponentId = ref(Math.random().toString(36).substring(2, 10));
const processedPhotos = ref<ProcessedPhoto[]>([]);
const loadingStates = ref<Record<string, boolean>>({});
const fetchController = ref<AbortController | null>(null);

const props = defineProps<{
  restaurantData?: Restaurant | null;
  isWinner?: boolean;
}>();

// Maximum number of photos to display
const MAX_PHOTOS = 7;
// Retry configuration
const MAX_RETRIES = 3;  // Increased from 2
const RETRY_DELAY = 1000;

const emit = defineEmits<{
  (e: 'chooseRestaurant', restaurant: Restaurant): void;
}>();

// Get valid photos that haven't failed
const validPhotos = computed(() => {
  return processedPhotos.value.filter(photo => !photo.failed && photo.url);
});

const handleCardClick = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.nav-button') && props.restaurantData) {
    emit('chooseRestaurant', props.restaurantData);
  }
};

function setSwiper(swiperInstance: any) {
  swiper.value = swiperInstance;
  
  swiperInstance.on('slideChange', () => {
    currentSlideIndex.value = swiperInstance.activeIndex;
  });
  
  currentSlideIndex.value = swiperInstance.activeIndex || 0;
}

// Fetch photo URL with retry logic
async function fetchPhotoUrl(photoRef: string, retries = 0): Promise<string | null> {
  try {
    // Use different size parameters to improve success rate
    const sizes = [
      { maxwidth: 400, maxheight: 300 },
      { maxwidth: 600, maxheight: 450 },
      { maxwidth: 800, maxheight: 600 },
      { maxwidth: 1200, maxheight: 900 }, // Added larger size
      { maxwidth: 200, maxheight: 200 }   // Added smaller size as fallback
    ];
    
    const sizeParams = sizes[Math.min(retries, sizes.length - 1)];
    
    const proxyUrl = `${api.defaults.baseURL}/restaurants/photo-proxy?photo_reference=${encodeURIComponent(photoRef)}&maxwidth=${sizeParams.maxwidth}&maxheight=${sizeParams.maxheight}`;
    
    // Skip HEAD request check - just return the URL
    // Google Places API photos should work directly
    return proxyUrl;
    
  } catch (error) {
    // Ignore abort errors - these are expected when component unmounts
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    
    console.error('Error fetching photo URL:', error);
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchPhotoUrl(photoRef, retries + 1);
    }
    return null;
  }
}

// Process photos and fetch URLs
async function processPhotos() {
  if (!props.restaurantData) return;
  
  console.log(`Processing photos for ${props.restaurantData.name}...`);
  console.log('Restaurant data:', {
    name: props.restaurantData.name,
    hasPhotos: !!props.restaurantData.photos,
    photosLength: props.restaurantData.photos?.length || 0,
    hasPrimaryPhoto: !!props.restaurantData.primary_photo,
    primaryPhotoRef: props.restaurantData.primary_photo?.reference ||  props.restaurantData.primary_photo?.reference,
    placeId: props.restaurantData.place_id
  });
  
  // Cancel any ongoing fetches
  if (fetchController.value) {
    fetchController.value.abort();
  }
  fetchController.value = new AbortController();
  
  const photosToProcess: PhotoReference[] = [];
  const addedRefs = new Set<string>();
  
  // Helper function to add photo if valid
  const addPhotoIfValid = (photo: any, source: string) => {
    // Log the photo object to debug
    if (source.includes('[0]') || source.includes('cache[0]')) {
      console.log(`Photo object from ${source}:`, photo);
      // If it's a Vue proxy, try to access the properties directly
      if (photo && typeof photo === 'object') {
        console.log(`Photo reference:`, photo.reference);
        console.log(`Photo width:`, photo.width);
        console.log(`Photo height:`, photo.height);
      }
    }
    
    // Access the reference directly - Vue proxies will return the value
    let ref = null;
    if (photo && typeof photo === 'object') {
      // Try different property names
      ref = photo.reference || photo.photo_reference || photo.photoReference || photo.photo_ref;
    }
    
    if (!ref && photo) {
      // If no ref found, log all properties of the photo object
      console.log(`No reference found in photo from ${source}. Photo:`, photo);
      try {
        console.log(`Photo keys:`, Object.keys(photo));
      } catch (e) {
        console.log('Could not get keys');
      }
    }
    
    if (isValidPhotoReference(ref) && !addedRefs.has(ref) && photosToProcess.length < MAX_PHOTOS) {
      photosToProcess.push({
        reference: ref,
        width: photo.width ?? 450,
        height: photo.height ?? 350
      });
      addedRefs.add(ref);
      console.log(`Added photo from ${source}: ${ref.substring(0, 20)}...`);
    } else if (ref && !isValidPhotoReference(ref)) {
      console.log(`Invalid reference from ${source}: length=${ref.length}`);
    }
  };
  
  // Add primary photo
  if (props.restaurantData.primary_photo) {
    addPhotoIfValid(props.restaurantData.primary_photo, 'primary_photo');
  }
  
  // Add other photos
  if (props.restaurantData.photos && Array.isArray(props.restaurantData.photos)) {
    console.log(`Checking ${props.restaurantData.photos.length} photos from restaurant.photos`);
    // Log the first photo to see its structure
    if (props.restaurantData.photos.length > 0) {
      console.log('First photo structure:', props.restaurantData.photos[0]);
    }
    props.restaurantData.photos.forEach((photo, index) => {
      addPhotoIfValid(photo, `photos[${index}]`);
    });
  }
  
  // Check cache for additional photos if we don't have enough
  if (photosToProcess.length < MAX_PHOTOS && props.restaurantData.place_id && restaurantStore.photoCache[props.restaurantData.place_id]) {
    const cachedPhotos = restaurantStore.photoCache[props.restaurantData.place_id];
    console.log(`Checking ${cachedPhotos.length} photos from cache`);
    cachedPhotos.forEach((photo, index) => {
      addPhotoIfValid(photo, `cache[${index}]`);
    });
  }
  
  console.log(`Found ${photosToProcess.length} photos to process`);
  
  // If no photos found, try to load them
  if (photosToProcess.length === 0 && props.restaurantData.place_id) {
    console.log('No photos found, will wait for loadAdditionalPhotos to complete');
    return;
  }
  
  // Process photos
  processedPhotos.value = await Promise.all(
    photosToProcess.map(async (photo) => {
      const id = `${uniqueComponentId.value}-${photo.reference}`;
      loadingStates.value[id] = true;

      const url = await fetchPhotoUrl(photo.reference);

      return {
        id,
        reference: photo.reference,
        url,
        width: photo.width ?? 450,
        height: photo.height ?? 350,
        failed: !url
      };
    })
  );
  
  console.log(`Processed ${processedPhotos.value.length} photos, ${validPhotos.value.length} are valid`);
  
  // Update swiper after processing
  updateSwiper();
}

function isValidPhotoReference(ref: any): boolean {
  // Google's new photo references can be much longer than the old ones
  // Old references were ~100-300 chars, new ones can be 600+ chars
  return ref && typeof ref === 'string' && ref.length > 10 && ref.length < 1000;
}

function handleImageLoad(photoId: string) {
  loadingStates.value[photoId] = false;
}

function handleImageError(event: Event, photoId: string) {
  const img = event.target as HTMLImageElement;
  loadingStates.value[photoId] = false;
  
  // Mark photo as failed
  const photo = processedPhotos.value.find(p => p.id === photoId);
  if (photo) {
    photo.failed = true;
  }
  
  // Set placeholder
  img.src = placeholderImage;
  
  // Update swiper if needed
  if (validPhotos.value.length === 0) {
    updateSwiper();
  }
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
  
  if (props.restaurantData.photos && props.restaurantData.photos.length >= MAX_PHOTOS) {
    console.log(`Already have ${props.restaurantData.photos.length} photos, not loading more`);
    return;
  }
  
  isLoadingMorePhotos.value = true;

  try {
    let photosUpdated = false;
    
    if (restaurantStore.photoCache[placeId] && restaurantStore.photoCache[placeId].length > 0) {
      updateRestaurantPhotos(restaurantStore.photoCache[placeId]);
      photosUpdated = true;
    } else {
      const photos = await restaurantStore.getRestaurantPhotos(placeId);
      
      if (photos && photos.length > 0) {
        updateRestaurantPhotos(photos);
        photosUpdated = true;
      }
    }
    
    // Process photos after updating restaurant photos
    // Use nextTick to ensure Vue has updated the reactive data
    if (photosUpdated) {
      await nextTick();
      await processPhotos();
    }
  } catch (error) {
    console.error("Error fetching photos:", error);
  } finally {
    // Ensure loading indicator is hidden after all processing is complete
    isLoadingMorePhotos.value = false;
  }
};

const updateRestaurantPhotos = (photos: any[]) => {
  if (!props.restaurantData) return;
  
  if (!props.restaurantData.photos) {
    props.restaurantData.photos = [];
  }
  
  const newPhotos = photos
    .filter(photo => photo && (photo.reference || photo.photo_reference))
    .map(photo => ({
      reference: photo.reference || photo.photo_reference,
      width: photo.width || 450,
      height: photo.height || 350
    }));
  
  if (newPhotos.length > 0) {
    const existingRefs = props.restaurantData.photos?.map(p => p.reference) || [];
    const uniqueNewPhotos = newPhotos.filter(p => !existingRefs.includes(p.reference));
    
    props.restaurantData.photos = [...props.restaurantData.photos, ...uniqueNewPhotos];
  }
};

const calculateYellowWidth = (rating: number) => {
  return Math.min(Math.max(Math.floor((rating / 5) * 100), 0), 100);
};

onMounted(() => {
  if (props.restaurantData) {
    // Process initial photos immediately
    processPhotos().then(() => {
      // Then load additional photos
      loadAdditionalPhotos();
    });
  }
});
watch(() => props.restaurantData?.place_id, async (newPlaceId, oldPlaceId) => {
  if (newPlaceId && newPlaceId !== oldPlaceId) {
    // Cancel any ongoing fetches from previous restaurant
    if (fetchController.value) {
      fetchController.value.abort();
    }
    
    uniqueComponentId.value = Math.random().toString(36).substring(2, 10);
    processedPhotos.value = [];
    loadingStates.value = {};
    
    // Don't auto-update swiper for winner cards
    if (!props.isWinner) {
      // Process initial photos first
      await processPhotos();
      // Then load additional photos
      loadAdditionalPhotos();
    } else {
      // For winner, just process existing photos without loading more
      await processPhotos();
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (fetchController.value) {
    fetchController.value.abort();
  }
});
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

/* Fix swiper sizing issues */
:deep(.swiper) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.swiper-wrapper) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.swiper-slide) {
  width: 100% !important;
  height: 100% !important;
  flex-shrink: 0;
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
