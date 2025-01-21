<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="navigateTo('/home')">
            <ion-icon :icon="home" />
          </ion-button>
        </ion-buttons>
        <ion-title>PlatePicker</ion-title>
        <ion-buttons slot="end">
          <ion-button id="user-menu-trigger">
            <ion-avatar v-if="isSignedIn && user?.imageUrl" class="w-8 h-8">
              <img :src="user.imageUrl" alt="User avatar" />
            </ion-avatar>
            <ion-icon v-else :icon="personCircle" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
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
          <template v-if="isSignedIn">
            <ion-item>
              <ion-label>{{ user?.username }}</ion-label>
            </ion-item>
            <ion-item button @click="navigateTo('/list')">
              <ion-icon :icon="list" slot="start"></ion-icon>
              <ion-label>Meal List</ion-label>
            </ion-item>
            <ion-item button @click="doSignOut">
              <ion-icon :icon="logOut" slot="start"></ion-icon>
              <ion-label>Sign Out</ion-label>
            </ion-item>
          </template>
          <!-- Show these items when not signed in -->
          <template v-else>
            <ion-item button @click="navigateTo('/sign-in')">
              <ion-icon :icon="logIn" slot="start"></ion-icon>
              <ion-label>Sign In</ion-label>
            </ion-item>
            <ion-item button @click="navigateTo('/sign-up')">
              <ion-icon :icon="personAdd" slot="start"></ion-icon>
              <ion-label>Sign Up</ion-label>
            </ion-item>
          </template>
        </ion-list>
      </ion-content>
    </ion-popover>
    <ion-router-outlet></ion-router-outlet>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUser, useAuth } from '@clerk/vue';
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
  IonRouterOutlet,
  IonAvatar
} from '@ionic/vue';
import { 
  personCircle, 
  list, 
  home,
  logOut,
  logIn,
  personAdd
} from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user } = useUser();
const { isSignedIn, signOut } = useAuth();
const isUserMenuOpen = ref(false);

const navigateTo = async (path: string) => {
  console.log('Navigating to:', path);
  try {
    await router.push(path);
    isUserMenuOpen.value = false;
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

const doSignOut = () => {
  if (signOut.value) {
    signOut.value().then(() => {
      router.push('/sign-in');
      isUserMenuOpen.value = false;
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  }
};
</script>
