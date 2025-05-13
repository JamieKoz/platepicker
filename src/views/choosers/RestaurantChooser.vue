# RestaurantChooser.vue
<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <div class="fixed top-[5%] left-0 right-0 z-[1000] bg-transparent">
        <div class="relative">
          <!-- Search Bar -->
          <ion-searchbar v-model="searchQuery" placeholder="Search address" @ionInput="handleSearchInput"
            @ionFocus="searchBarFocused = true" @ionBlur="handleSearchBlur" class="text-black rounded-xl address-searchbar">
          </ion-searchbar>
          
          <div v-if="searchBarFocused || addressSuggestions.length > 0" class="absolute left-0 right-0 z-[1001]"> 
            <ion-list class="mx-auto rounded-lg bg-[#1c1c1d] h-10 cursor-pointer w-[95%] shadow-md flex items-center gap-2" 
                     @click="getUserLocation">
              <ion-icon :icon="locationOutline" class="text-[20px]"></ion-icon>
              <span>Use current location</span>
            </ion-list>
            
            <ion-list v-if="addressSuggestions.length > 0" 
                     class="absolute rounded-lg shadow-md max-h-[400px] overflow-y-auto top-[45px] left-0 right-0 bg-white">
              <ion-item v-for="suggestion in addressSuggestions" :key="suggestion.place_id" button
                @click="selectAddress(suggestion)">
                <ion-label>{{ suggestion.description }}</ion-label>
              </ion-item>
            </ion-list>
          </div>
          
          <div class="flex items-center justify-center w-full px-4 mt-3">
            <span class="text-white text-xl" v-show="searchedValue !== null">
              {{ !winner ? restaurantStore.restaurantCounter : '' }}
            </span>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content v-if="hasLocation" class="main-content">
      <ion-grid class="h-full">

        <RetryConnection v-if="loadError" message="Unable to load restaurants. Please check your connection."
          @retry="handleRetry" />

        <template v-else>
          <!-- Competition View -->
          <template v-if="!winner">
            <ion-row class="h-full flex justify-between items-center flex-col restaurant-row">
              <ion-col class="flex justify-center items-center">
                <!-- Show skeleton while loading first restaurant -->
                <div :class="{'slide-out-right': animateRestaurant1, 'slide-in-left': newRestaurantAnimation1}"
                  class="transform-none transition-transform duration-300 ease-out origin-center will-change-transform ">
                  <RestaurantCard v-if="loading" key="loading-card-1" />
                  <RestaurantCard v-else :restaurantData="restaurant1" @chooseRestaurant="handleRestaurantChoice" :key="`restaurant-1-${restaurant1?.place_id || 'empty'}`"  />
                </div>
              </ion-col>
              <ion-col class="flex justify-center items-center">
                <!-- Show skeleton while loading second restaurant -->
                <div :class="{ 'slide-out-right': animateRestaurant2, 'slide-in-left': newRestaurantAnimation2 }"
                  class="transform-none transition-transform duration-300 ease-out origin-center will-change-transform ">
                  <RestaurantCard v-if="loading" key="loading-card-2"/>
                  <RestaurantCard v-else :restaurantData="restaurant2" @chooseRestaurant="handleRestaurantChoice" :key="`restaurant-2-${restaurant2?.place_id || 'empty'}`" />
                </div>
              </ion-col>
            </ion-row>
          </template>

          <!-- Winner View -->
          <ion-row v-else class="h-full flex justify-center items-start">
            <ion-col class="flex flex-col items-center">
              <div class="w-full flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold flex-1 text-center">Winner!</h2>
              </div>

              <RestaurantCard :restaurantData="winner" class="winner-card" :key="`winner-${winner?.place_id || 'empty'}`" />
              <div class="flex-1 flex justify-end">
                <ion-button fill="clear" @click="handleShare">
                  <ion-icon :icon="shareOutline" class="bg-gray-900 rounded-xl p-2 text-white" />
                </ion-button>

                <ion-button @click="handleRefresh" :disabled="!showRefreshButton"
                  :class="{ 'opacity-0': !showRefreshButton }" fill="clear">
                  <ion-icon :icon="refresh" class="bg-gray-900 rounded-xl p-2 text-white"/>
                </ion-button>
              </div>
              <div class="mt-4 w-full p-2">
                <div class="bg-white/10 rounded-lg p-4">
                  <h3 class="text-xl font-semibold mb-4">Details</h3>
                  <p><strong>Address:</strong> {{ winner.vicinity }}</p>
                  <p><strong>Rating:</strong> {{ winner.rating }} ⭐️ ({{ winner.user_ratings_total }} reviews)</p>
                  <p v-if="winner.opening_hours"><strong>Open now:</strong> {{ winner.opening_hours.open_now ? 'Yes' :
                    'No' }}</p>
                  <p v-if="winner.price_level"><strong>Price:</strong> {{ '$'.repeat(winner.price_level) }}</p>
                </div>
              </div>
            </ion-col>
          </ion-row>
        </template>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import api from '@/api/axios';
import {
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonHeader, IonToolbar,
  IonTitle, IonButton, IonIcon, IonSearchbar, IonList, IonItem, IonLabel,
  IonButtons, toastController, actionSheetController
} from '@ionic/vue';

import { refresh, clipboardOutline, mailOutline, navigateOutline, locationOutline, shareOutline } from 'ionicons/icons';
import RestaurantCard from '@/components/RestaurantCard.vue';
import RetryConnection from '@/components/RetryConnection.vue';
import { useUser } from '@clerk/vue';
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';

const restaurantStore = useRestaurantStore();
const searchQuery = ref('');
const searchedValue = ref<string | null>(null);
const addressSuggestions = ref<any[]>([]);
const hasLocation = ref(false);
const loading = computed(() => restaurantStore.isLoading);
const loadError = ref(false);
const restaurant1 = ref<any>(null);
const restaurant2 = ref<any>(null);
const winner = ref<any>(null);
const lastPlaceId = ref<string | null>(null);
const lastCoords = ref<{ latitude: number; longitude: number } | null>(null);
const searchBarFocused = ref(false);
const animateRestaurant1 = ref(false);
const animateRestaurant2 = ref(false);
const newRestaurantAnimation1 = ref(false);
const newRestaurantAnimation2 = ref(false);
const lastRetryAttempt = ref(0);
const RETRY_COOLDOWN_MS = 5000;
const router = useRouter()
const { user } = useUser();
interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}
const handleRestaurantChoice = async (chosenRestaurant: any) => {
  // Validate the chosen restaurant has a place_id
  if (!chosenRestaurant || !chosenRestaurant.place_id) {
    console.error("Invalid restaurant selected", chosenRestaurant);
    return;
  }

  // Safely check restaurantCounter to avoid n.value is undefined
  const remainingRestaurants = restaurantStore.restaurantCounter || 0;

  // If we're down to the last comparison, this is the winner
  if (remainingRestaurants === 0) {
    // Set the winner first
    winner.value = chosenRestaurant;

    // Then fetch additional photos if needed - this happens after the UI updates
    if (winner.value && winner.value.place_id) {
      try {
        // Fetch photos for the winner in the background
        restaurantStore.getRestaurantPhotos(winner.value.place_id)
          .then(photos => {
            console.log(`Loaded ${photos.length} photos for winner`);
          })
          .catch(err => {
            console.error("Error loading photos for winner:", err);
          });
      } catch (error) {
        console.error("Error initiating photo load:", error);
      }
    }

    // Clear other restaurants
    restaurant1.value = null;
    restaurant2.value = null;
    return;
  }

  const isRestaurant1Clicked =
    restaurant1.value &&
    chosenRestaurant.place_id === restaurant1.value.place_id;

  const restaurantToAnimate = isRestaurant1Clicked ? animateRestaurant2 : animateRestaurant1;
  const newRestaurantAnimation = isRestaurant1Clicked ? newRestaurantAnimation2 : newRestaurantAnimation1;
  const restaurantToReplace = isRestaurant1Clicked ? restaurant2 : restaurant1;

  // Wait for next tick before starting animation
  await nextTick();
  restaurantToAnimate.value = true;

  // Use a promise to handle the animation timing
  const animationPromise = new Promise<void>(resolve => {
    setTimeout(() => resolve(), 300); // Match animation duration
  });

  try {
    // Wait for animation to complete
    await animationPromise;
    // Get next restaurant
    const nextRestaurant = restaurantStore.getNewRestaurant();
    if (!nextRestaurant) {
      console.warn("No next restaurant available");
      return;
    }

    // Reset animation flag for exiting restaurant
    restaurantToAnimate.value = false;

    // Set the new restaurant on next tick to ensure clean DOM update
    await nextTick();
    restaurantToReplace.value = nextRestaurant;

    // Wait for next render before starting slide-in animation
    await nextTick();
    newRestaurantAnimation.value = true;

    // Reset the slide-in animation after it completes
    setTimeout(() => {
      newRestaurantAnimation.value = false;
    }, 300); // Match animation duration

  } catch (error) {
    console.error('Error replacing restaurant:', error);
    loadError.value = true;
  }
};

const handleShare = async () => {
  if (!winner.value) return;

  const actionSheet = await actionSheetController.create({
    header: 'Share Restaurant',
    cssClass: 'custom-action-sheet',
    buttons: [
      {
        text: 'Copy Name',
        cssClass: 'custom-button',
        icon: clipboardOutline,
        handler: async () => {
          try {
            await navigator.clipboard.writeText(winner.value.name);
            const toast = await toastController.create({
              message: 'Restaurant name copied!',
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();
          } catch (error) {
            console.error('Error copying to clipboard:', error);
          }
        }
      },
      {
        text: 'Open in Maps',
        cssClass: 'custom-button',
        icon: navigateOutline,
        handler: () => {
          window.open(`https://www.google.com/maps/place/?q=place_id:${winner.value.place_id}`, '_blank');
        }
      },
      {
        text: 'Share via Email',
        cssClass: 'custom-button',
        icon: mailOutline,
        handler: () => {
          const subject = encodeURIComponent(`Check out ${winner.value.name}`);
          const body = encodeURIComponent(
            `${winner.value.name}\n\nAddress: ${winner.value.vicinity}\nRating: ${winner.value.rating} ⭐️\n\nView on Google Maps: https://www.google.com/maps/place/?q=place_id:${winner.value.place_id}`
          );
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }
      }
    ]
  });

  await actionSheet.present();
};

// Helper debounce function
function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function handleRetry() {
  const now = Date.now();
  if (now - lastRetryAttempt.value < RETRY_COOLDOWN_MS) {
    const remainingCooldown = Math.ceil((RETRY_COOLDOWN_MS - (now - lastRetryAttempt.value)) / 1000);
    
    const toast = await toastController.create({
      message: `Please wait ${remainingCooldown} seconds before retrying again.`,
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
    return;
  }
  
  // Update the last retry timestamp
  lastRetryAttempt.value = now;
  
  loadError.value = false;
  
  if (searchedValue.value === 'Current Location') {
    try {
      restaurant1.value = null;
      restaurant2.value = null;
      
   const position = await getGeolocation({
      enableHighAccuracy: true,
      timeout: 10000
    });
    
    const { latitude, longitude } = position.coords;
    lastCoords.value = { latitude, longitude };
      
      // Create a timeout promise for the restaurant fetch
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Restaurant fetch timed out')), 10000);
      });
      
      // Use Promise.race for better timeout handling
      await Promise.race([
        restaurantStore.fetchRestaurantsByLocation(latitude, longitude),
        timeoutPromise
      ]);
      
      const newRestaurant1 = restaurantStore.getNewRestaurant();
      const newRestaurant2 = restaurantStore.getNewRestaurant();
      
      if (!newRestaurant1 || !newRestaurant2) {
        throw new Error('No restaurants received from the store');
      }
      
      restaurant1.value = newRestaurant1;
      restaurant2.value = newRestaurant2;
    } catch (error: unknown) {
      console.error('Error retrying geolocation or fetch:', error);
      restaurant1.value = null;
      restaurant2.value = null;
      loadError.value = true;
      let errorMessage = 'Unable to load restaurants. Please try again later.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        
        if (error.message.includes('timed out')) {
          errorMessage = 'Request timed out. Please check your internet connection and try again.';
        }
      }
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 429) {
          errorMessage = 'Too many requests. Please try again in a moment.';
        }
      }
        
      const toast = await toastController.create({
        message: errorMessage,
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  } else if (lastPlaceId.value && searchedValue.value) {
    try {
      restaurant1.value = null;
      restaurant2.value = null;
      
      // Create a timeout promise for better error handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Restaurant fetch timed out')), 10000);
      });
      
      await Promise.race([
        restaurantStore.fetchRestaurantsByAddress(lastPlaceId.value),
        timeoutPromise
      ]);
      
      const newRestaurant1 = restaurantStore.getNewRestaurant();
      const newRestaurant2 = restaurantStore.getNewRestaurant();
      
      if (!newRestaurant1 || !newRestaurant2) {
        throw new Error('No restaurants received from the store');
      }
      
      restaurant1.value = newRestaurant1;
      restaurant2.value = newRestaurant2;
    } catch (error: unknown) {
      console.error('Error retrying address fetch:', error);
      restaurant1.value = null;
      restaurant2.value = null;
      loadError.value = true;
      let errorMessage = 'Unable to load restaurants for this location. Please try a different address.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        
        if (error.message.includes('timed out')) {
          errorMessage = 'Request timed out. Please check your internet connection and try again.';
        }
      }
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 429) {
          errorMessage = 'Too many requests. Please try again in a moment.';
        }
      }
        
      const toast = await toastController.create({
        message: errorMessage,
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  } else {
    const toast = await toastController.create({
      message: 'Please enter a location to search',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
}
const handleSearchInput = debounce(async (event: CustomEvent) => {
  const query = event.detail.value?.trim();
  if (!query) {
    addressSuggestions.value = [];
    return;
  }

  try {
    const response = await api.get(`/restaurants/address-suggestions`, {
      params: { input: query }
    });

    addressSuggestions.value = response.data.predictions;
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
  }
}, 1000);

const selectAddress = async (suggestion: any) => {
  try {
    searchQuery.value = suggestion.description;
    searchedValue.value = suggestion.description;
    searchBarFocused.value = false;
    addressSuggestions.value = [];
    hasLocation.value = true;
    lastPlaceId.value = suggestion.place_id;

    restaurant1.value = null;
    restaurant2.value = null;
    loadError.value = false;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 5000);
    });

    await Promise.race([
      restaurantStore.fetchRestaurantsByAddress(suggestion.place_id),
      timeoutPromise
    ]);

    const newRestaurant1 = restaurantStore.getNewRestaurant();
    const newRestaurant2 = restaurantStore.getNewRestaurant();

    if (!newRestaurant1 || !newRestaurant2) {
      throw new Error('No restaurants received');
    }

    restaurant1.value = newRestaurant1;
    restaurant2.value = newRestaurant2;
  } catch (error) {
    console.error('Error loading restaurants:', error);
    loadError.value = true;
    restaurant1.value = null;
    restaurant2.value = null;
  }
};

const handleSearchBlur = () => {
  setTimeout(() => {
    searchBarFocused.value = false;
  }, 200);
};

const getUserLocation = async () => {
  try {
    restaurant1.value = null;
    restaurant2.value = null;
    hasLocation.value = true;
    loadError.value = false;
    searchedValue.value = "Current Location";

    // Get user location with timeout (built into the geolocation API)
 const position = await getGeolocation({
      enableHighAccuracy: true,
      timeout: 10000
    });
    
    if (!position || !position.coords) {
      throw new Error('Invalid geolocation response');
    }
    
    const { latitude, longitude } = position.coords;
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Invalid coordinates received from geolocation');
    }
    
    lastCoords.value = { latitude, longitude };

    // Store already handles timeouts
    await restaurantStore.fetchRestaurantsByLocation(latitude, longitude);
    
    // Check if we actually got restaurants back
    if (!restaurantStore.restaurants || restaurantStore.restaurants.length < 2) {
      throw new Error('Not enough restaurants found in this area');
    }

    const newRestaurant1 = restaurantStore.getNewRestaurant();
    const newRestaurant2 = restaurantStore.getNewRestaurant();

    if (!newRestaurant1 || !newRestaurant2) {
      throw new Error('No restaurants received');
    }

    restaurant1.value = newRestaurant1;
    restaurant2.value = newRestaurant2;
    searchQuery.value = '';
    addressSuggestions.value = [];
  } catch (error) {
    console.error('Error in getUserLocation:', error);
    restaurant1.value = null;
    restaurant2.value = null;
    loadError.value = true;

    let errorMessage = 'Unable to get your location. Please try again or enter manually.';
    
    if (error instanceof Error) {
      if (error.name === 'GeolocationPositionError') {
        if (error.message.includes('timed out')) {
          errorMessage = 'Location request timed out. Please try again.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Location permission denied. Please allow location access or enter address manually.';
        }
      } else if (error.message.includes('restaurants')) {
        errorMessage = 'No restaurants found in this area. Please try a different location.';
      }
    }

    const toast = await toastController.create({
      message: errorMessage,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
};
const getGeolocationWithTimeout = async (timeoutMs = 5000): Promise<GeolocationPosition> => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 0
    });
  });
};


const showRefreshButton = computed(() => {
  return restaurantStore.restaurantCounter === 0 && winner.value !== null;
});

const handleRefresh = async () => {

  try {
    if (!user.value) {
      await router.push('/sign-in');
      return;
    }
  } catch (error) {
    console.error("Error during refresh: ", error);
  }

  winner.value = null;
  await handleRetry();
};


const getGeolocation = async (options: GeolocationOptions = {}): Promise<GeolocationPosition> => {
  try {
    // Try to use Capacitor Geolocation if we're on a native platform
    if (Capacitor.isNativePlatform()) {
      // Check if the Geolocation plugin is available in Capacitor.Plugins
      if (Capacitor.Plugins && Capacitor.Plugins.Geolocation) {
        console.log('Using Capacitor Plugins.Geolocation');
        
        // Try to check permissions first
        try {
          const permStatus = await Capacitor.Plugins.Geolocation.checkPermissions();
          if (permStatus.location !== 'granted') {
            const requested = await Capacitor.Plugins.Geolocation.requestPermissions();
            if (requested.location !== 'granted') {
              throw new Error('Location permission denied');
            }
          }
        } catch (permError) {
          console.warn('Error checking permissions:', permError);
          // Continue anyway - some older plugin versions might not have checkPermissions
        }
        
        // Get position using Capacitor plugin
        return await Capacitor.Plugins.Geolocation.getCurrentPosition({
          enableHighAccuracy: options.enableHighAccuracy || true,
          timeout: options.timeout || 10000,
          maximumAge: options.maximumAge || 0
        });
      }
    }
    
    // Fall back to browser geolocation API
    console.log('Using browser Geolocation API');
    return await getGeolocationWithTimeout(options.timeout || 10000);
  } catch (error) {
    console.error('Error getting location, falling back to browser API:', error);
    // Final fallback to browser API
    return await getGeolocationWithTimeout(options.timeout || 10000);
  }
};
</script>

<style scoped>
.restaurant-row {
  height: calc(100vh - 160px);
}

.address-searchbar {
  --background: white;
  --placeholder-color: #666;
}

.transparent-toolbar {
  --background: transparent;
  --border-width: 0;
  --border-color: transparent;
}

.main-content {
  --padding-top: 35%;
}

.slide-out-right {
  transform: translateX(100vw);
}

.slide-in-left {
  animation: slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100vw);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
