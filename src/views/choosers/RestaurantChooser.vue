# RestaurantChooser.vue
<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <div class="search-section">
        <div class="search-container">
          <ion-searchbar v-model="searchQuery" placeholder="Search address" @ionInput="handleSearchInput"
            @ionFocus="searchBarFocused = true" @ionBlur="handleSearchBlur" class="address-searchbar">
          </ion-searchbar>

          <div class="flex items-center justify-between w-full px-4">
            <div class="w-10"></div>
            <span class="text-white text-xl">
              {{ !winner ? restaurantStore.restaurantCounter : '' }}
            </span>
            <ion-buttons>
              <ion-button @click="handleRefresh" :disabled="!showRefreshButton"
                :class="{ 'opacity-0': !showRefreshButton }">
                <ion-icon :icon="refresh" />
              </ion-button>
            </ion-buttons>
          </div>

          <div v-if="searchBarFocused || addressSuggestions.length > 0" class="dropdown-container">
            <ion-list class="use-location-button mx-auto" @click="getUserLocation">
              <ion-icon :icon="locationOutline" class="location-icon"></ion-icon>
              <span>Use current location</span>
            </ion-list>

            <ion-list v-if="addressSuggestions.length > 0" class="address-suggestions">
              <ion-item v-for="suggestion in addressSuggestions" :key="suggestion.place_id" button
                @click="selectAddress(suggestion)">
                <ion-label>{{ suggestion.description }}</ion-label>
              </ion-item>
            </ion-list>
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
            <ion-row class="h-full flex justify-between items-center restaurant-row">
              <ion-col class="flex justify-center items-center">
                <!-- Show skeleton while loading first restaurant -->
                <div :class="{'slide-out-right': animateRestaurant1, 'slide-in-left': newRestaurantAnimation1}"
                  class="restaurant-container">
                  <RestaurantCard v-if="loading" />
                  <RestaurantCard v-else :restaurantData="restaurant1" @chooseRestaurant="handleRestaurantChoice" />
                </div>
              </ion-col>
              <ion-col class="flex justify-center items-center">
                <!-- Show skeleton while loading second restaurant -->
                <div :class="{ 'slide-out-right': animateRestaurant2, 'slide-in-left': newRestaurantAnimation2 }"
                  class="restaurant-container">
                  <RestaurantCard v-if="loading" />
                  <RestaurantCard v-else :restaurantData="restaurant2" @chooseRestaurant="handleRestaurantChoice" />
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

              <RestaurantCard :restaurantData="winner" class="winner-card" />
              <div class="flex-1 flex justify-end">
                <ion-button fill="clear" @click="handleShare">
                  <ion-icon :icon="shareOutline" class="bg-gray-900 rounded-xl p-2 text-white" />
                </ion-button>
              </div>
              <div class="mt-4 w-full p-2">
                <div class="details-section">
                  <h3 class="text-xl font-semibold mb-4">Details</h3>
                  <p><strong>Address:</strong> {{ winner.vicinity }}</p>
                  <p><strong>Rating:</strong> {{ winner.rating }} ⭐️ ({{ winner.user_ratings_total }} reviews)</p>
                  <p v-if="winner.opening_hours"><strong>Open now:</strong> {{ winner.opening_hours.open_now ? 'Yes' :
                    'No' }}</p>
                  <p v-if="winner.price_level"><strong>Price:</strong> {{ '💰'.repeat(winner.price_level) }}</p>
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

// Initialize store and refs
const restaurantStore = useRestaurantStore();
const searchQuery = ref('');
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
const router = useRouter()
const { user } = useUser();

const handleRestaurantChoice = async (chosenRestaurant: any) => {
  if (restaurantStore.restaurantCounter === 0) {
    winner.value = chosenRestaurant;
    
    if (winner.value.has_additional_photos) {
      await restaurantStore.getRestaurantPhotos(winner.value.place_id);
    }
    
    restaurant1.value = null;
    restaurant2.value = null;
    return;
  }

  const isRestaurant1Clicked = chosenRestaurant.place_id === restaurant1.value?.place_id;
  const restaurantToAnimate = isRestaurant1Clicked ? animateRestaurant2 : animateRestaurant1;
  const newRestaurantAnimation = isRestaurant1Clicked ? newRestaurantAnimation2 : newRestaurantAnimation1;
  const restaurantToReplace = isRestaurant1Clicked ? restaurant2 : restaurant1;

  // Wait for next tick before starting animation
  await nextTick();
  restaurantToAnimate.value = true;

  setTimeout(async () => {
    try {
      const nextRestaurant = restaurantStore.getNewRestaurant();
      if (!nextRestaurant) return;

      restaurantToAnimate.value = false;
      
      await nextTick();
      restaurantToReplace.value = nextRestaurant;
      
      // Wait for next render before starting slide-in
      await nextTick();
      newRestaurantAnimation.value = true;

      setTimeout(() => {
        newRestaurantAnimation.value = false;
      }, 300); // Match animation duration

    } catch (error) {
      console.error('Error replacing restaurant:', error);
      loadError.value = true;
    }
  }, 300); // Match animation duration
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
  let timeout: NodeJS.Timeout;
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
  loadError.value = false;

  if (searchQuery.value === 'Current Location') {
    try {
      restaurant1.value = null;
      restaurant2.value = null;

      // Try geolocation again (timeout built in)
      const position = await getGeolocationWithTimeout();
      const { latitude, longitude } = position.coords;
      lastCoords.value = { latitude, longitude };

      // Store handles timeout
      await restaurantStore.fetchRestaurantsByLocation(latitude, longitude);

      const newRestaurant1 = restaurantStore.getNewRestaurant();
      const newRestaurant2 = restaurantStore.getNewRestaurant();

      if (!newRestaurant1 || !newRestaurant2) {
        throw new Error('No restaurants received');
      }

      restaurant1.value = newRestaurant1;
      restaurant2.value = newRestaurant2;
    } catch (error) {
      console.error('Error retrying geolocation or fetch:', error);
      restaurant1.value = null;
      restaurant2.value = null;
      loadError.value = true;
    }
  } else if (lastPlaceId.value) {
    try {
      restaurant1.value = null;
      restaurant2.value = null;

      // Store handles timeout
      await restaurantStore.fetchRestaurantsByAddress(lastPlaceId.value);

      const newRestaurant1 = restaurantStore.getNewRestaurant();
      const newRestaurant2 = restaurantStore.getNewRestaurant();

      if (!newRestaurant1 || !newRestaurant2) {
        throw new Error('No restaurants received');
      }

      restaurant1.value = newRestaurant1;
      restaurant2.value = newRestaurant2;
    } catch (error) {
      console.error('Error retrying address fetch:', error);
      restaurant1.value = null;
      restaurant2.value = null;
      loadError.value = true;
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

    // Get user location with timeout (built into the geolocation API)
    const position = await getGeolocationWithTimeout();
    const { latitude, longitude } = position.coords;
    lastCoords.value = { latitude, longitude };

    // Store already handles timeouts
    await restaurantStore.fetchRestaurantsByLocation(latitude, longitude);

    const newRestaurant1 = restaurantStore.getNewRestaurant();
    const newRestaurant2 = restaurantStore.getNewRestaurant();

    if (!newRestaurant1 || !newRestaurant2) {
      throw new Error('No restaurants received');
    }

    restaurant1.value = newRestaurant1;
    restaurant2.value = newRestaurant2;
    searchQuery.value = 'Current Location';
    addressSuggestions.value = [];
  } catch (error) {
    console.error('Error in getUserLocation:', error);
    restaurant1.value = null;
    restaurant2.value = null;
    loadError.value = true;

    const toast = await toastController.create({
      message: 'Unable to get your location. Please try again or enter manually.',
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
</script>

<style scoped>
.restaurant-row {
  height: 50vh;
}

.address-searchbar {
  --background: white;
  --color: black;
  --placeholder-color: #666;
  border-radius: 8px;
}

.address-suggestions {
  position: absolute;
  width: 100%;
  z-index: 1000;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  bottom: 75%;
  left: 0;
}

.transparent-toolbar {
  --background: transparent;
  --border-width: 0;
  --border-color: transparent;
}


.details-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
}
.use-location-button {
  position: absolute;
  bottom: 80%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  width: 80%;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  z-index: 2;
}

.use-location-button:hover {
  background-color: black;
}

.location-icon {
  font-size: 20px;
}

.search-section {
  position: fixed;
  top: 5%; /* Move higher up */
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
}

/* Update dropdown positions relative to new structure */
.address-suggestions {
  position: absolute;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  bottom: -285%; /* Position relative to search container */
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  margin-top: 45px; /* Space for the location button */
}

.use-location-button {
  border-radius: 8px;
  background: #141414;
  top: 50%;
  left: 0;
  right: 0;
  height: 40px;
  cursor: pointer;
  z-index: 1000;
  width: 95%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 10px; /* Small gap between searchbar and button */
}

.main-content {
  --padding-top: 35%;
}

.restaurant-container {
  transform: translateX(0);
  transition: transform 0.3s ease-out;
  transform-origin: center;
  will-change: transform;
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
