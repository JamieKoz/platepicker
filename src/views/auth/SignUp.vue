<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Sign Up</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="flex flex-col items-center">
        <div class="w-full max-w-md">
          <h1 class="text-2xl font-bold mb-8 text-center">Create an account</h1>
          <SignUp 
            routing="path" 
            path="/sign-up"
            :redirect-url="redirectUrl"
            :after-sign-up-url="afterSignUpUrl"
            @sign-up-attempt="handleSignUpAttempt"
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
          <div class="mt-4 text-center">
            <p>Already have an account? 
              <ion-button fill="clear" @click="router.push('/sign-in')">
                Sign in
              </ion-button>
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { SignUp } from '@clerk/vue';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useUserStore } from '@/store/useUserStore';

const router = useRouter();
const userStore = useUserStore();
const redirectUrl = "/";
const afterSignUpUrl = "/home";

// This function will be triggered when a user attempts to sign up
const handleSignUpAttempt = async () => {
  console.log('User is attempting to sign up');
};

// Initialize user and handle registration
onMounted(async () => {
  // Initialize user data from Clerk
  const { isNewUser } = await userStore.initializeUser();
  
  // If this is a new user registration, the assignInitialRecipes will 
  // be automatically called in the initializeUser method
  if (isNewUser) {
    console.log('New user registration detected');
  }
});
</script>
