<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">

      <ion-buttons class="mt-2">
        <ion-button @click="router.go(-1)">
          <ion-icon :icon="arrowBack" />
        </ion-button>
      </ion-buttons>
      <OptionSelector option1Title="Buy" option2Title="Cook" option1Icon="dollar" option2Icon="chef"
        @option1Click="handleBuy" @option2Click="handleCook" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/vue';
import OptionSelector from '@/components/OptionSelector.vue';
import { useRouter } from 'vue-router';
import { arrowBack } from 'ionicons/icons';

const router = useRouter();

const handleBuy = () => router.push('/restaurant-chooser/dine-in');
const handleCook = () => router.push('/filter-chooser');
</script>
