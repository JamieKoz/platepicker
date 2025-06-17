// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import { clerkPlugin } from '@clerk/vue';
import { dark } from '@clerk/themes'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import 'tailwindcss/tailwind.css'
/* Theme variables */
import './theme/variables.css';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);

// Import theme store after pinia is installed
import { useThemeStore } from '@/store/useThemeStore';
const themeStore = useThemeStore();
themeStore.initTheme();

app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ,
  appearance: {
    baseTheme: themeStore.isDark ? dark : undefined,
  },
});

app
  .use(IonicVue)
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});
