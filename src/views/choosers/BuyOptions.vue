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
import { IonPage, IonContent, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonItem, IonLabel, IonInput } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import BackArrow from '@/components/navigation/BackArrow.vue';
import DiningOptionCard from '@/components/DiningOptions.vue';

const router = useRouter();
const restaurantStore = useRestaurantStore();
const isSearchModalOpen = ref(false);
const searchKeyword = ref('');

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

const handleCustomSearch = () => {
  isSearchModalOpen.value = true;
};

const closeSearchModal = () => {
  isSearchModalOpen.value = false;
  searchKeyword.value = '';
};

const performSearch = () => {
  if (searchKeyword.value.trim()) {
    restaurantStore.setDiningOption('custom');
    restaurantStore.setSearchKeyword(searchKeyword.value.trim());
    closeSearchModal();
    router.push('/restaurant-chooser/dine-in');
  }
};
</script>
