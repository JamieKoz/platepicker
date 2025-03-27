<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Admin Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="admin-menu p-4">
        <h1 class="text-xl font-bold mb-4">Admin Center</h1>
        
        <ion-list>
          <ion-item button detail @click="navigateTo('/recipes-list')">
            <ion-icon :icon="restaurant" slot="start" color="primary"></ion-icon>
            <ion-label>Manage Recipes</ion-label>
          </ion-item>
          
          <ion-item button detail @click="navigateTo('/categories-list')">
            <ion-icon :icon="folder" slot="start" color="primary"></ion-icon>
            <ion-label>Manage Categories</ion-label>
          </ion-item>
          
          <ion-item button detail @click="navigateTo('/cuisines-list')">
            <ion-icon :icon="globe" slot="start" color="primary"></ion-icon>
            <ion-label>Manage Cuisines</ion-label>
          </ion-item>
          
          <ion-item button detail @click="navigateTo('/dietary-list')">
            <ion-icon :icon="nutrition" slot="start" color="primary"></ion-icon>
            <ion-label>Manage Dietary Requirements</ion-label>
          </ion-item>
          
          <ion-item button detail @click="navigateTo('/measurements-list')">
            <ion-icon :icon="scale" slot="start" color="primary"></ion-icon>
            <ion-label>Manage Measurements</ion-label>
          </ion-item>
          
          <ion-item button detail @click="navigateTo('/ingredients-list')">
            <ion-icon :icon="leaf" slot="start" color="primary"></ion-icon>
            <ion-label>Manage Ingredients</ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel
} from '@ionic/vue';
import {
  restaurant,
  folder,
  globe,
  nutrition,
  scale,
  leaf
} from 'ionicons/icons';

const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};
</script>
