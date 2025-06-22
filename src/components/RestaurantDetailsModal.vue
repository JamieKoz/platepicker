<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ restaurant?.name || 'Restaurant Details' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center h-32">
        <ion-spinner></ion-spinner>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <ion-icon :icon="alertCircleOutline" class="text-4xl text-red-500 mb-2"></ion-icon>
        <p class="text-gray-600">Failed to load restaurant details</p>
        <ion-button @click="fetchDetails" fill="outline" size="small" class="mt-2">
          Try Again
        </ion-button>
      </div>

      <!-- Restaurant details -->
      <div v-else-if="details" class="space-y-4">
        <!-- Basic Info -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ restaurant.name }}</ion-card-title>
            <ion-card-subtitle v-if="details.formatted_address">
              {{ details.formatted_address }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <!-- Rating and Price -->
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                <span class="text-sm">{{ restaurant.rating?.toFixed(1) || 'N/A' }}</span>
                <div class="flex text-yellow-400">
                  <span v-for="i in 5" :key="i" class="text-sm">
                    {{ i <= Math.round(restaurant.rating || 0) ? '★' : '☆' }}
                  </span>
                </div>
                <span class="text-xs text-gray-500">
                  ({{ restaurant.user_ratings_total?.toLocaleString() || 0 }} reviews)
                </span>
              </div>
              
              <div v-if="restaurant.price_level" class="flex">
                <span class="text-green-600">{{ '$'.repeat(restaurant.price_level) }}</span>
                <span class="text-gray-300">{{ '$'.repeat(4 - restaurant.price_level) }}</span>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="space-y-2">
              <div v-if="details.formatted_phone_number" class="flex items-center space-x-2">
                <ion-icon :icon="call" class="text-blue-500"></ion-icon>
                <a :href="`tel:${details.formatted_phone_number}`" class="text-blue-600">
                  {{ details.formatted_phone_number }}
                </a>
              </div>
              
              <div v-if="details.website" class="flex items-center space-x-2">
                <ion-icon :icon="globe" class="text-blue-500"></ion-icon>
                <a :href="details.website" target="_blank" class="text-blue-600 truncate">
                  {{ details.website }}
                </a>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Opening Hours -->
        <ion-card v-if="details.opening_hours">
          <ion-card-header>
            <ion-card-title class="text-lg">Opening Hours</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="space-y-1">
              <div 
                v-for="(period, index) in details.opening_hours.weekday_text" 
                :key="index"
                class="flex justify-between text-sm"
                :class="{ 'font-semibold text-green-600': isToday(index) }"
              >
                <span>{{ period.split(': ')[0] }}</span>
                <span>{{ period.split(': ')[1] || 'Closed' }}</span>
              </div>
            </div>
            
            <div v-if="details.opening_hours.open_now !== undefined" class="mt-3 pt-3 border-t">
              <span 
                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                :class="details.opening_hours.open_now ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ details.opening_hours.open_now ? 'Open Now' : 'Closed' }}
              </span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Reviews -->
        <ion-card v-if="details.reviews && details.reviews.length > 0">
          <ion-card-header>
            <ion-card-title class="text-lg">Recent Reviews</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="space-y-4">
              <div 
                v-for="(review, index) in details.reviews.slice(0, 3)" 
                :key="index"
                class="border-b pb-4 last:border-b-0"
              >
                <div class="flex items-start space-x-3">
                  <img 
                    v-if="review.profile_photo_url"
                    :src="review.profile_photo_url" 
                    :alt="review.author_name"
                    class="w-10 h-10 rounded-full object-cover"
                  >
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <h4 class="font-medium text-sm">{{ review.author_name }}</h4>
                      <div class="flex items-center space-x-1">
                        <span class="text-xs">{{ review.rating }}</span>
                        <div class="flex text-yellow-400 text-xs">
                          <span v-for="i in 5" :key="i">
                            {{ i <= review.rating ? '★' : '☆' }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">{{ review.text }}</p>
                    <span class="text-xs text-gray-400">{{ formatDate(review.time) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <ion-button 
            v-if="details.website" 
            :href="details.website" 
            target="_blank" 
            fill="outline"
            expand="block"
          >
            <ion-icon :icon="globe" slot="start"></ion-icon>
            Visit Website
          </ion-button>
          
          <ion-button 
            v-if="details.formatted_phone_number"
            :href="`tel:${details.formatted_phone_number}`"
            fill="outline"
            expand="block"
          >
            <ion-icon :icon="call" slot="start"></ion-icon>
            Call
          </ion-button>
          
          <ion-button 
            @click="showOnMap"
            fill="outline"
            expand="block"
          >
            <ion-icon :icon="map" slot="start"></ion-icon>
            Show on Map
          </ion-button>
          
          <ion-button 
            @click="getDirections"
            fill="outline"
            expand="block"
          >
            <ion-icon :icon="navigate" slot="start"></ion-icon>
            Get Directions
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  modalController
} from '@ionic/vue';
import {
  close,
  call,
  globe,
  alertCircleOutline,
  informationCircleOutline,
  map,
  navigate
} from 'ionicons/icons';
import type { Restaurant } from '@/types/restaurant';
import api from '@/api/axios';
import RestaurantMapModal from '@/components/RestaurantMapModal.vue';

interface RestaurantDetails {
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  reviews?: Array<{
    author_name: string;
    profile_photo_url?: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

interface Props {
  restaurant: Restaurant;
}

const props = defineProps<Props>();

const loading = ref(true);
const error = ref(false);
const details = ref<RestaurantDetails | null>(null);

const closeModal = () => {
  modalController.dismiss();
};

const fetchDetails = async () => {
  if (!props.restaurant.place_id) return;
  
  loading.value = true;
  error.value = false;
  
  try {
    const response = await api.get(`/restaurants/details/${props.restaurant.place_id}`);
    details.value = response.data;
  } catch (err) {
    console.error('Error fetching restaurant details:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const isToday = (dayIndex: number): boolean => {
  const today = new Date().getDay();
  // Convert Sunday (0) to 6, Monday (1) to 0, etc. to match Google's format
  const adjustedToday = today === 0 ? 6 : today - 1;
  return dayIndex === adjustedToday;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

const showOnMap = async () => {
  if (!details.value?.geometry?.location) return;
  
  const mapModal = await modalController.create({
    component: RestaurantMapModal,
    componentProps: {
      restaurant: props.restaurant,
      location: details.value.geometry.location,
      address: details.value.formatted_address
    },
    cssClass: 'restaurant-map-modal'
  });
  
  await mapModal.present();
};

const getDirections = () => {
  if (!details.value?.geometry?.location) return;
  
  const { lat, lng } = details.value.geometry.location;
  const destination = encodeURIComponent(details.value.formatted_address || props.restaurant.name);
  
  // Check if on mobile device
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Try to open in native maps app
    const googleMapsUrl = `https://maps.google.com/maps?daddr=${lat},${lng}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${lat},${lng}`;
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(appleMapsUrl, '_blank');
    } else {
      window.open(googleMapsUrl, '_blank');
    }
  } else {
    // Open in Google Maps web
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  }
};

onMounted(() => {
  fetchDetails();
});
</script>

