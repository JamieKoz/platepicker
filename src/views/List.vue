<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search meals"></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item v-for="meal in meals" :key="meal.id">
          <ion-label>{{ meal.title }}</ion-label>
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
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import type { Meal } from '@/types/meal';
import type { PaginationMeta, PaginationLinks, PaginatedResponse } from '@/types/pagination';
import {
  IonHeader,
  IonToolbar,
  IonSearchbar,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonPage
} from '@ionic/vue';

const BASE_URL = 'http://52.64.17.108/api';

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

async function fetchMealList(page = 1) {
  try {
    let response;
    if (currentSearch.value) {
      console.log('Fetching search results for:', currentSearch.value, 'page:', page);
      response = await axios.get<PaginatedResponse<Meal>>(`${BASE_URL}/search`, {
        params: {
          q: currentSearch.value,
          page
        }
      });
    } else {
      console.log('Fetching all meals, page:', page);
      response = await axios.get<PaginatedResponse<Meal>>(`${BASE_URL}/list`, {
        params: { page }
      });
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

    if (!searchValue) {
      return fetchMealList(1);
    }

    const response = await axios.get<PaginatedResponse<Meal>>(`${BASE_URL}/search`, {
      params: {
        q: searchValue,
        page: 1
      }
    });

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
    console.error("Error searching meals:", error);
  }
}

async function toggleMealStatus(meal: Meal) {
  const originalStatus = meal.active;
  meal.active = !meal.active;

  try {
    await axios.post(`${BASE_URL}/meal/${meal.id}/toggle-status`);
  } catch (error) {
    console.error("Error toggling meal status:", error);
    meal.active = originalStatus;
  }
}

// Fetch the first page on component mount
onMounted(() => fetchMealList(1));
</script>

<style scoped>
.pagination-controls {
  margin-bottom: 2.5rem;
  padding: 1rem;
}
</style>
