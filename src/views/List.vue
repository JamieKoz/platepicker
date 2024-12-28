<template>
  <ion-header>
    <ion-toolbar>
      <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300" placeholder="Search meals"></ion-searchbar>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item v-for="meal in meals" :key="meal.id">
        <ion-label>{{ meal.title }}</ion-label>
        <ion-button @click="toggleMealStatus(meal)" color="danger" size="small" v-if="meal.active">Deactivate</ion-button>
        <ion-button @click="toggleMealStatus(meal)" color="success" size="small" v-else>Activate</ion-button>
      </ion-item>
    </ion-list>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <ion-toolbar class="flex justify-between">
        <ion-button @click="fetchMealList(meta.current_page - 1)" :disabled="!links.prev" fill="clear" size="small">
          Previous
        </ion-button>
        <ion-text class="text-xs text-center items-center">Page {{ meta.current_page }} / {{ meta.last_page
          }}</ion-text>
        <ion-button @click="fetchMealList(meta.current_page + 1)" :disabled="!links.next" fill="clear" size="small">
          Next
        </ion-button>
      </ion-toolbar>
    </div>
  </ion-content>
</template>



<script setup lang="ts">
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

// Data refs
const meals = ref([]);
const meta = ref({});
const links = ref({});
const searchTerm = ref('');
const BASE_URL = 'http://127.0.0.1:8000/api';
const currentSearch = ref('');

async function fetchMealList(page = 1) {
  try {
    // Always use the currentSearch value, not searchTerm
    if (currentSearch.value) {
      console.log('Fetching search results for:', currentSearch.value, 'page:', page);
      const response = await axios.get(`${BASE_URL}/search`, {
        params: {
          q: currentSearch.value,
          page: page
        }
      });
      meals.value = response.data.data;
      meta.value = response.data;
      links.value = {
        prev: response.data.prev_page_url,
        next: response.data.next_page_url,
      };
    } else {
      console.log('Fetching all meals, page:', page);
      const response = await axios.get(`${BASE_URL}/list?page=${page}`);
      meals.value = response.data.data;
      meta.value = response.data;
      links.value = {
        prev: response.data.prev_page_url,
        next: response.data.next_page_url,
      };
    }
  } catch (error) {
    console.error("Error fetching meals:", error);
  }
}

async function search(event: any) {
  try {
    const searchValue = event.target.value?.trim();
    currentSearch.value = searchValue; // Update the persistent search value

    if (!searchValue) {
      return fetchMealList(1);
    }

    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: searchValue,
        page: 1 // Reset to first page on new search
      }
    });

    meals.value = response.data.data;
    meta.value = response.data;
    links.value = {
      prev: response.data.prev_page_url,
      next: response.data.next_page_url,
    };
  } catch (error) {
    console.error("Error searching meals:", error);
  }
}

function toggleMealStatus(meal) {
  meal.active = !meal.active; // Optimistically update status on frontend
  axios.post(`${BASE_URL}/meal/${meal.id}/toggle-status`) // Use meal ID in URL
    .catch(error => {
      console.error("Error toggling meal status:", error);
      meal.active = !meal.active; // Revert status on error
    });
}

const filteredMeals = computed(() => {
  return meals.value.filter(meal =>
    meal.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// Fetch the first page on component mount
onMounted(() => fetchMealList(1));
</script>

<style scoped>
.pagination-controls {
  margin-bottom: 2.5rem;
  /* Adjust this value based on your tab bar height */
  padding: 1rem;
}
</style>
