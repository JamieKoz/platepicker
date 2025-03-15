<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search meals"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4 gap-2">
          <ion-select v-model="groupBy" interface="popover" @ionChange="handleGroupChange" 
            placeholder="Group by" class="group-select">
            <ion-select-option value="none">None</ion-select-option>
            <ion-select-option value="cuisine">Cuisine</ion-select-option>
            <ion-select-option value="category">Category</ion-select-option>
            <ion-select-option value="dietary">Dietary</ion-select-option>
          </ion-select>
          
          <div class="flex">
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
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <RetryConnection v-if="loadError" @retry="retryConnection" />
      
      <!-- When not grouping -->
      <ion-list v-if="groupBy === 'none' && !loadError">
        <ion-item v-for="meal in meals" :key="meal.id">
          <ion-label>
            <h2>{{ meal.title }}</h2>
          </ion-label>
          <ion-button @click="openEditModal(meal)" color="warning" size="small" class="mr-2">
            <ion-icon :icon="createOutline" />
          </ion-button>
          <ion-button @click="toggleMealStatus(meal)" :color="meal.active ? 'danger' : 'success'" size="small">
            {{ meal.active ? 'Deactivate' : 'Activate' }}
          </ion-button>
        </ion-item>
      </ion-list>

      <!-- When grouping by criteria -->
      <div v-else-if="!loadError">
        <ion-list v-for="(group, groupName) in groupedMeals" :key="groupName">
          <ion-list-header>
            <ion-label>{{ groupName || 'Uncategorized' }}</ion-label>
          </ion-list-header>
          
          <ion-item v-for="meal in group" :key="meal.id">
            <ion-label>
              <h2>{{ meal.title }}</h2>
            </ion-label>
            <ion-button @click="openEditModal(meal)" color="warning" size="small" class="mr-2">
              <ion-icon :icon="createOutline" />
            </ion-button>
            <ion-button @click="toggleMealStatus(meal)" :color="meal.active ? 'danger' : 'success'" size="small">
              {{ meal.active ? 'Deactivate' : 'Activate' }}
            </ion-button>
          </ion-item>
        </ion-list>
      </div>

      <div class="my-2 p-2">
        <ion-toolbar>
          <div class="flex items-center justify-between">
            <ion-button @click="fetchMealList(meta.current_page - 1)" :disabled="!links.prev" fill="clear" size="small">
              Previous
            </ion-button>
            <ion-text class="text-xs text-center items-center">
              Page {{ meta.current_page }} / {{ meta.last_page }}
            </ion-text>
            <ion-button @click="fetchMealList(meta.current_page + 1)" :disabled="!links.next" fill="clear" size="small">
              Next
            </ion-button>
          </div>
        </ion-toolbar>
      </div>
    </ion-content>
    
    <RecipeBrowser :is-open="isRecipeBrowserOpen" @close="isRecipeBrowserOpen = false"
      @open-create-modal="openCreateModal" @recipe-added="fetchMealList(1)" />
    
    <MealFormModal :is-open="isModalOpen" :editing-meal="editingMeal" @close="closeModal"
      @saved="fetchMealList(meta.current_page)" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Meal } from '@/types/meal';
import type { PaginationMeta, PaginationLinks } from '@/types/pagination';
import {
  IonHeader, IonToolbar, IonSearchbar, IonContent, IonList, IonListHeader,
  IonItem, IonLabel, IonButton, IonText, IonPage, IonModal, IonSelect,
  IonSelectOption, IonTitle, IonButtons, IonIcon
} from '@ionic/vue';
import api from '@/api/axios';
import RecipeBrowser from '@/components/RecipeBrowser.vue';
import MealFormModal from '@/components/MealFormModal.vue';
import RetryConnection from '@/components/RetryConnection.vue';
import { createOutline } from 'ionicons/icons';

const loadError = ref(false);
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
const groupBy = ref<'none' | 'cuisine' | 'category' | 'dietary'>('none');

// Group meals by selected criteria
const groupedMeals = computed(() => {
  if (groupBy.value === 'none') {
    return {};
  }

  const grouped: Record<string, Meal[]> = {};
  
  meals.value.forEach(meal => {
    let groupNames: string[] = [];
    
    if (groupBy.value === 'cuisine' && meal.cuisines && meal.cuisines.length) {
      groupNames = meal.cuisines.map(c => c.name);
    } else if (groupBy.value === 'category' && meal.categories && meal.categories.length) {
      groupNames = meal.categories.map(c => c.name);
    } else if (groupBy.value === 'dietary' && meal.dietary_items && meal.dietary_items.length) {
      groupNames = meal.dietary_items.map(d => d.name);
    } else {
      // Fall back to string property if relational data is not available
      if (groupBy.value === 'cuisine' && meal.cuisine) {
        groupNames = [meal.cuisine];
      } else if (groupBy.value === 'category' && meal.category) {
        groupNames = meal.category.split(',').map(c => c.trim());
      } else if (groupBy.value === 'dietary' && meal.dietary) {
        const dietaryValue = typeof meal.dietary === 'string' 
          ? meal.dietary.split(',').map(d => d.trim())
          : Array.isArray(meal.dietary) 
            ? meal.dietary 
            : [String(meal.dietary)]; // Convert to string if it's an object or other type
        groupNames = dietaryValue;
      }
    }
    
    // If no group found, add to "Uncategorized"
    if (groupNames.length === 0) {
      const group = grouped[''] || [];
      group.push(meal);
      grouped[''] = group;
      return;
    }
    
    // Add meal to each of its groups
    groupNames.forEach(groupName => {
      // Ensure groupName is a string (not an object)
      const groupKey = typeof groupName === 'object' 
        ? (groupName && 'name' in groupName ? groupName.name : 'Unknown')
        : groupName;
        
      const group = grouped[groupKey] || [];
      group.push(meal);
      grouped[groupKey] = group;
    });
  });
  
  // Sort the groups alphabetically by key
  return Object.keys(grouped)
    .sort((a, b) => {
      // Empty string (Uncategorized) always goes last
      if (a === '') return 1;
      if (b === '') return -1;
      return a.localeCompare(b);
    })
    .reduce((sortedGroups: Record<string, Meal[]>, key) => {
      sortedGroups[key] = grouped[key];
      return sortedGroups;
    }, {});
});

function handleGroupChange() {
  // Persisting user preference in localStorage
  localStorage.setItem('mealListGroupBy', groupBy.value);
}

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
    loadError.value = false;
    let response;
    const params = {
      page,
      active_direction: activeDirection.value,
      title_direction: titleDirection.value
    };

    if (currentSearch.value) {
      response = await api.get(`/user-meals/search`, { params: { ...params, q: currentSearch.value } });
    } else {
      response = await api.get(`/user-meals/list`, { params });
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
    loadError.value = true;
    console.error("Error fetching meals:", error);
  }
}

function retryConnection() {
  loadError.value = false;
  return fetchMealList(meta.value.current_page);
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

onMounted(() => {
  // Restore user's grouping preference if available
  const savedGroupBy = localStorage.getItem('mealListGroupBy');
  if (savedGroupBy && ['none', 'cuisine', 'category', 'dietary'].includes(savedGroupBy)) {
    groupBy.value = savedGroupBy as any;
  }
  
  fetchMealList(1);
});
</script>

<style scoped>
ion-list-header {
  background-color: var(--ion-color-light);
  font-weight: bold;
  text-transform: capitalize;
  margin-top: 8px;
}

.group-select {
  --padding-start: 8px;
  --padding-end: 8px;
  max-width: 110px;
  min-width: 80px;
  width: auto;
  border-radius: 4px;
  background: var(--ion-color-light);
  font-size: 0.85rem;
}
</style>
