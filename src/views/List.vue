<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search meals"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4 gap-2">
          <ion-button @click="toggleTitleSort" size="small" fill="clear">
            A-Z {{ titleDirection === 'asc' ? '↑' : '↓' }}
          </ion-button>
          <ion-button @click="toggleActiveSort" size="small" fill="clear">
            Status {{ activeDirection === 'asc' ? '↑' : '↓' }}
          </ion-button>
          <ion-button @click="openAddModal" size="small" color="primary">
            Add +
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item v-for="meal in meals" :key="meal.id">
          <ion-label>
            <h2>{{ meal.title }}</h2>
          </ion-label>
          <ion-button @click="openEditModal(meal)" color="warning" size="small" class="mr-2"> 
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="10" height="10" viewBox="0 0 30 30">
              <path
                d="M 22.828125 3 C 22.316375 3 21.804562 3.1954375 21.414062 3.5859375 L 19 6 L 24 11 L 26.414062 8.5859375 C 27.195062 7.8049375 27.195062 6.5388125 26.414062 5.7578125 L 24.242188 3.5859375 C 23.851688 3.1954375 23.339875 3 22.828125 3 z M 17 8 L 5.2597656 19.740234 C 5.2597656 19.740234 6.1775313 19.658 6.5195312 20 C 6.8615312 20.342 6.58 22.58 7 23 C 7.42 23.42 9.6438906 23.124359 9.9628906 23.443359 C 10.281891 23.762359 10.259766 24.740234 10.259766 24.740234 L 22 13 L 17 8 z M 4 23 L 3.0566406 25.671875 A 1 1 0 0 0 3 26 A 1 1 0 0 0 4 27 A 1 1 0 0 0 4.328125 26.943359 A 1 1 0 0 0 4.3378906 26.939453 L 4.3632812 26.931641 A 1 1 0 0 0 4.3691406 26.927734 L 7 26 L 5.5 24.5 L 4 23 z">
              </path>
            </svg>
          </ion-button>
          <ion-button @click="toggleMealStatus(meal)" :color="meal.active ? 'danger' : 'success'" size="small">
            {{ meal.active ? 'Deactivate' : 'Activate' }}
          </ion-button>
        </ion-item>
      </ion-list>

      <div class="pagination-controls">
        <ion-toolbar class="flex justify-between">
          <ion-button @click="fetchMealList(meta.current_page - 1)" :disabled="!links.prev" fill="clear" size="small">
            Previous
          </ion-button>
          <ion-text class="text-xs text-center items-center">
            Page {{ meta.current_page }} / {{ meta.last_page }}
          </ion-text>
          <ion-button @click="fetchMealList(meta.current_page + 1)" :disabled="!links.next" fill="clear" size="small">
            Next
          </ion-button>
        </ion-toolbar>
      </div>
    </ion-content>
    <RecipeBrowser :is-open="isRecipeBrowserOpen" @close="isRecipeBrowserOpen = false"
      @open-create-modal="openCreateModal" @recipe-added="fetchMealList(1)" />
    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ editingMeal ? 'Edit' : 'Add' }} Meal</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
    </ion-modal>

<MealFormModal 
  :is-open="isModalOpen"
  :editing-meal="editingMeal"
  @close="closeModal"
  @saved="fetchMealList(meta.current_page)"
/>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Meal } from '@/types/meal';
import type { PaginationMeta, PaginationLinks } from '@/types/pagination';
import {
  IonHeader, IonToolbar, IonSearchbar, IonContent, IonList,
  IonItem, IonLabel, IonButton, IonText, IonPage, IonModal,
  IonTitle, IonButtons, IonInput, IonTextarea, IonToggle, IonAlert 
} from '@ionic/vue';
import api from '@/api/axios';
import RecipeBrowser from '@/components/RecipeBrowser.vue';
import MealFormModal from '@/components/MealFormModal.vue';
const isRecipeBrowserOpen = ref(false);
const meals = ref<Meal[]>([]);
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
const searchTerm = ref('');
const currentSearch = ref('');
const activeDirection = ref<'asc' | 'desc'>('desc');
const titleDirection = ref<'asc' | 'desc'>('asc');
const isModalOpen = ref(false);
const editingMeal = ref<Meal | null>(null);

function openCreateModal() {
  editingMeal.value = null;
  isModalOpen.value = true;
}

function openAddModal() {
  isRecipeBrowserOpen.value = true;
}

function openEditModal(meal: Meal) {
  editingMeal.value = meal;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editingMeal.value = null;
}

function toggleActiveSort() {
  activeDirection.value = activeDirection.value === 'asc' ? 'desc' : 'asc';
  fetchMealList(1);
}

function toggleTitleSort() {
  titleDirection.value = titleDirection.value === 'asc' ? 'desc' : 'asc';
  fetchMealList(1);
}

async function fetchMealList(page = 1) {
  try {
    let response;
    const params = {
      page,
      active_direction: activeDirection.value,
      title_direction: titleDirection.value
    };

    if (currentSearch.value) {
      response = await api.get('/user-meals/search', { params: { ...params, q: currentSearch.value } });
    } else {
      response = await api.get('/user-meals/list', { params });
    }

    meals.value = response.data.data;
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
    console.error("Error fetching meals:", error);
  }
}

async function search(event: CustomEvent) {
  try {
    const searchValue = (event.target as HTMLIonSearchbarElement).value?.trim() ?? '';
    currentSearch.value = searchValue;
    fetchMealList(1);
  } catch (error) {
    console.error("Error searching meals:", error);
  }
}

async function toggleMealStatus(meal: Meal) {
  const originalStatus = meal.active;
  meal.active = !meal.active;

  try {
    await api.post(`/user-meals/${meal.id}/toggle-status`);
    await fetchMealList(meta.value.current_page);
  } catch (error) {
    console.error("Error toggling meal status:", error);
    meal.active = originalStatus;
  }
}

onMounted(() => fetchMealList(1));
</script>

<style scoped>
.pagination-controls {
  margin-bottom: 2.5rem;
  padding: 1rem;
}
</style>
