<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search ingredients"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4 gap-2">
          <div class="flex-grow"></div>
          <div class="flex">
            <ion-button @click="toggleNameSort" size="small" fill="clear">
              A-Z {{ nameDirection === 'asc' ? '↑' : '↓' }}
            </ion-button>
            <ion-button @click="addNewIngredient" size="small" color="primary">
              Add +
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <RetryConnection v-if="loadError" @retry="retryConnection" />

      <!-- Add New Ingredient Form -->
      <form v-if="isAddingNew" @submit.prevent="saveNewIngredient" class="p-4">
        <div class="flex items-center">
          <ion-input v-model="newIngredientName" required placeholder="New ingredient name"
            class="flex-grow"></ion-input>
          <ion-button type="submit" size="small" color="success">
            <ion-icon :icon="checkmark" />
          </ion-button>
          <ion-button @click="isAddingNew = false" size="small" color="medium">
            <ion-icon :icon="close" />
          </ion-button>
        </div>
      </form>

      <ion-list v-if="!loadError">
        <ion-item v-for="ingredient in ingredients" :key="ingredient.id">
          <!-- View Mode -->
          <div v-if="editingId !== ingredient.id" class="flex items-center w-full justify-between">
            <ion-label>
              <h2>{{ ingredient.name }}</h2>
            </ion-label>
            <div>
              <ion-button @click="startEditing(ingredient)" color="warning" size="small" class="mr-2">
                <ion-icon :icon="createOutline" />
              </ion-button>
              <ion-button @click="confirmDelete(ingredient)" color="danger" size="small">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
          </div>
          <!-- Edit Mode -->
          <form v-else @submit.prevent="saveEdit(ingredient)" class="flex items-center w-full justify-between">
            <ion-input v-model="editName" required class="flex-grow"></ion-input>
            <div class="flex">
              <ion-button type="submit" size="small" color="success" class="mr-2">
                <ion-icon :icon="checkmark" />
              </ion-button>
              <ion-button @click="cancelEdit" size="small" color="medium">
                <ion-icon :icon="close" />
              </ion-button>
            </div>
          </form>
        </ion-item>
      </ion-list>

      <div class="my-2 p-2">
        <ion-toolbar>
          <div class="flex items-center justify-between">
            <ion-button @click="fetchIngredients(meta.current_page - 1)" :disabled="!links.prev" fill="clear"
              size="small">
              Previous
            </ion-button>
            <ion-text class="text-xs text-center items-center">
              Page {{ meta.current_page }} / {{ meta.last_page }}
            </ion-text>
            <ion-button @click="fetchIngredients(meta.current_page + 1)" :disabled="!links.next" fill="clear"
              size="small">
              Next
            </ion-button>
          </div>
        </ion-toolbar>
      </div>
    </ion-content>

    <!-- Delete Confirmation Alert -->
    <ion-alert :is-open="showDeleteConfirm" header="Confirm Delete"
      message="Are you sure you want to delete this ingredient? This may affect recipes using this ingredient."
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { showDeleteConfirm = false; }
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => { deleteIngredient(); }
        }
      ]"></ion-alert>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PaginationMeta, PaginationLinks } from '@/types/pagination';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonSearchbar,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonText,
  IonAlert,
  IonInput
} from '@ionic/vue';
import { createOutline, trashOutline, checkmark, close } from 'ionicons/icons';
import api from '@/api/axios';
import RetryConnection from '@/components/RetryConnection.vue';
import type { Ingredient } from '@/types/ingredient';

// State
const loadError = ref(false);
const ingredients = ref<Ingredient[]>([]);
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
const nameDirection = ref<'asc' | 'desc'>('asc');
const showDeleteConfirm = ref(false);
const ingredientToDelete = ref<Ingredient | null>(null);

// Inline editing state
const editingId = ref<number | null>(null);
const editName = ref('');
const isAddingNew = ref(false);
const newIngredientName = ref('');

// Functions
function addNewIngredient() {
  isAddingNew.value = true;
  newIngredientName.value = '';
  editingId.value = null; // Cancel any ongoing edits
}

function startEditing(ingredient: Ingredient) {
  editingId.value = ingredient.id;
  editName.value = ingredient.name;
  isAddingNew.value = false; // Cancel adding new if in progress
}

function cancelEdit() {
  editingId.value = null;
  editName.value = '';
}

function toggleNameSort() {
  nameDirection.value = nameDirection.value === 'asc' ? 'desc' : 'asc';
  fetchIngredients(1);
}

function confirmDelete(ingredient: Ingredient) {
  ingredientToDelete.value = ingredient;
  showDeleteConfirm.value = true;
}

async function saveNewIngredient() {
  try {
    if (!newIngredientName.value.trim()) return;
    
    await api.post('/ingredients', { name: newIngredientName.value.trim() });
    fetchIngredients(meta.value.current_page);
    isAddingNew.value = false;
    newIngredientName.value = '';
  } catch (error) {
    console.error("Error creating ingredient:", error);
  }
}

async function saveEdit(ingredient: Ingredient) {
  try {
    if (!editName.value.trim()) return;
    
    await api.put(`/ingredients/${ingredient.id}`, { name: editName.value.trim() });
    fetchIngredients(meta.value.current_page);
    editingId.value = null;
    editName.value = '';
  } catch (error) {
    console.error("Error updating ingredient:", error);
  }
}

async function deleteIngredient() {
  try {
    if (!ingredientToDelete.value) return;
    
    await api.delete(`/ingredients/${ingredientToDelete.value.id}`);
    fetchIngredients(meta.value.current_page);
  } catch (error) {
    console.error("Error deleting ingredient:", error);
  } finally {
    showDeleteConfirm.value = false;
    ingredientToDelete.value = null;
  }
}

async function fetchIngredients(page = 1) {
  try {
    loadError.value = false;
    const params: Record<string, string | number> = {
      page,
      sort_direction: nameDirection.value,
      sort_field: 'name'
    };
    
    if (currentSearch.value) {
      params['search'] = currentSearch.value;
    }
    
    const response = await api.get('/ingredients', { params });
    if (Array.isArray(response.data)) {
      ingredients.value = response.data;
      meta.value = {
        current_page: 1,
        last_page: 1,
        per_page: response.data.length,
        total: response.data.length,
        from: 1,
        to: response.data.length,
        prev_page_url: null,
        next_page_url: null
      };
      links.value = { prev: null, next: null };
    } else {
      ingredients.value = response.data.data || response.data;

      if (response.data.meta || response.data.current_page) {
        meta.value = {
          current_page: response.data.current_page || response.data.meta?.current_page || 1,
          last_page: response.data.last_page || response.data.meta?.last_page || 1,
          per_page: response.data.per_page || response.data.meta?.per_page || 10,
          total: response.data.total || response.data.meta?.total || 0,
          from: response.data.from || response.data.meta?.from || 0,
          to: response.data.to || response.data.meta?.to || 0,
          prev_page_url: response.data.prev_page_url || response.data.links?.prev || null,
          next_page_url: response.data.next_page_url || response.data.links?.next || null
        };
        
        links.value = {
          prev: response.data.prev_page_url || response.data.links?.prev || null,
          next: response.data.next_page_url || response.data.links?.next || null
        };
      }
    }
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    loadError.value = true;
  }
}

function retryConnection() {
  return fetchIngredients(meta.value.current_page);
}

async function search(event: CustomEvent) {
  const searchValue = (event.target as HTMLIonSearchbarElement).value?.trim() ?? '';
  currentSearch.value = searchValue;
  fetchIngredients(1);
}

onMounted(() => {
  fetchIngredients(1);
});
</script>
