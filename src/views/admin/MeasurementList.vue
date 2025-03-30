<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search measurements"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4 gap-2">
          <div class="flex-grow"></div>
          <div class="flex">
            <ion-button @click="measurementStore.toggleSortDirection()" size="small" fill="clear">
              A-Z {{ measurementStore.nameDirection === 'asc' ? '↑' : '↓' }}
            </ion-button>
            <ion-button @click="addNewMeasurement" size="small" color="primary">
              Add +
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <RetryConnection v-if="measurementStore.loadError" @retry="retryConnection" />

      <!-- Add New Measurement Form -->
      <form v-if="isAddingNew" @submit.prevent="saveNewMeasurement" class="p-4">
        <div class="flex items-center">
          <ion-input v-model="newMeasurementName" required placeholder="New measurement name"
            class="flex-grow"></ion-input>
          <div class="flex">
            <ion-button type="submit" size="small" color="success">
              <ion-icon :icon="checkmark" />
            </ion-button>
            <ion-button @click="isAddingNew = false" size="small" color="medium">
              <ion-icon :icon="close" />
            </ion-button>
          </div>
        </div>
      </form>

      <ion-list v-if="!measurementStore.loadError">
        <ion-item v-for="measurement in measurementStore.measurement" :key="measurement.id">
          <!-- View Mode -->
          <div v-if="editingId !== measurement.id" class="flex items-center w-full justify-between">
            <ion-label>
              <h2>{{ measurement.name }}</h2>
            </ion-label>
            <div>
              <ion-button @click="startEditing(measurement)" color="warning" size="small" class="mr-2">
                <ion-icon :icon="createOutline" />
              </ion-button>
              <ion-button @click="confirmDelete(measurement)" color="danger" size="small">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
          </div>
          <!-- Edit Mode -->
          <form v-else @submit.prevent="saveEdit(measurement)" class="flex items-center w-full">
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
            <ion-button @click="measurementStore.fetchMeasurement(measurementStore.currentPage - 1)"
              :disabled="!measurementStore.hasPrevPage" fill="clear" size="small">
              Previous
            </ion-button>
            <ion-text class="text-xs text-center items-center">
              Page {{ measurementStore.currentPage }} / {{ measurementStore.lastPage }}
            </ion-text>
            <ion-button @click="measurementStore.fetchMeasurement(measurementStore.currentPage + 1)"
              :disabled="!measurementStore.hasNextPage" fill="clear" size="small">
              Next
            </ion-button>
          </div>
        </ion-toolbar>
      </div>
    </ion-content>

    <!-- Delete Confirmation Alert -->
    <ion-alert :is-open="showDeleteConfirm" header="Confirm Delete"
      message="Are you sure you want to delete this measurement? This may affect recipes using this measurement."
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { showDeleteConfirm = false; }
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => { deleteMeasurement(); }
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
import type { Measurement } from '@/types/measurement';

import { useMeasurementStore } from '@/store/useMeasurementStore';

// State
const measurementStore = useMeasurementStore();

const searchTerm = ref('');
const showDeleteConfirm = ref(false);
const measurementToDelete = ref<Measurement | null>(null);

// Inline editing state
const editingId = ref<number | null>(null);
const editName = ref('');
const isAddingNew = ref(false);
const newMeasurementName = ref('');

// Functions
function addNewMeasurement() {
  isAddingNew.value = true;
  newMeasurementName.value = '';
  editingId.value = null; // Cancel any ongoing edits
}

function startEditing(measurement: Measurement) {
  editingId.value = measurement.id;
  editName.value = measurement.name;
  isAddingNew.value = false; // Cancel adding new if in progress
}

function cancelEdit() {
  editingId.value = null;
  editName.value = '';
}

function confirmDelete(measurement: Measurement) {
  measurementToDelete.value = measurement;
  showDeleteConfirm.value = true;
}

async function saveNewMeasurement() {
    if (!newMeasurementName.value.trim()) return;
    
    const result = await measurementStore.createMeasurement(newMeasurementName.value);
    if(result) {
    isAddingNew.value = false;
    newMeasurementName.value = '';
  }
}

async function saveEdit(measurement: Measurement) {
    if (!editName.value.trim()) return;
    
    const success = await measurementStore.updateMeasurement(measurement.id, editName.value);
    if(success) {
      editingId.value = null;
      editName.value = '';
    }
}

async function deleteMeasurement() {
    if (!measurementToDelete.value) return;
    
    await measurementStore.deleteMeasurement(measurementToDelete.value.id);
    showDeleteConfirm.value = false;
    measurementToDelete.value = null;
}

async function search(event: CustomEvent) {
  const searchValue = (event.target as HTMLIonSearchbarElement).value?.trim() ?? '';
  measurementStore.searchMeasurement(searchValue);
}

function retryConnection() {
  return measurementStore.fetchMeasurement(measurementStore.currentPage);
}
onMounted(() => {
  measurementStore.fetchMeasurement(1);
});
</script>
