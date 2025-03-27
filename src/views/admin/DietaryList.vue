<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search dietaries"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4 gap-2">
          <div class="flex-grow"></div>
          <div class="flex">
            <ion-button @click="dietaryStore.toggleSortDirection()" size="small" fill="clear">
              A-Z {{ dietaryStore.nameDirection === 'asc' ? '↑' : '↓' }}
            </ion-button>
            <ion-button @click="addNewDietary" size="small" color="primary">
              Add +
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <RetryConnection v-if="dietaryStore.loadError" @retry="retryConnection" />

      <!-- Add New Dietary Form -->
      <form v-if="isAddingNew" @submit.prevent="saveNewDietary" class="p-4">
        <div class="flex items-center justify-between">
          <ion-input v-model="newDietaryName" required placeholder="New dietary name"
            class="flex-grow"></ion-input>
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

      <ion-list v-if="!dietaryStore.loadError">
        <ion-item v-for="dietary in dietaryStore.dietary" :key="dietary.id">
          <!-- View Mode -->
          <div v-if="editingId !== dietary.id" class="flex items-center w-full justify-between">
            <ion-label>
              <h2>{{ dietary.name }}</h2>
            </ion-label>
            <div>
              <ion-button @click="startEditing(dietary)" color="warning" size="small" class="mr-2">
                <ion-icon :icon="createOutline" />
              </ion-button>
              <ion-button @click="confirmDelete(dietary)" color="danger" size="small">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
          </div>
          <!-- Edit Mode -->
          <form v-else @submit.prevent="saveEdit(dietary)" class="flex items-center w-full">
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
            <ion-button @click="dietaryStore.fetchDietary(dietaryStore.currentPage - 1)"
              :disabled="!dietaryStore.hasPrevPage" fill="clear"
              size="small">
              Previous
            </ion-button>
            <ion-text class="text-xs text-center items-center">
              Page {{ dietaryStore.currentPage }} / {{ dietaryStore.lastPage }}
            </ion-text>
            <ion-button @click="dietaryStore.fetchDietary(dietaryStore.currentPage + 1)"
              :disabled="!dietaryStore.hasNextPage" fill="clear"
              size="small">
              Next
            </ion-button>
          </div>
        </ion-toolbar>
      </div>
    </ion-content>

    <!-- Delete Confirmation Alert -->
    <ion-alert :is-open="showDeleteConfirm" header="Confirm Delete"
      message="Are you sure you want to delete this dietary? This may affect recipes using this dietary." :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { showDeleteConfirm = false; }
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => { deleteDietary(); }
        }
      ]"></ion-alert>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
import type { Dietary } from '@/types/dietary';

import { useDietaryStore } from '@/store/useDietaryStore';

// State
const dietaryStore = useDietaryStore();

const searchTerm = ref('');
const showDeleteConfirm = ref(false);
const dietaryToDelete = ref<Dietary | null>(null);

// Inline editing state
const editingId = ref<number | null>(null);
const editName = ref('');
const isAddingNew = ref(false);
const newDietaryName = ref('');

// Functions
function addNewDietary() {
  isAddingNew.value = true;
  newDietaryName.value = '';
  editingId.value = null; // Cancel any ongoing edits
}

function startEditing(dietary: Dietary) {
  editingId.value = dietary.id;
  editName.value = dietary.name;
  isAddingNew.value = false; // Cancel adding new if in progress
}

function cancelEdit() {
  editingId.value = null;
  editName.value = '';
}

function confirmDelete(dietary: Dietary) {
  dietaryToDelete.value = dietary;
  showDeleteConfirm.value = true;
}

async function saveNewDietary() {
    if (!newDietaryName.value.trim()) return;
    
    const result = await dietaryStore.createDietary(newDietaryName.value);
    if(result) {
    isAddingNew.value = false;
    newDietaryName.value = '';
  }
}

async function saveEdit(dietary: Dietary) {
    if (!editName.value.trim()) return;
    
    const success = await dietaryStore.updateDietary(dietary.id, editName.value);
    if(success) {
      editingId.value = null;
      editName.value = '';
    }
}

async function deleteDietary() {
    if (!dietaryToDelete.value) return;
    
    await dietaryStore.deleteDietary(dietaryToDelete.value.id);
    showDeleteConfirm.value = false;
    dietaryToDelete.value = null;
}

async function search(event: CustomEvent) {
  const searchValue = (event.target as HTMLIonSearchbarElement).value?.trim() ?? '';
  dietaryStore.searchDietary(searchValue);
}

function retryConnection() {
  return dietaryStore.fetchDietary(dietaryStore.currentPage);
}
onMounted(() => {
  dietaryStore.fetchDietary(1);
});
</script>
