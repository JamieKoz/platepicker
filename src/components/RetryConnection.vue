<template>
  <div class="flex flex-col items-center justify-center p-8">
    <ion-text color="danger" class="text-center mb-4">
      {{ message || 'Something went wrong. Please check your connection.' }}
    </ion-text>
    <ion-button @click="handleRetry" color="light">
      <ion-icon :icon="refreshCircle" class="mr-2" />
      Try Again
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { refreshCircle } from 'ionicons/icons';
import { IonText, IonButton, IonIcon } from '@ionic/vue';

const props = defineProps<{
  message?: string
}>();

const emit = defineEmits<{
  (e: 'retry'): void
}>();

function handleRetry() {
  emit('retry');
}
</script>
