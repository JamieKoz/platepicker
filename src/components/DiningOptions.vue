<template>
  <ion-card class="w-full h-full flex items-center justify-center m-0 border-1 border-yellow-200" @click="$emit('click')">
    <ion-ripple-effect></ion-ripple-effect>
    <div class="w-full flex flex-col items-center justify-center p-1">
      <div class="mb-1" v-html="optionIcons[icon]"></div>
      <ion-card-title class="text-center text-base">
        {{ title }}
      </ion-card-title>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardTitle, IonRippleEffect } from '@ionic/vue';
import { optionIcons } from '@/assets/optionIcons';

defineProps<{
  title: string;
  icon: keyof typeof optionIcons;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<style scoped>
:deep(svg) {
  width: 48px;
  height: 48px;
}

ion-card {
  margin: 0 !important;
}

</style>
