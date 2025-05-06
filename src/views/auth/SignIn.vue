<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Sign In</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="flex flex-col items-center">
        <h1 class="text-2xl font-bold mb-8 text-center">Welcome back</h1>
        <SignIn 
            routing="path" 
            path="/sign-in"
            :fallback-redirect-url="fallbackRedirectUrl"
            :after-sign-in-url="afterSignInUrl"
          :appearance="{
            elements: {
              rootBox: 'w-full max-w-md',
              card: 'ion-padding rounded-lg',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              formButtonPrimary: 'w-full ion-color-primary',
              socialButtonsBlockButton: 'ion-padding',
              footerActionText: 'text-sm',
              footerActionLink: 'text-primary font-medium'
            }
          }"
        />
          <!--<div class="mt-4 text-center">
            <p>Don't have an account? 
              <ion-button fill="clear" @click="router.push('/sign-up')">
                Sign up
              </ion-button>
            </p>
</div>-->
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { SignIn } from '@clerk/vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButton 
} from '@ionic/vue';

const router = useRouter();
const fallbackRedirectUrl = "/";
const afterSignInUrl = "/home";
</script>
