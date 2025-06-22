<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ restaurant.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Map Container -->
      <div id="restaurant-map" class="w-full h-full"></div>
      
      <!-- Floating Info Card -->
      <div class="absolute bottom-4 left-4 right-4 z-10">
        <ion-card class="m-0">
          <ion-card-content class="p-3">
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h3 class="font-semibold text-lg mb-1">{{ restaurant.name }}</h3>
                <p class="text-sm text-gray-600 mb-2" v-if="address">{{ address }}</p>
                
                <div class="flex items-center space-x-4 text-sm">
                  <div class="flex items-center space-x-1">
                    <span>{{ restaurant.rating?.toFixed(1) || 'N/A' }}</span>
                    <div class="flex text-yellow-400 text-xs">
                      <span v-for="i in 5" :key="i">
                        {{ i <= Math.round(restaurant.rating || 0) ? '★' : '☆' }}
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="restaurant.price_level" class="flex">
                    <span class="text-green-600">{{ '$'.repeat(restaurant.price_level) }}</span>
                    <span class="text-gray-300">{{ '$'.repeat(4 - restaurant.price_level) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex space-x-2">
              <ion-button 
                @click="getDirections"
                fill="solid"
                size="small"
                expand="block"
                class="flex-1"
              >
                <ion-icon :icon="navigate" slot="start"></ion-icon>
                Directions
              </ion-button>
              
              <ion-button 
                @click="shareLocation"
                fill="outline"
                size="small"
                expand="block"
                class="flex-1"
              >
                <ion-icon :icon="shareOutline" slot="start"></ion-icon>
                Share
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import '@/types/google-maps';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  modalController
} from '@ionic/vue';
import {
  close,
  navigate,
  shareOutline
} from 'ionicons/icons';
import type { Restaurant } from '@/types/restaurant';

interface Props {
  restaurant: Restaurant;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
}

const props = defineProps<Props>();

let map: google.maps.Map | null = null;
let marker: google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null = null;

const closeModal = () => {
  modalController.dismiss();
};

const initializeMap = () => {
  const mapElement = document.getElementById('restaurant-map');
  if (!mapElement) return;

  // Initialize Google Map
  map = new google.maps.Map(mapElement, {
    center: props.location,
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'simplified' }]
      }
    ],
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true
  });

  // Add marker for the restaurant
  marker = new google.maps.Marker({
    position: props.location,
    map: map,
    title: props.restaurant.name,
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: new google.maps.Size(32, 32)
    },
    animation: google.maps.Animation.DROP
  });

  // Add info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="max-width: 200px;">
        <h4 style="margin: 0 0 8px 0; font-weight: bold;">${props.restaurant.name}</h4>
        ${props.address ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${props.address}</p>` : ''}
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <span>${props.restaurant.rating?.toFixed(1) || 'N/A'} ⭐</span>
          ${props.restaurant.price_level ? `<span>${'$'.repeat(props.restaurant.price_level)}</span>` : ''}
        </div>
      </div>
    `
  });

  // Show info window when marker is clicked
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });

  // Auto-open info window
  setTimeout(() => {
    infoWindow.open(map, marker);
  }, 500);
};

const getDirections = () => {
  const { lat, lng } = props.location;
  
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

const shareLocation = async () => {
  const shareData = {
    title: props.restaurant.name,
    text: `Check out ${props.restaurant.name}${props.address ? ` at ${props.address}` : ''}`,
    url: `https://www.google.com/maps/search/?api=1&query=${props.location.lat},${props.location.lng}`
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log('Error sharing:', err);
      fallbackShare();
    }
  } else {
    fallbackShare();
  }
};

const fallbackShare = () => {
  const url = `https://www.google.com/maps/search/?api=1&query=${props.location.lat},${props.location.lng}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      // You could show a toast here
      console.log('Location copied to clipboard');
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log('Google Maps already loaded');
      resolve(window.google.maps);
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Google Maps script already exists, waiting for load...');
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log('Google Maps loaded from existing script');
          clearInterval(checkLoaded);
          resolve(window.google.maps);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Timeout waiting for Google Maps to load'));
      }, 10000);
      return;
    }

    console.log('Loading Google Maps script...');
    
    // Create script element
    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file'));
      return;
    }
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded, checking API...');
      // Add a small delay to ensure all APIs are ready
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log('Google Maps API ready');
          resolve(window.google.maps);
        } else {
          console.error('Google Maps API not ready after script load');
          reject(new Error('Google Maps API not available after script load'));
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

onMounted(async () => {
  try {
    await loadGoogleMaps();
    initializeMap();
  } catch (error) {
    console.error('Error loading Google Maps:', error);
  }
});

onUnmounted(() => {
  // Cleanup
  if (marker) {
    marker.setMap(null);
  }
  if (map) {
    map = null;
  }
});
</script>

<style scoped>
#restaurant-map {
  height: 100vh;
  width: 100%;
}
</style>
