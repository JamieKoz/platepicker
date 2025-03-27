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
      <ion-content class="ion-no-padding" :scroll-y="false">
        <ion-list>
          <template v-if="isSignedIn">

            <ion-item button @click="navigateTo('/profile')">
              <ion-label>{{ capitalizeFirstLetter(user?.username || '') }}</ion-label>
            </ion-item>

            <ion-item button @click="navigateTo('/list')">
              <ion-icon :icon="list" slot="start"></ion-icon>
              <ion-label>Meal List</ion-label>
            </ion-item>
            
            <ion-item button @click="navigateTo('/favourites')">
              <ion-icon :icon="trophy" slot="start"></ion-icon>
              <ion-label>Favourites</ion-label>
            </ion-item>

            <ion-item button @click="navigateTo('/admin-dashboard')" v-show="isUserAdmin">
              <ion-icon :icon="list" slot="start"></ion-icon>
              <ion-label>Admin</ion-label>
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
import { ref, watch, computed, onMounted } from 'vue';
import { useUser, useAuth } from '@clerk/vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonPopover, IonContent, IonList, IonItem, IonLabel, IonRouterOutlet, IonAvatar
} from '@ionic/vue';
import { personCircle, list, home,
  logOut, logIn, personAdd, trophy, person
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { capitalizeFirstLetter } from '@/utils/string-utils';
import { useUserStore } from '@/store/useUserStore'

const router = useRouter();
const { user } = useUser();
const { isSignedIn, signOut } = useAuth();
const isUserMenuOpen = ref(false);
const userStore = useUserStore();
// watch(user, (newUser) => {
//   if (newUser?.id) {
//     const userData = {
//       id: newUser.id,
//       name: newUser.firstName || newUser.username || newUser.emailAddresses?.[0]?.emailAddress?.split('@')[0],
//       email: newUser.emailAddresses?.[0]?.emailAddress,
//       isAdmin: newUser.organizationMemberships[0].role == "org:admin" ? 1 : 0
//     };
//     localStorage.setItem('clerkUserId', newUser.id);
//     localStorage.setItem('clerkUserData', JSON.stringify(userData));
//   } else {
//     localStorage.removeItem('clerkUserId');
//     localStorage.removeItem('clerkUserData');
//   }
// });

const isUserAdmin = computed(() => {
  if (!user.value) return false;
  
  if (user.value.organizationMemberships && user.value.organizationMemberships.length > 0) {
    return user.value.organizationMemberships[0].role === "org:admin";
  }
  
  try {
    const userData = JSON.parse(localStorage.getItem('clerkUserData') || '{}');
    return userData.isAdmin === 1;
  } catch (e) {
    return false;
  }
});

const navigateTo = async (path: string) => {
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

onMounted(() => {
  userStore.initializeUser();
})
</script>
