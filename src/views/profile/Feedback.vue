<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Feedback</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
        <ion-buttons class="mt-2">
          <ion-button @click="router.go(-1)">
            <ion-icon :icon="arrowBack" />
          </ion-button>
        </ion-buttons>
      <FeedbackForm />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/vue';
import FeedbackForm from '@/components/FeedbackForm.vue';
import { arrowBack } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

</script>
