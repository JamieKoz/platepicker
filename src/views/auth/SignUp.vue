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
          <SignUp />
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

const router = useRouter();
</script>

