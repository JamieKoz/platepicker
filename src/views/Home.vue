<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
          <MealLocation />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import MealLocation from '@/components/MealLocation.vue';
</script>
