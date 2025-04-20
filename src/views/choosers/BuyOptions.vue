<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <Back-Arrow />
      <OptionSelector option1Title="Dine In" option2Title="Delivery" option1Icon="utensils" option2Icon="car"
        @option1Click="() => handleBuy('Dine In')" @option2Click="() => handleBuy('Delivery')" />
      <OptionSelector option1Title="Takeaway" option2Title="Drive Thru" option1Icon="takeaway" option2Icon="driveThru"
        @option1Click="() => handleBuy('Delivery')" @option2Click="() => handleBuy('Drive Thru')" />
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRestaurantStore, type DiningOption } from '@/store/useRestaurantStore';
import { IonPage, IonContent } from '@ionic/vue';
import OptionSelector from '@/components/OptionSelector.vue';
import { useRouter } from 'vue-router';
import BackArrow from '@/components/navigation/BackArrow.vue';

const router = useRouter();
const restaurantStore = useRestaurantStore();

const handleBuy = (option: 'Dine In' | 'Takeaway' | 'Delivery' | 'Drive Thru') => {
  // Map the clicked option to the corresponding DiningOption
  const diningOptionMap: Record<string, DiningOption> = {
    'Dine In': 'dine_in',
    'Takeaway': 'takeaway',
    'Delivery': 'delivery',
    'Drive Thru': 'drive_thru'
  };

  // Set the dining option in the store
  restaurantStore.setDiningOption(diningOptionMap[option]);

  // Navigate to the restaurant chooser
  router.push('/restaurant-chooser/dine-in');
};
</script>
