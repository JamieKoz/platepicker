<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <OptionSelector 
        option1Title="Buy"
        option2Title="Cook"
        option1Icon="dollar"
        option2Icon="chef"
        @option1Click="handleBuy"
        @option2Click="handleCook"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import OptionSelector from '@/components/OptionSelector.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleBuy = () => router.push('/restaurant-chooser/dine-in');
const handleCook = () => router.push('/meal-chooser');
</script>
