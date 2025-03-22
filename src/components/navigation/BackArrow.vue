<template>
  <ion-button fill="clear" @click="router.go(-1)">
    <ion-icon :icon="arrowBack" slot="icon-only"></ion-icon>
  </ion-button>
</template>
<script setup lang="ts">
  
import { arrowBack } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
