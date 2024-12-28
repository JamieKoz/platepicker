<template>
  <ion-page>
    <ion-content>
      <ion-header class="text-center">
        Let's find your next meal!
      </ion-header>

        <ion-img :src="`http://127.0.0.1:8000/storage/food-images/honey-glazed-chicken-2.jpg`"></ion-img>
      <div class="flex flex-col items-center">
        <ion-tab-button class="btn btn-primary bg-gray-800 my-1 p-2" href="/login">
          <ion-label>Login</ion-label>
        </ion-tab-button>

        <ion-tab-button class="btn btn-primary bg-gray-800 my-1 p-2" href="/register">
          <ion-label>Sign up</ion-label>
        </ion-tab-button>
      </div>
      
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
</script>
