<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Feedback</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <FeedbackForm />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import FeedbackForm from '@/components/FeedbackForm.vue';
</script>
