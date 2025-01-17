<template>
  <ion-page class="mt-12">
    <ion-content :fullscreen="true">
      <MealChooser />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import MealChooser from '@/components/MealChooser.vue';
</script>
