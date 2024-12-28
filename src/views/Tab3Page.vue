<template>
  <ion-page>
    <ion-content>
        <ion-tab-button href="/login">
          <ion-icon aria-hidden="true" :icon="square" />
          <ion-label>Login</ion-label>
        </ion-tab-button>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
</script>
