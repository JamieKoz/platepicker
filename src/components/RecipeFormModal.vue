//RecipeFormModal.vue
<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editingMeal ? 'Edit' : 'Add' }} Meal</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form @submit.prevent="saveMeal" class="max-w-2xl mx-auto">

        <!-- Avatar Image Section -->
        <div class="flex justify-center mb-6">
          <div @click="triggerImageUpload"
            class="relative w-32 h-32 rounded-full border-4 border-gray-300 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors duration-200 bg-gray-100 flex items-center justify-center">
            <img v-if="imagePreview || (editingMeal && editingMeal.image_name)"
              :src="imagePreview || (editingMeal?.image_name ? `https://dy9kit23m04xx.cloudfront.net/food-images/${editingMeal.image_name}.jpg` : '')"
              alt="Meal image" class="w-full h-full object-cover" />
            <div v-else class="text-center text-gray-500">
              <ion-icon name="camera" class="text-3xl mb-2"></ion-icon>
              <div class="text-xs">Upload Image</div>
            </div>

            <!-- Hidden file input -->
            <input ref="fileInput" type="file" @change="handleImageChange" accept="image/*" class="hidden">

            <!-- Edit overlay on hover -->
            <div
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <ion-icon name="camera" class="text-white text-2xl"></ion-icon>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end py-4 rounded-lg">
          <ion-toggle v-model="mealForm.active"></ion-toggle>
        </div>
        <div class="border-1 border-gray-300 rounded-lg">
          <ion-input v-model="mealForm.title" required placeholder="Title" class="mx-2"></ion-input>
        </div>

        <!-- Compact row for cooking time and serves -->
        <div class="grid grid-cols-2 gap-4 py-3">
          <div class="rounded-lg border-1 border-gray-300">
            <ion-label position="stacked" class="px-2 opacity-50">Cooking Time (min)</ion-label>
            <div class="mx-2">
              <ion-input type="number" step="5" v-model="mealForm.cooking_time" class="px-2"
                placeholder="30"></ion-input>
            </div>
          </div>

          <div class="rounded-lg border-1 border-gray-300">
            <ion-label position="stacked" class="px-2 opacity-50">Serves</ion-label>
            <div class="mx-2">
              <ion-input type="number" v-model="mealForm.serves" placeholder="4"></ion-input>
            </div>
          </div>
        </div>

        <!-- Categories with pills -->
        <div class="mb-4">
          <ion-label class="opacity-70 text-sm font-medium block mb-2">Categories</ion-label>
          <ion-select ref="categorySelectRef" :multiple="true" v-model="mealForm.category_ids"
            placeholder="Select categories" class="hidden" interface="popover" @ionChange="onCategoryChange">
            <ion-select-option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </ion-select-option>
          </ion-select>

          <div class="flex flex-wrap gap-2 mb-2">
            <div v-for="categoryId in mealForm.category_ids" :key="categoryId"
              class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {{ getCategoryName(categoryId) }}
              <button @click="removeCategory(categoryId)" type="button" class="text-blue-600 hover:text-blue-800">
                <ion-icon name="close-circle"></ion-icon>
              </button>
            </div>
          </div>

          <ion-button fill="outline" size="small" @click="openCategorySelect" class="w-full">
            <ion-icon name="add" slot="start"></ion-icon>
            Add Categories
          </ion-button>
        </div>

        <!-- Cuisine with pills -->
        <div class="mb-4">
          <ion-label class="opacity-70 text-sm font-medium block mb-2">Cuisine</ion-label>
          <ion-select ref="cuisineSelectRef" :multiple="true" v-model="mealForm.cuisine_ids"
            placeholder="Select cuisine" class="hidden" interface="popover" @ionChange="onCuisineChange">
            <ion-select-option v-for="cuisine in cuisineStore.cuisine" :key="cuisine.id" :value="cuisine.id">
              {{ cuisine.name }}
            </ion-select-option>
          </ion-select>

          <div class="flex flex-wrap gap-2 mb-2">
            <div v-for="cuisineId in mealForm.cuisine_ids" :key="cuisineId"
              class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {{ getCuisineName(cuisineId) }}
              <button @click="removeCuisine(cuisineId)" type="button" class="text-green-600 hover:text-green-800">
                <ion-icon name="close-circle"></ion-icon>
              </button>
            </div>
          </div>

          <ion-button fill="outline" size="small" @click="openCuisineSelect" class="w-full">
            <ion-icon name="add" slot="start"></ion-icon>
            Add Cuisine
          </ion-button>
        </div>

        <!-- Dietary Requirements with pills -->
        <div class="mb-4">
          <ion-label class="opacity-70 text-sm font-medium block mb-2">Dietary Requirements (max 3)</ion-label>
          <ion-select ref="dietarySelectRef" :multiple="true" v-model="mealForm.dietary_ids"
            placeholder="Select dietary requirements" class="hidden" interface="popover" @ionChange="onDietaryChange">
            <ion-select-option v-for="dietary in dietaryStore.dietary" :key="dietary.id" :value="dietary.id">
              {{ dietary.name }}
            </ion-select-option>
          </ion-select>

          <div class="flex flex-wrap gap-2 mb-2">
            <div v-for="dietaryId in mealForm.dietary_ids" :key="dietaryId"
              class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {{ getDietaryName(dietaryId) }}
              <button @click="removeDietary(dietaryId)" type="button" class="text-purple-600 hover:text-purple-800">
                <ion-icon name="close-circle"></ion-icon>
              </button>
            </div>
          </div>

          <ion-button fill="outline" size="small" @click="openDietarySelect" class="w-full"
            :disabled="mealForm.dietary_ids.length >= 3">
            <ion-icon name="add" slot="start"></ion-icon>
            Add Dietary Requirements
          </ion-button>

          <div v-if="dietaryError" class="text-red-500 text-sm mt-2">
            {{ dietaryError }}
          </div>
        </div>

        <RecipeLine v-model="mealForm.recipe_lines" :recipe-id="editingMeal?.id ?? undefined" store-type="recipe" />

        <div class="border-1 border-gray-300 rounded-lg my-4">
          <div class="mx-2 my-2">
            <ion-label position="stacked" class="opacity-70">Instructions</ion-label>
            <ion-textarea v-model="mealForm.instructions" :rows="20" class="min-h-[150px]"
              placeholder="Stir for 20 mins"></ion-textarea>
          </div>
        </div>

        <div class="ion-padding">
          <ion-button type="submit" expand="block">
            {{ editingMeal ? 'Update' : 'Create' }} Meal
          </ion-button>
          <ion-button v-if="editingMeal" @click="confirmDelete" color="danger" expand="block" class="mt-4">
            Remove Meal
          </ion-button>
        </div>
      </form>
    </ion-content>
    <ion-alert :is-open="showDeleteConfirm" header="Confirm Delete"
      message="Are you sure you want to remove this meal from your list?" :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { showDeleteConfirm = false }
        },
        {
          text: 'Delete',
          role: 'confirm',
          handler: () => { deleteMeal() }
        }
      ]"></ion-alert>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import type { Recipe } from '@/types/recipe';
import type { Dietary } from '@/types/dietary';
import type { Measurement } from '@/types/measurement';
import { Ingredient } from '@/types/ingredient';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonIcon
} from '@ionic/vue';
import { addIcons } from 'ionicons';
import { camera, add, trash, createOutline, layersOutline, swapVertical, closeCircle, chevronDown, chevronUp, checkmarkDone } from 'ionicons/icons';
import RecipeLine from './RecipeLine.vue';

// Register the icons
addIcons({
  camera,
  add,
  trash,
  createOutline,
  layersOutline,
  swapVertical,
  closeCircle,
  'chevron-down': chevronDown,
  'chevron-up': chevronUp,
  'swap-vertical': swapVertical,
  'checkmark-done': checkmarkDone
});

import { useCategoryStore } from '@/store/useCategoryStore';
import { useCuisineStore } from '@/store/useCuisineStore';
import { useDietaryStore } from '@/store/useDietaryStore';
import { useMeasurementStore } from '@/store/useMeasurementStore';
import api from '@/api/axios';

const props = defineProps<{
  isOpen: boolean;
  editingMeal: Recipe | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

// Initialize stores
const categoryStore = useCategoryStore();
const cuisineStore = useCuisineStore();
const dietaryStore = useDietaryStore();
const measurementStore = useMeasurementStore();
const dietaryError = ref('');

// Add refs for select elements
const categorySelectRef = ref<typeof IonSelect | null>(null);
const cuisineSelectRef = ref<typeof IonSelect | null>(null);
const dietarySelectRef = ref<typeof IonSelect | null>(null);

const showDeleteConfirm = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<string | null>(null);

interface RecipeLine {
  id?: number;
  recipe_id?: number;
  user_meal_id?: number;
  ingredient_id?: number;
  ingredient_name: string;
  quantity: number | null;
  measurement_id?: number;
  measurement_name: string;
  measurement_abbreviation: string;
  recipe_group_id: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  // Relationships
  ingredient?: Ingredient;
  measurement?: Measurement;
}

const mealForm = ref({
  title: '',
  instructions: '',
  cooking_time: '',
  serves: '',
  image: null as File | null,
  active: true,
  recipe_lines: [] as RecipeLine[],
  
  // Relationship IDs for form submission
  category_ids: [] as number[],
  cuisine_ids: [] as number[],
  dietary_ids: [] as number[]
});

// Ensure stores are populated
onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    cuisineStore.fetchCuisine(),
    dietaryStore.fetchDietary(),
    measurementStore.fetchMeasurement()
  ]);
});

watch(
  () => props.editingMeal,
  (meal) => {
    // Reset image preview when switching meals
    imagePreview.value = null;
    
    if (meal) {
      let recipeLines: RecipeLine[] = [];
      
      // Handle recipe lines if they exist
      if (meal.recipe_lines && meal.recipe_lines.length) {
        recipeLines = meal.recipe_lines.map((line: any) => ({
          id: line.id,
          ingredient_id: line.ingredient_id,
          ingredient_name: line.ingredient?.name || line.ingredient_name,
          quantity: line.quantity,
          measurement_id: line.measurement_id,
          measurement_name: line.measurement?.name || line.measurement_name || '',
          measurement_abbreviation: line.measurement?.abbreviation || '',
          recipe_group_id: line.recipe_group_id,
          sort_order: line.sort_order
        }));
      }

      let dietaryIds: number[] = [];
      
      const mealWithDietary = meal as unknown as { dietary?: Dietary[] };
      
      if (mealWithDietary.dietary && Array.isArray(mealWithDietary.dietary)) {
        dietaryIds = mealWithDietary.dietary.map(item => item.id);
      }
      

      mealForm.value = {
        title: meal.title,
        instructions: meal.instructions || '',
        cooking_time: meal.cooking_time?.toString() || '',
        serves: meal.serves?.toString() || '',
        // Use relationship arrays directly
        category_ids: meal.categories ? meal.categories.map(cat => cat.id) : [],
        cuisine_ids: meal.cuisines ? meal.cuisines.map(cuisine => cuisine.id) : [],
        dietary_ids: dietaryIds,
        image: null,
        active: Boolean(meal.active),
        recipe_lines: recipeLines
      };
      
    } else {
      // Reset form for new meal
      mealForm.value = {
        title: '',
        instructions: '',
        serves: '',
        cooking_time: '',
        category_ids: [],
        cuisine_ids: [],
        dietary_ids: [],
        image: null,
        active: true,
        recipe_lines: []
      };
    }
  },
  { immediate: true }
);

function close() {
  showDeleteConfirm.value = false;
  imagePreview.value = null;
  emit('close');
}

function triggerImageUpload() {
  fileInput.value?.click();
}

function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    mealForm.value.image = file;
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function confirmDelete() {
  if (!props.editingMeal) return;
  showDeleteConfirm.value = true;
}

async function deleteMeal() {
  try {
    if (!props.editingMeal) return;
    await api.delete(`/recipes/${props.editingMeal.id}`);
    emit('saved');
    close();
  } catch (error) {
    console.error("Error deleting meal:", error);
  } finally {
    showDeleteConfirm.value = false;
  }
}

function validateDietarySelection() {
  if (mealForm.value.dietary_ids.length > 3) {
    dietaryError.value = 'You can only select up to 3 dietary requirements';
    // Trim the selection to the first 3 items
    mealForm.value.dietary_ids = mealForm.value.dietary_ids.slice(0, 3);
  } else {
    dietaryError.value = '';
  }
}

// Helper functions for pills
function getCategoryName(id: number): string {
  return categoryStore.categories.find(cat => cat.id === id)?.name || '';
}

function getCuisineName(id: number): string {
  return cuisineStore.cuisine.find(cuisine => cuisine.id === id)?.name || '';
}

function getDietaryName(id: number): string {
  return dietaryStore.dietary.find(dietary => dietary.id === id)?.name || '';
}

function removeCategory(id: number) {
  mealForm.value.category_ids = mealForm.value.category_ids.filter(catId => catId !== id);
}

function removeCuisine(id: number) {
  mealForm.value.cuisine_ids = mealForm.value.cuisine_ids.filter(cuisineId => cuisineId !== id);
}

function removeDietary(id: number) {
  mealForm.value.dietary_ids = mealForm.value.dietary_ids.filter(dietaryId => dietaryId !== id);
  validateDietarySelection();
}

async function openCategorySelect() {
  await nextTick();
  const selectEl = categorySelectRef.value?.$el;
  if (selectEl && selectEl.open) {
    selectEl.open();
  }
}

async function openCuisineSelect() {
  await nextTick();
  const selectEl = cuisineSelectRef.value?.$el;
  if (selectEl && selectEl.open) {
    selectEl.open();
  }
}

async function openDietarySelect() {
  await nextTick();
  const selectEl = dietarySelectRef.value?.$el;
  if (selectEl && selectEl.open) {
    selectEl.open();
  }
}

function onCategoryChange() {
  // Handle category selection change if needed
}

function onCuisineChange() {
  // Handle cuisine selection change if needed
}

function onDietaryChange() {
  validateDietarySelection();
}

async function saveMeal() {
  if (mealForm.value.dietary_ids.length > 3) {
    dietaryError.value = 'You can only select up to 3 dietary requirements.'
    mealForm.value.dietary_ids = mealForm.value.dietary_ids.slice(0, 3);
  } else {
    dietaryError.value = '';
  }
  try {
    const formData = new FormData();
    formData.append('title', mealForm.value.title);
    formData.append('instructions', mealForm.value.instructions);

    if (mealForm.value.cooking_time) {
      formData.append('cooking_time', mealForm.value.cooking_time.toString());
    }

    if (mealForm.value.serves) {
      formData.append('serves', mealForm.value.serves.toString());
    }

    if (mealForm.value.category_ids && mealForm.value.category_ids.length > 0) {
      mealForm.value.category_ids.forEach(id => {
        formData.append('categories[]', id.toString());
      });
    }

    if (mealForm.value.cuisine_ids && mealForm.value.cuisine_ids.length > 0) {
      mealForm.value.cuisine_ids.forEach(id => {
        formData.append('cuisines[]', id.toString());
      });
    }

    if (mealForm.value.dietary_ids && mealForm.value.dietary_ids.length > 0) {
      mealForm.value.dietary_ids.forEach(id => {
        formData.append('dietary[]', id.toString());
      });
    }

    // Handle recipe lines
    if (mealForm.value.recipe_lines && mealForm.value.recipe_lines.length > 0) {
      mealForm.value.recipe_lines.forEach((line, index) => {
        // Skip empty lines
        if (!line.ingredient_name) return;

        formData.append(`recipe_lines[${index}][ingredient_name]`, line.ingredient_name);

        if (line.quantity !== null) {
          formData.append(`recipe_lines[${index}][quantity]`, line.quantity.toString());
        }

        if (line.measurement_id) {
          formData.append(`recipe_lines[${index}][measurement_id]`, line.measurement_id.toString());
        }

        formData.append(`recipe_lines[${index}][measurement_name]`, line.measurement_name || '');

        if (line.recipe_group_id) {
          formData.append(`recipe_lines[${index}][recipe_group_id]`, line.recipe_group_id.toString());
        }
        formData.append(`recipe_lines[${index}][sort_order]`, line.sort_order.toString());

        // Include IDs if available for updating
        if (line.id) {
          formData.append(`recipe_lines[${index}][id]`, line.id.toString());
        }
      });
    }
    if (mealForm.value.image) {
      formData.append('image', mealForm.value.image);
    }

    formData.append('active', mealForm.value.active ? '1' : '0');

    // Log formdata entries for debugging
    let response;
    if (props.editingMeal) {
      response = await api.post(`/recipes/${props.editingMeal.id}`, formData);
    } else {
      response = await api.post('/recipes', formData);
    }

    emit('saved');
    close();
  } catch (error) {
    console.error("Error saving meal:", error);
  }
}
</script>
