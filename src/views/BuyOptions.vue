<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <OptionSelector 
        option1Title="Dine In"
        option2Title="Delivery"
        option1Icon="utensils"
        option2Icon="car"
        @option1Click="handleDineIn"
        @option2Click="handleDelivery"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import OptionSelector from '@/components/OptionSelector.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleDineIn = () => router.push('/restaurant-chooser/dine-in');
const handleDelivery = () => router.push('/restaurant-chooser/delivery');
</script>
