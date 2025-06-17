<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useThemeStore } from '@/store/useThemeStore';

const themeStore = useThemeStore();

onMounted(() => {
  // Re-apply theme on mount to ensure consistency
  themeStore.initTheme();
});
</script>
