# RestaurantChooser.vue
<template>
   <ion-page>
    <ion-header class="ion-no-border">
      <div class="search-section">
        <div class="search-container">
          <!-- Searchbar -->
          <ion-searchbar v-model="searchQuery" placeholder="Search address" @ionInput="handleSearchInput"
            @ionFocus="searchBarFocused = true" @ionBlur="handleSearchBlur" class="address-searchbar">
          </ion-searchbar>

          <!-- Counter below searchbar -->
          <div class="counter-display">
            <span class="justify-center text-white text-xl">{{ restaurantStore.restaurantCounter }}</span>
          </div>

          <!-- Dropdown container for suggestions and location button -->
          <div v-if="searchBarFocused || addressSuggestions.length > 0" class="dropdown-container">
            <!-- Location button -->
            <ion-list class="use-location-button mx-auto" @click="getUserLocation">
              <ion-icon :icon="locationOutline" class="location-icon"></ion-icon>
              <span>Use current location</span>
            </ion-list>

            <!-- Address suggestions -->
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
    <!-- Restaurant Competition View -->
    <ion-content v-if="hasLocation" class="main-content">
      <ion-grid class="h-full">
        <RetryConnection v-if="loadError" message="Unable to load restaurants. Please check your connection."
          @retry="handleRetry" />

        <div v-else-if="loading" class="flex justify-center items-center h-full">
          <ion-spinner></ion-spinner>
        </div>

        <template v-else>
          <!-- Competition View -->
          <ion-row v-if="!winner" class="h-full flex justify-between items-center restaurant-row">
            <ion-col class="flex justify-center items-center">
              <RestaurantCard :restaurantData="restaurant1" @chooseRestaurant="handleRestaurantChoice" />
            </ion-col>
            <ion-col class="flex justify-center items-center">
              <RestaurantCard :restaurantData="restaurant2" @chooseRestaurant="handleRestaurantChoice" />
            </ion-col>
          </ion-row>

          <!-- Winner View -->
          <ion-row v-else class="h-full flex justify-center items-start">
            <ion-col class="flex flex-col items-center">
              <div class="w-full flex justify-between items-center mb-4">
                <div class="flex-1"></div>
                <h2 class="text-2xl font-bold flex-1 text-center">Winner!</h2>
                <div class="flex-1 flex justify-end">
                  <ion-button fill="clear" @click="handleShare">
                    <ion-icon :icon="share" class="text-white" />
                  </ion-button>
                </div>
              </div>

              <RestaurantCard :restaurantData="winner" class="winner-card" />

              <div class="mt-4 restaurant-details">
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import {
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonHeader, IonToolbar,
  IonTitle, IonButton, IonIcon, IonSearchbar, IonList, IonItem, IonLabel,
  IonSpinner, toastController, actionSheetController
} from '@ionic/vue';
import { 
  share, 
  clipboardOutline, 
  mailOutline, 
  navigateOutline,
  locationOutline 
} from 'ionicons/icons';
import RestaurantCard from '@/components/RestaurantCard.vue';
import RetryConnection from '@/components/RetryConnection.vue';

// Initialize store and refs
const restaurantStore = useRestaurantStore();
const searchQuery = ref('');
const addressSuggestions = ref<any[]>([]);
const hasLocation = ref(false);
const loading = ref(false);
const loadError = ref(false);
const restaurant1 = ref<any>(null);
const restaurant2 = ref<any>(null);
const winner = ref<any>(null);
const searchBarFocused = ref(false);
const BASE_URL = 'http://127.0.0.1:8000/api';

const handleRestaurantChoice = async (chosenRestaurant: any) => {
  if (restaurantStore.restaurantCounter === 0) {
    winner.value = chosenRestaurant;
    restaurant1.value = null;
    restaurant2.value = null;
  } else {
    const nextRestaurant = restaurantStore.getNewRestaurant();
    if (!nextRestaurant) return;

    if (chosenRestaurant.place_id === restaurant1.value?.place_id) {
      restaurant2.value = nextRestaurant;
    } else {
      restaurant1.value = nextRestaurant;
    }
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
  console.log('hello');
  // await fetchInitialRestaurants();
}

const handleSearchInput = debounce(async (event: CustomEvent) => {
  const query = event.detail.value?.trim();
  if (!query) {
    addressSuggestions.value = [];
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/restaurants/address-suggestions`, {
      params: { input: query }
    });

    addressSuggestions.value = response.data.predictions;
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
  }
}, 1000);

const selectAddress = async (suggestion: any) => {
  try {
    loading.value = true;
    await restaurantStore.fetchRestaurantsByAddress(suggestion.place_id);

    restaurant1.value = restaurantStore.getNewRestaurant();
    restaurant2.value = restaurantStore.getNewRestaurant();

    hasLocation.value = true;
    addressSuggestions.value = [];
  } catch (error) {
    console.error('Error loading restaurants:', error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};
const handleSearchBlur = () => {
  // Small delay to allow for clicking the location button
  setTimeout(() => {
    searchBarFocused.value = false;
  }, 200);
};

const getUserLocation = async () => {
  try {
    loading.value = true;
    
    const position: GeolocationPosition = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });

    const { latitude, longitude } = position.coords;
    
    // Get address from coordinates using reverse geocoding
    const response = await axios.get(`${BASE_URL}/restaurants/reverse-geocode`, {
      params: { lat: latitude, lng: longitude }
    });

    if (response.data && response.data.place_id) {
      await selectAddress(response.data);
      searchQuery.value = response.data.description || 'Current Location';
    }

  } catch (error) {
    console.error('Error getting location:', error);
    const toast = await toastController.create({
      message: 'Unable to get your location. Please enter it manually.',
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
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

.restaurant-details {
  width: 100%;
  padding: 1rem;
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

.counter-display {
  text-align: center;
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
</style>
