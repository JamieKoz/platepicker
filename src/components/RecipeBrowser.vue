<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>Recipe Library</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="searchRecipes" :debounce="300"
          placeholder="Search recipes"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4">
          <ion-button @click="openCreateModal" size="small" color="primary">
            Create +
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item v-for="recipe in recipes" :key="recipe.id">
          <ion-label>
            <h2>{{ recipe.title }}</h2>
          </ion-label>
          <ion-button @click="addToMyMeals(recipe)" color="success" size="small">
            Add
          </ion-button>
        </ion-item>
      </ion-list>

      <div class="pagination-controls">
        <ion-toolbar class="flex justify-between">
          <ion-button @click="fetchRecipes(meta.current_page - 1)" :disabled="!links.prev" fill="clear" size="small">
            Previous
          </ion-button>
          <ion-text class="text-xs text-center items-center">
            Page {{ meta.current_page }} / {{ meta.last_page }}
          </ion-text>
          <ion-button @click="fetchRecipes(meta.current_page + 1)" :disabled="!links.next" fill="clear" size="small">
            Next
          </ion-button>
        </ion-toolbar>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Recipe } from '@/types/recipe';
import type { PaginationMeta, PaginationLinks } from '@/types/pagination';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonText
} from '@ionic/vue';
import api from '@/api/axios';

const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'openCreateModal'): void;
  (e: 'recipeAdded'): void;
}>();

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      fetchRecipes(1);
    }
  }
);
const recipes = ref<Recipe[]>([]);
const searchTerm = ref('');
const meta = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
  prev_page_url: null,
  next_page_url: null
});
const links = ref<PaginationLinks>({
  prev: null,
  next: null
});

function close() {
  emit('close');
}

function openCreateModal() {
  emit('openCreateModal');
  close();
}

async function fetchRecipes(page = 1) {
  try {
    console.log('Fetching recipes...', { page, searchTerm: searchTerm.value });
    const params = {
      page,
      q: searchTerm.value
    };

    const response = await api.get('/recipes', { params });
    console.log('Recipe response:', response.data);
    recipes.value = response.data.data;
    meta.value = {
      current_page: response.data.current_page,
      last_page: response.data.last_page,
      per_page: response.data.per_page,
      total: response.data.total,
      from: response.data.from,
      to: response.data.to,
      prev_page_url: response.data.prev_page_url,
      next_page_url: response.data.next_page_url
    };
    links.value = {
      prev: response.data.prev_page_url,
      next: response.data.next_page_url
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

async function searchRecipes(event: CustomEvent) {
  searchTerm.value = (event.target as HTMLIonSearchbarElement).value?.trim() ?? '';
  await fetchRecipes(1);
}

async function addToMyMeals(recipe: Recipe) {
  try {
    await api.post(`/user-meals/add-from-recipe/${recipe.id}`);
    emit('recipeAdded');
    close();
  } catch (error) {
    console.error("Error adding recipe to meals:", error);
  }
}

onMounted(() => {
  if (props.isOpen) {
    fetchRecipes(1);
  }
});
</script>

<style scoped>
.pagination-controls {
  margin-bottom: 2.5rem;
  padding: 1rem;
}
</style>
