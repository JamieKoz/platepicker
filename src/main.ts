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

import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

// Theme detection - runs immediately
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  
  if (shouldUseDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return shouldUseDark;
};

// Initialize theme before app loads
const isDarkMode = initTheme();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) { // Only auto-switch if user hasn't set preference
    document.documentElement.classList.toggle('dark', e.matches);
  }
});

const pinia = createPinia();
const app = createApp(App);

app.use(clerkPlugin, {
  // publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZGl2ZXJzZS1rb2RpYWstOTYuY2xlcmsuYWNjb3VudHMuZGV2JA'
  publishableKey: 'pk_test_ZGl2ZXJzZS1rb2RpYWstOTYuY2xlcmsuYWNjb3VudHMuZGV2JA',
  appearance: {
    baseTheme: isDarkMode ? dark : undefined,
  },
});

app
  .use(IonicVue)
  .use(pinia)
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});
