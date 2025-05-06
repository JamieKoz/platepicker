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
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { SignUp } from '@clerk/vue';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
</script>
