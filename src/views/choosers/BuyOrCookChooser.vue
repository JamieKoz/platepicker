<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <Back-Arrow />
      <OptionSelector option1Title="Buy" option2Title="Cook" option1Icon="dollar" option2Icon="chef"
        @option1Click="handleBuy" @option2Click="handleCook" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButtons } from '@ionic/vue';
import OptionSelector from '@/components/OptionSelector.vue';
import { useRouter } from 'vue-router';
import BackArrow from '@/components/navigation/BackArrow.vue';

const router = useRouter();

const handleBuy = () => router.push('/restaurant-chooser/dine-in');
const handleCook = () => router.push('/filter-chooser');
</script>
