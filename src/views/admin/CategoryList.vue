<template>
  <ion-page>
    <ion-header class="mt-12">
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" @ionInput="search" :debounce="300"
          placeholder="Search categories"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="flex justify-between px-4 gap-2">
          <div class="flex-grow"></div>
          <div class="flex">
            <ion-button @click="categoryStore.toggleSortDirection()" size="small" fill="clear">
              A-Z {{ categoryStore.nameDirection === 'asc' ? '↑' : '↓' }}
            </ion-button>
            <ion-button @click="addNewCategory" size="small" color="primary">
              Add +
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <RetryConnection v-if="categoryStore.loadError" @retry="retryConnection" />

      <!-- Add New Category Form -->
      <form v-if="isAddingNew" @submit.prevent="saveNewCategory" class="p-4">
        <div class="flex items-center justify-between">
          <ion-input v-model="newCategoryName" required placeholder="New category name"
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

      <ion-list v-if="!categoryStore.loadError">
        <ion-item v-for="category in categoryStore.categories" :key="category.id">
          <!-- View Mode -->
          <div v-if="editingId !== category.id" class="flex items-center w-full justify-between">
            <ion-label>
              <h2>{{ category.name }}</h2>
            </ion-label>
            <div>
              <ion-button @click="startEditing(category)" color="warning" size="small" class="mr-2">
                <ion-icon :icon="createOutline" />
              </ion-button>
              <ion-button @click="confirmDelete(category)" color="danger" size="small">
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
          </div>
          <!-- Edit Mode -->
          <form v-else @submit.prevent="saveEdit(category)" class="flex items-center w-full">
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
            <ion-button @click="categoryStore.fetchCategories(categoryStore.currentPage - 1)"
              :disabled="!categoryStore.hasPrevPage" fill="clear" size="small">
              Previous
            </ion-button>
            <ion-text class="text-xs text-center items-center">
              Page {{ categoryStore.currentPage }} / {{ categoryStore.lastPage }}
            </ion-text>
            <ion-button @click="categoryStore.fetchCategories(categoryStore.currentPage + 1)"
              :disabled="!categoryStore.hasNextPage" fill="clear" size="small">
              Next
            </ion-button>
          </div>
        </ion-toolbar>
      </div>
    </ion-content>

    <!-- Delete Confirmation Alert -->
    <ion-alert :is-open="showDeleteConfirm" header="Confirm Delete"
      message="Are you sure you want to delete this category? This may affect recipes using this category." :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { showDeleteConfirm = false; }
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => { deleteCategory(); }
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
import { useCategoryStore } from '@/store/useCategoryStore';
import type { Category } from '@/types/category';

// Initialize the store
const categoryStore = useCategoryStore();

// Local UI state
const searchTerm = ref('');
const showDeleteConfirm = ref(false);
const categoryToDelete = ref<Category | null>(null);

// Inline editing state
const editingId = ref<number | null>(null);
const editName = ref('');
const isAddingNew = ref(false);
const newCategoryName = ref('');

// Functions
function addNewCategory() {
  isAddingNew.value = true;
  newCategoryName.value = '';
  editingId.value = null; // Cancel any ongoing edits
}

function startEditing(category: Category) {
  editingId.value = category.id;
  editName.value = category.name;
  isAddingNew.value = false; // Cancel adding new if in progress
}

function cancelEdit() {
  editingId.value = null;
  editName.value = '';
}

function confirmDelete(category: Category) {
  categoryToDelete.value = category;
  showDeleteConfirm.value = true;
}

async function saveNewCategory() {
  if (!newCategoryName.value.trim()) return;
  
  const result = await categoryStore.createCategory(newCategoryName.value);
  if (result) {
    isAddingNew.value = false;
    newCategoryName.value = '';
  }
}

async function saveEdit(category: Category) {
  if (!editName.value.trim()) return;
  
  const success = await categoryStore.updateCategory(category.id, editName.value);
  if (success) {
    editingId.value = null;
    editName.value = '';
  }
}

async function deleteCategory() {
  if (!categoryToDelete.value) return;
  
  await categoryStore.deleteCategory(categoryToDelete.value.id);
  showDeleteConfirm.value = false;
  categoryToDelete.value = null;
}

function retryConnection() {
  return categoryStore.fetchCategories(categoryStore.currentPage);
}

async function search(event: CustomEvent) {
  const searchValue = (event.target as HTMLIonSearchbarElement).value?.trim() ?? '';
  categoryStore.searchCategories(searchValue);
}

onMounted(() => {
  categoryStore.fetchCategories(1);
});
</script>
