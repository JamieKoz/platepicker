<template>
  <ion-header>
    <ion-toolbar>
      <ion-searchbar v-model="searchTerm" @input="search" placeholder="Search meals"></ion-searchbar>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item v-for="meal in filteredMeals" :key="meal.id">
        <ion-label>{{ meal.title }}</ion-label>
        <ion-button @click="toggleMealStatus(meal) "color="success" v-if="meal.active">Active</ion-button>
        <ion-button @click="toggleMealStatus(meal)" color="danger" v-else>Inactive</ion-button>
      </ion-item>
    </ion-list>

    <!-- Pagination Controls -->
    <ion-toolbar>
      <ion-button @click="fetchMealList(meta.current_page - 1)" :disabled="!links.prev" fill="solid">
        Previous
      </ion-button>
      <ion-button @click="fetchMealList(meta.current_page + 1)" :disabled="!links.next" fill="solid">
        Next
      </ion-button>
      <ion-text>Page {{ meta.current_page }} of {{ meta.last_page }}</ion-text>
    </ion-toolbar>
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

// Fetch the meal list with pagination
async function fetchMealList(page = 1) {
  try {
    const response = await axios.get(`${BASE_URL}/list?page=${page}`);
    meals.value = response.data.data;
    console.log(meals.value);
    meta.value = response.data;
    links.value = {
      prev: response.data.prev_page_url,
      next: response.data.next_page_url,
    };
  } catch (error) {
    console.error("Error fetching meals:", error);
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

async function search() {
  try {
    const response = await axios.get(`${BASE_URL}/search?q=${searchTerm.value}`);
    meals.value = response.data; // Update meals with filtered results
  } catch (error) {
    console.error("Error searching meals:", error);
  }
}
// Fetch the first page on component mount
onMounted(() => fetchMealList(1));
</script>

