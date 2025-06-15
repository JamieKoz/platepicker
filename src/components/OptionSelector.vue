<template>
  <ion-grid class="flex items-center justify-center">
    <ion-row class="flex justify-between items-center">
      <ion-col class="flex justify-center items-center flex-1">
        <ion-card class="w-[90vw] h-[35vh] flex items-center justify-center border-2 border-yellow-200" @click="$emit('option1Click')">
          <ion-ripple-effect></ion-ripple-effect>
          <div class="w-full p-2 flex flex-col items-center justify-center">
            <div class="mb-4" v-html="optionIcons[option1Icon]"></div>
            <ion-card-title class="text-center">
              {{ option1Title }}
            </ion-card-title>
          </div>
        </ion-card>
      </ion-col>
      <ion-col class="flex justify-center items-center flex-1">
        <ion-card class="w-[90vw] h-[35vh] flex items-center justify-center border-2 border-purple-200" @click="$emit('option2Click')">
          <ion-ripple-effect></ion-ripple-effect>
          <div class="w-full p-2 flex flex-col items-center justify-center">
            <div class="mb-4" v-html="optionIcons[option2Icon]"></div>
            <ion-card-title class="text-center">
              {{ option2Title }}
            </ion-card-title>
          </div>
        </ion-card>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import { IonCol, IonGrid, IonRow, IonCard, IonCardTitle, IonRippleEffect } from '@ionic/vue';
import { optionIcons } from '@/assets/optionIcons';

defineProps<{
  option1Title: string;
  option2Title: string;
  option1Icon: keyof typeof optionIcons;
  option2Icon: keyof typeof optionIcons;
}>();

defineEmits<{
  (e: 'option1Click'): void;
  (e: 'option2Click'): void;
}>();
</script>

<style scoped>


:deep(svg) {
  width: 64px;
  height: 64px;
}
</style>
