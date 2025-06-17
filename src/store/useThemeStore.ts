// stores/useThemeStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false);
  
  // Use matchMedia to check the user preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Add or remove the "ion-palette-dark" class on the html element
  const toggleDarkPalette = (shouldAdd: boolean) => {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  };
  
  // Initialize the dark palette based on the initial
  // value of the prefers-color-scheme media query or saved preference
  const initializeDarkPalette = (isDarkMode: boolean) => {
    isDark.value = isDarkMode;
    toggleDarkPalette(isDarkMode);
    
    // Also update for Tailwind
    document.documentElement.classList.toggle('dark', isDarkMode);
  };
  
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    // If user has a saved preference, use that; otherwise use system preference
    if (savedTheme) {
      initializeDarkPalette(savedTheme === 'dark');
    } else {
      initializeDarkPalette(prefersDark.matches);
    }
  };
  
  // Listen for changes to the prefers-color-scheme media query
  prefersDark.addEventListener('change', (mediaQuery) => {
    // Only update if user hasn't set a manual preference
    if (!localStorage.getItem('theme')) {
      initializeDarkPalette(mediaQuery.matches);
    }
  });
  
  const toggleTheme = () => {
    const newValue = !isDark.value;
    isDark.value = newValue;
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    toggleDarkPalette(newValue);
    
    // Also update for Tailwind
    document.documentElement.classList.toggle('dark', newValue);
  };
  
  const setTheme = (dark: boolean) => {
    isDark.value = dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    toggleDarkPalette(dark);
    
    // Also update for Tailwind
    document.documentElement.classList.toggle('dark', dark);
  };
  
  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme,
    toggleDarkPalette
  };
});
