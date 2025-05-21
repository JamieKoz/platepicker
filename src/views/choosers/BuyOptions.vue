<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <Back-Arrow />

      <div class="grid grid-cols-2 gap-2 h-[calc(100%-4rem)] p-2 w-full">
        <dining-option-card title="Dine In" icon="utensils" @click="handleBuy('Dine In')"  />

        <dining-option-card title="Delivery" icon="car" @click="handleBuy('Delivery')"  />

        <dining-option-card title="Takeaway" icon="takeaway" @click="handleBuy('Takeaway')" />
        
        <dining-option-card title="Drive Thru" icon="driveThru" @click="handleBuy('Drive Thru')" />

        <dining-option-card title="Bars" icon="bar" @click="handleBuy('Bars')" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRestaurantStore, type DiningOption } from '@/store/useRestaurantStore';
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import BackArrow from '@/components/navigation/BackArrow.vue';
import DiningOptionCard from '@/components/DiningOptions.vue';

const router = useRouter();
const restaurantStore = useRestaurantStore();

const handleBuy = (option: 'Dine In' | 'Takeaway' | 'Delivery' | 'Drive Thru' | 'Bars') => {
  const diningOptionMap: Record<string, DiningOption> = {
    'Dine In': 'dine_in',
    'Takeaway': 'takeaway',
    'Delivery': 'delivery',
    'Drive Thru': 'drive_thru',
    'Bars': 'bars'
  };
  restaurantStore.setDiningOption(diningOptionMap[option]);
  router.push('/restaurant-chooser/dine-in');
};
</script>
