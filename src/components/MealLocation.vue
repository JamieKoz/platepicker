<template>
  <ion-grid class="flex items-center justify-center">
    <ion-row class="justify-items-center">
      <ion-col>
        <ion-card class="meal-card" @click="handleBuyOption">
          <ion-ripple-effect></ion-ripple-effect>
          <ion-card-header>
            <ion-card-title class="text-center">
              Buy 
            </ion-card-title>
          </ion-card-header>
        </ion-card>
      </ion-col>

      <ion-col>
        <ion-card class="meal-card" @click="handleCookOption">
          <ion-ripple-effect></ion-ripple-effect>
          <ion-card-header>
            <ion-card-title class="text-center">Cook</ion-card-title>
          </ion-card-header>
        </ion-card>
      </ion-col>
    </ion-row>

    <ion-row v-if="buyOption">
      <ion-col class="mt-3">
        <ion-card class="meal-card" @click="setDineInOption">
          <ion-ripple-effect></ion-ripple-effect>
          <ion-card-header>
            <ion-card-title class="text-center">Dine In</ion-card-title>
          </ion-card-header>
        </ion-card>
      </ion-col>
      <ion-col class="mt-3">
        <ion-card class="meal-card" @click="setDeliveryOption">
          <ion-ripple-effect></ion-ripple-effect>
          <ion-card-header>
            <ion-card-title class="text-center">Delivery</ion-card-title>
          </ion-card-header>
        </ion-card>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonCol, IonGrid, IonRow, IonCard, IonCardHeader, IonCardTitle, IonRippleEffect } from '@ionic/vue';
import { useRouter } from 'vue-router';

const buyOption = ref(false);  // Use ref for reactivity
const router = useRouter();  // Get the router instance

function handleBuyOption() {
  buyOption.value = true;  // Show the Dine In and Delivery options
}

function handleCookOption() {
  router.push('/tabs/tab2');  // Navigate to tab2
}

function setDineInOption() {
  console.log('Selected Dine In');
  // Add logic for Dine In option if necessary
}

function setDeliveryOption() {
  console.log('Selected Delivery');
  // Add logic for Delivery option if necessary
}
</script>


<style scoped>
  .ripple-parent {
    position: relative;
    overflow: hidden;
    border: 1px solid #ddd;
  }

  .meal-image {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .meal-image img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }
  .meal-card {
    height: 350px;
    width: 350px;
  }

</style>
