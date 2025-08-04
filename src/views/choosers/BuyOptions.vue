<!-- views/choosers/BuyOptions.vue -->
<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <Back-Arrow />
      <div class="grid grid-cols-2 gap-2 h-[calc(100%-4rem)] p-2 w-full">
        <dining-option-card title="Search" icon="search" @click="handleCustomSearch" />
        <dining-option-card title="Dine In" icon="utensils" @click="handleBuy('Dine In')"  />
        <dining-option-card title="Delivery" icon="car" @click="handleBuy('Delivery')"  />
        <dining-option-card title="Takeaway" icon="takeaway" @click="handleBuy('Takeaway')" />
        <dining-option-card title="Drive Thru" icon="driveThru" @click="handleBuy('Drive Thru')" />
        <dining-option-card title="Bars" icon="bar" @click="handleBuy('Bars')" />
      </div>
      
      <!-- Custom Search Modal -->
      <ion-modal :is-open="isSearchModalOpen" @didDismiss="closeSearchModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Search for Food</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeSearchModal">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-label position="stacked">What are you craving?</ion-label>

            <ion-input 
              v-model="searchKeyword" 
              placeholder="e.g. pizza, chinese, burgers..."
              @keyup.enter="performSearch"
            class="border-2 border-solid  dark:border-white rounded-lg p-2"
            ></ion-input>

            <div class="mt-6">
              <div v-if="dietary.length > 0" class="flex flex-wrap gap-2">
                <ion-chip v-for="diet in dietary" :key="diet.id"
                  :class="['m-0 h-8', selectedDietary.includes(diet.id) ? 'bg-yellow-500 font-medium' : 'border border-gray-200 bg-transparent dark:text-white dark:bg-gray-800']"
                  @click="toggleDietary(diet.id)">
                  {{ diet.name }}
                </ion-chip>
              </div>

            <div v-else class="text-sm text-gray-400 p-2">
              No dietary requirements available
            </div>
          </div>

          <ion-button expand="block" @click="performSearch" :disabled="!searchKeyword.trim()" class="mt-4">
            Search
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { useRestaurantStore, type DiningOption } from '@/store/useRestaurantStore';
import { useDietaryStore } from '@/store/useDietaryStore';
import { IonPage, IonContent, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonChip, IonLabel, IonInput } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import BackArrow from '@/components/navigation/BackArrow.vue';
import DiningOptionCard from '@/components/DiningOptions.vue';
import type { Dietary } from '@/types/dietary';

const router = useRouter();
const restaurantStore = useRestaurantStore();
const dietaryStore = useDietaryStore();

const isSearchModalOpen = ref(false);
const searchKeyword = ref('');
const selectedDietary = ref<number[]>([]);

const handleBuy = (option: 'Dine In' | 'Takeaway' | 'Delivery' | 'Drive Thru' | 'Bars') => {
  const diningOptionMap: Record<string, DiningOption> = {
    'Dine In': 'dine_in',
    'Takeaway': 'takeaway',
    'Delivery': 'delivery',
    'Drive Thru': 'drive_thru',
    'Bars': 'bars'
  };
  restaurantStore.setDiningOption(diningOptionMap[option]);
  restaurantStore.setSearchKeyword(null); // Clear any previous keyword
  router.push('/restaurant-chooser/dine-in');
};

const handleCustomSearch = async() => {
  if (dietaryStore.dietary.length === 0 && !dietaryStore.isLoading) {
    await dietaryStore.fetchDietary();
  }
  isSearchModalOpen.value = true;
};

const closeSearchModal = () => {
  isSearchModalOpen.value = false;
  searchKeyword.value = '';
  selectedDietary.value = [];
};

const performSearch = () => {
 if (searchKeyword.value.trim()) {
    const selectedDietaryNames = selectedDietary.value
      .map(id => dietary.value.find(diet => diet.id === id)?.name)
      .filter(name => name !== undefined)
      .map(name => name!.toLowerCase().replace(/\s+/g, '-')) as string[];

    restaurantStore.setDiningOption('custom');
    restaurantStore.setSearchKeyword(searchKeyword.value.trim());
    restaurantStore.setSelectedDietary(selectedDietaryNames);

    closeSearchModal();
    router.push('/restaurant-chooser/dine-in');
  }
};

const dietary = computed<Dietary[]>(() => {
  return Array.isArray(dietaryStore.dietary) ? dietaryStore.dietary : [];
});

const toggleDietary = (id: number) => {
  const index = selectedDietary.value.indexOf(id);
  if (index === -1) {
    selectedDietary.value.push(id);
  } else {
    selectedDietary.value.splice(index, 1);
  }
};

onMounted(async () => {
  if (dietaryStore.dietary.length === 0) {
    await dietaryStore.fetchDietary();
  }
});
</script>
