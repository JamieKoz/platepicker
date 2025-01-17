<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <!-- Home button -->
          <ion-button @click="navigateTo('/home')">
            <ion-icon :icon="home" />
          </ion-button>
        </ion-buttons>
        <ion-title>Meal Decider</ion-title>
        <ion-buttons slot="end">
          <ion-button id="user-menu-trigger">
            <ion-icon :icon="personCircle" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- User Menu Popover -->
    <ion-popover 
      trigger="user-menu-trigger"
      :is-open="isUserMenuOpen" 
      @didDismiss="isUserMenuOpen = false"
      side="bottom"
      alignment="end"
      :arrow="false"
      dismiss-on-select="true"
    >
      <ion-content class="ion-no-padding">
        <ion-list>
          <ion-item button @click="navigateTo('/profile')">
            <ion-icon :icon="person" slot="start"></ion-icon>
            <ion-label>Profile</ion-label>
          </ion-item>
          <ion-item button @click="navigateTo('/list')">
            <ion-icon :icon="list" slot="start"></ion-icon>
            <ion-label>Meal List</ion-label>
          </ion-item>
          <ion-item button @click="navigateTo('/settings')">
            <ion-icon :icon="settings" slot="start"></ion-icon>
            <ion-label>Settings</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-popover>

    <ion-router-outlet></ion-router-outlet>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonRouterOutlet
} from '@ionic/vue';
import { 
  personCircle, 
  person, 
  list, 
  settings, 
  home 
} from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();
const isUserMenuOpen = ref(false);

const navigateTo = (path: string) => {
  router.push(path);
  isUserMenuOpen.value = false;
};
</script>
