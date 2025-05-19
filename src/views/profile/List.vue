<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search meals"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4 gap-2">
          <ion-select v-model="groupBy" interface="popover" @ionChange="handleGroupChange" placeholder="Group by"
            class="group-select">
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
      <div v-if="groupBy === 'none' && !loadError">
        <ion-list>
          <ion-item v-for="meal in meals" :key="meal.id">
            <ion-label @click="router.push(`/user-meals/${meal.id}`)">
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

        <!-- Pagination for non-grouped view -->
        <div class="my-2 p-2">
          <ion-toolbar>
            <div class="flex items-center justify-between">
              <ion-button @click="fetchMealList(meta.current_page - 1)" :disabled="!links.prev" fill="clear"
                size="small">
                Previous
              </ion-button>
              <ion-text class="text-xs text-center items-center">
                Page {{ meta.current_page }} / {{ meta.last_page }}
              </ion-text>
              <ion-button @click="fetchMealList(meta.current_page + 1)" :disabled="!links.next" fill="clear"
                size="small">
                Next
              </ion-button>
            </div>
          </ion-toolbar>
        </div>
      </div>

      <!-- When grouping by criteria -->
      <div v-else-if="!loadError">
        <div v-for="group in groupedMeals" :key="group.name" class="mb-6">
          <ion-list-header class="flex justify-between">
            <ion-label>{{ group.name }}</ion-label>
            <ion-text class="text-sm text-gray-500">{{ group.total_user_meals }} recipes</ion-text>
          </ion-list-header>

          <ion-list>
            <ion-item v-for="meal in group.user_meals" :key="meal.id">
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

            <ion-item v-if="group.has_more" button detail @click="loadMoreForGroup(group.id, group.name)">
              <ion-label class="text-center text-blue-500">
                Load more {{ group.name }} recipes
              </ion-label>
            </ion-item>
          </ion-list>
        </div>

        <div v-if="groupPagination" class="my-4 p-2">
          <ion-toolbar>
            <div class="flex items-center justify-between">
              <ion-button @click="fetchGroupedMeals(groupPagination.current_page - 1)"
                :disabled="!groupPagination.prev_page_url" fill="clear" size="small">
                Previous Group Set
              </ion-button>
              <ion-text class="text-xs text-center items-center">
                Groups {{ groupPagination.from }}-{{ groupPagination.to }}
                of {{ groupPagination.total_groups }}
              </ion-text>
              <ion-button @click="fetchGroupedMeals(groupPagination.current_page + 1)"
                :disabled="!groupPagination.next_page_url" fill="clear" size="small">
                Next Group Set
              </ion-button>
            </div>
          </ion-toolbar>
        </div>
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
import { useRouter } from 'vue-router';
const router = useRouter();

interface Group {
  id: number;
  name: string;
  total_user_meals: number;
  user_meals: Meal[];
  has_more: boolean;
}

interface GroupPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total_groups: number;
  from: number;
  to: number;
  prev_page_url: string | null;
  next_page_url: string | null;
}

const loadError = ref(false);
const isRecipeBrowserOpen = ref(false);
const meals = ref<Meal[]>([]);
const groupedMeals = ref<Group[]>([]);
const groupPagination = ref<GroupPagination | null>(null);
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

function handleGroupChange() {
  // Persisting user preference in localStorage
  localStorage.setItem('mealListGroupBy', groupBy.value);

  // Refresh data with new grouping
  refreshData();
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
  refreshData();
}

function toggleTitleSort() {
  titleDirection.value = titleDirection.value === 'asc' ? 'desc' : 'asc';
  refreshData();
}

function refreshData() {
  if (groupBy.value === 'none') {
    fetchMealList(1);
  } else {
    fetchGroupedMeals(1);
  }
}

async function fetchMealList(page = 1) {
  try {
    loadError.value = false;
    let response;
    const params = {
      page,
      active_direction: activeDirection.value,
      title_direction: titleDirection.value,
      group_by: 'none'
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

async function fetchGroupedMeals(page = 1) {
  try {
    loadError.value = false;
    let response;
    const params = {
      page,
      active_direction: activeDirection.value,
      title_direction: titleDirection.value,
      group_by: groupBy.value
    };

    if (currentSearch.value) {
      response = await api.get(`/user-meals/search`, { params: { ...params, q: currentSearch.value } });
    } else {
      response = await api.get(`/user-meals/list`, { params });
    }

    if (response.data.grouped) {
      groupedMeals.value = response.data.groups;
      groupPagination.value = response.data.pagination;
    } else {
      console.error("Expected grouped data but received paginated response");
      loadError.value = true;
    }
  } catch (error) {
    loadError.value = true;
    console.error("Error fetching grouped meals:", error);
  }
}

async function loadMoreForGroup(groupId: number, groupName: string) {
  try {
    const params = {
      active_direction: activeDirection.value,
      title_direction: titleDirection.value,
      group_by: groupBy.value,
      group_id: groupId,
      full_group: true
    };

    let response;
    if (currentSearch.value) {
      response = await api.get(`/user-meals/search`, { params: { ...params, q: currentSearch.value } });
    } else {
      response = await api.get(`/user-meals/list`, { params });
    }

    if (response.data && response.data.user_meals) {
      // Find and update the specific group with complete recipes list
      const groupIndex = groupedMeals.value.findIndex(g => g.id === groupId);
      if (groupIndex !== -1) {
        groupedMeals.value[groupIndex].user_meals = response.data.user_meals;
        groupedMeals.value[groupIndex].has_more = false;
      }
    }
  } catch (error) {
    console.error(`Error loading more recipes for ${groupName}:`, error);
  }
}

function retryConnection() {
  loadError.value = false;
  refreshData();
}

async function search(event: CustomEvent) {
  try {
    const searchValue = (event.target as HTMLIonSearchbarElement).value?.trim() ?? '';
    currentSearch.value = searchValue;
    refreshData();
  } catch (error) {
    console.error("Error searching meals:", error);
  }
}

async function toggleMealStatus(meal: Meal) {
  const originalStatus = meal.active;
  meal.active = !meal.active;

  try {
    await api.post(`/user-meals/${meal.id}/toggle-status`);
    refreshData();
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

  refreshData();
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
