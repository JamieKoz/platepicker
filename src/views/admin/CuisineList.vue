<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search cuisines"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4 gap-2">
          <div class="flex-grow"></div>
          <div class="flex">
            <ion-button @click="cuisineStore.toggleSortDirection()" size="small" fill="clear">
              A-Z {{ cuisineStore.nameDirection === 'asc' ? '↑' : '↓' }}
            </ion-button>
            <ion-button @click="addNewCuisine" size="small" color="primary">
              Add +
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <RetryConnection v-if="cuisineStore.loadError" @retry="retryConnection" />

      <!-- Add New Cuisine Form -->
      <form v-if="isAddingNew" @submit.prevent="saveNewCuisine" class="p-4">
        <div class="flex items-center justify-between">
          <ion-input v-model="newCuisineName" required placeholder="New cuisine name" class="flex-grow"></ion-input>
          <div>
            <ion-button type="submit" size="small" color="success">
              <ion-icon :icon="checkmark" />
            </ion-button>
            <ion-button @click="isAddingNew = false" size="small" color="medium">
              <ion-icon :icon="close" />
            </ion-button>
          </div>
        </div>
      </form>

      <ion-list v-if="!cuisineStore.loadError">
        <ion-item v-for="cuisine in cuisineStore.cuisine" :key="cuisine.id">
          <!-- View Mode -->
          <div v-if="editingId !== cuisine.id" class="flex items-center justify-between w-full">
            <ion-label>
              <h2>{{ cuisine.name }}</h2>
            </ion-label>
            <div>
            <ion-button @click="startEditing(cuisine)" color="warning" size="small" class="mr-2">
              <ion-icon :icon="createOutline" />
            </ion-button>
            <ion-button @click="confirmDelete(cuisine)" color="danger" size="small">
              <ion-icon :icon="trashOutline" />
            </ion-button>
              </div>
          </div>

          <!-- Edit Mode -->
          <form v-else @submit.prevent="saveEdit(cuisine)" class="flex items-center w-full">
            <ion-input v-model="editName" required class="flex-grow"></ion-input>
            <ion-button type="submit" size="small" color="success" class="mr-2">
              <ion-icon :icon="checkmark" />
            </ion-button>
            <ion-button @click="cancelEdit" size="small" color="medium">
              <ion-icon :icon="close" />
            </ion-button>
          </form>
        </ion-item>
      </ion-list>

      <div class="my-2 p-2">
        <ion-toolbar>
          <div class="flex items-center justify-between">
            <ion-button @click="cuisineStore.fetchCuisine(cuisineStore.currentPage - 1)"
              :disabled="!cuisineStore.hasPrevPage" fill="clear" size="small">
              Previous
            </ion-button>
            <ion-text class="text-xs text-center items-center">
              Page {{ cuisineStore.currentPage }} / {{ cuisineStore.lastPage }}
            </ion-text>
            <ion-button @click="cuisineStore.fetchCuisine(cuisineStore.currentPage + 1)"
              :disabled="!cuisineStore.hasNextPage" fill="clear" size="small">
              Next
            </ion-button>
          </div>
        </ion-toolbar>
      </div>
    </ion-content>

    <!-- Delete Confirmation Alert -->
    <ion-alert
      :is-open="showDeleteConfirm"
      header="Confirm Delete"
      message="Are you sure you want to delete this cuisine? This may affect recipes using this cuisine."
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { showDeleteConfirm = false; }
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => { deleteCuisine(); }
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
import RetryConnection from '@/components/RetryConnection.vue';
import type { Cuisine } from '@/types/cuisine';
import { useCuisineStore } from '@/store/useCuisineStore';

const cuisineStore = useCuisineStore();

// Local UI state
const searchTerm = ref('');
const showDeleteConfirm = ref(false);
const cuisineToDelete = ref<Cuisine | null>(null);

// Inline editing state
const editingId = ref<number | null>(null);
const editName = ref('');
const isAddingNew = ref(false);
const newCuisineName = ref('');


// Functions
function addNewCuisine() {
  isAddingNew.value = true;
  newCuisineName.value = '';
  editingId.value = null; // Cancel any ongoing edits
}

function startEditing(cuisine: Cuisine) {
  editingId.value = cuisine.id;
  editName.value = cuisine.name;
  isAddingNew.value = false; // Cancel adding new if in progress
}

function cancelEdit() {
  editingId.value = null;
  editName.value = '';
}

function confirmDelete(cuisine: Cuisine) {
  cuisineToDelete.value = cuisine;
  showDeleteConfirm.value = true;
}

async function saveNewCuisine() {
  if (!newCuisineName.value.trim()) return;
  
  const result = await cuisineStore.createCuisine(newCuisineName.value);
  if (result) {
    isAddingNew.value = false;
    newCuisineName.value = '';
  }
}

async function saveEdit(cuisine: Cuisine) {
  if (!editName.value.trim()) return;
  
  const success = await cuisineStore.updateCuisine(cuisine.id, editName.value);
  if (success) {
    editingId.value = null;
    editName.value = '';
  }
}

async function deleteCuisine() {
    if (!cuisineToDelete.value) return;
    
    await cuisineStore.deleteCuisine(cuisineToDelete.value.id);
    showDeleteConfirm.value = false;
    cuisineToDelete.value = null;
}


function retryConnection() {
  return cuisineStore.fetchCuisine(cuisineStore.currentPage);
}

async function search(event: CustomEvent) {
  const searchValue = (event.target as HTMLIonSearchbarElement).value?.trim() ?? '';
  cuisineStore.searchCuisine(searchValue);
}

onMounted(() => {
  cuisineStore.fetchCuisine(1);
});
</script>
