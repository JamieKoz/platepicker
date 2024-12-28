<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <MealChooser />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import MealChooser from '@/components/MealChooser.vue';
</script>
