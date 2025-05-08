<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Verify Email</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="flex flex-col items-center">
        <div class="w-full max-w-md">
          <h1 class="text-2xl font-bold mb-8 text-center">Verify Your Email</h1>
          
          <div class="ion-padding rounded-lg">
            <p class="mb-4">Please enter the verification code from your email:</p>

            <div v-if="verificationError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {{ verificationError }}
            </div>

            <form @submit.prevent="handleVerify">
              <ion-item>
                <ion-label position="floating">Verification Code</ion-label>
                <ion-input v-model="code" type="text"></ion-input>
              </ion-item>
              <ion-button class="w-full mt-4" type="submit">Verify Email</ion-button>
            </form>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSignUp } from '@clerk/vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonInput, IonButton
} from '@ionic/vue';

const router = useRouter();
const { isLoaded, signUp } = useSignUp();
const code = ref('');
const verificationError = ref('');

// Validation before submission
const validateCode = () => {
  if (!code.value.trim()) {
    verificationError.value = 'Please enter the verification code';
    return false;
  }
  return true;
};

// Simple verification handler
const handleVerify = async () => {
  if (!isLoaded || !signUp.value) return;
  
  // Reset previous error
  verificationError.value = '';
  
  // Validate input
  if (!validateCode()) return;
  
  try {
    const completeSignUp = await signUp.value.attemptEmailAddressVerification({
      code: code.value
    });
    
    if (completeSignUp.status === 'complete') {
      // Navigate to home
      await router.push('/home');
      
      // Force reload to ensure fresh auth state (which will trigger the watcher in MainLayout)
      location.reload();
    } else {
      verificationError.value = 'Verification incomplete. Please try again.';
    }
  } catch (err) {
    console.error('Error verifying email:', err);
    verificationError.value = 'Incorrect verification code. Please try again.';
  }
};</script>
