<template>
  <ion-page>
    <ion-content class="mt-12">
      <div class="restaurant-chooser">
        <!-- Placeholder for now - will be implemented with Google Places API later -->
        <h2>Restaurant Options for {{ mode }} will appear here</h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const mode = route.params.mode; // Will be either 'dine-in' or 'delivery'
</script>
