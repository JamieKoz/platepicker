//MealFormModal.vue
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
      <form @submit.prevent="saveMeal">
        <ion-item>
          <ion-label position="stacked">Title</ion-label>
          <ion-input v-model="mealForm.title" required placeholder="Pasta Bolognese"></ion-input>
        </ion-item>


        <ion-item>
          <ion-label position="stacked">Instructions</ion-label>
          <ion-textarea v-model="mealForm.instructions" class="min-h-[150px]" placeholder="Stir for 20 mins"></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Image</ion-label>
          <input type="file" @change="handleImageChange" accept="image/*" class="py-4">
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Cooking Time (minutes)</ion-label>
          <ion-input type="number" step="5" v-model="mealForm.cooking_time" placeholder="time in minutes eg. 30"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Serves</ion-label>
          <ion-input type="number" v-model="mealForm.serves" placeholder="no. of servings e.g. 4"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Categories</ion-label>
            <ion-select :multiple="true" v-model="mealForm.category_ids">
            <ion-select-option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Cuisine</ion-label>
          <ion-select :multiple="true" v-model="mealForm.cuisine_ids" placeholder="Select cuisine">
            <ion-select-option v-for="cuisine in cuisineStore.cuisine" :key="cuisine.id" :value="cuisine.id">
              {{ cuisine.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Dietary Requirements</ion-label>
          <ion-select :multiple="true" v-model="mealForm.dietary_ids"  placeholder="Select dietary requirements">
            <ion-select-option v-for="dietary in dietaryStore.dietary" :key="dietary.id" :value="dietary.id">
              {{ dietary.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <RecipeLine v-model="mealForm.recipe_lines" />

        <ion-item>
          <ion-label>Active</ion-label>
          <ion-toggle v-model="mealForm.active" class="py-4"></ion-toggle>
        </ion-item>

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
import { ref, watch, onMounted } from 'vue';
import type { Meal } from '@/types/meal';
import type { Measurement } from '@/types/measurement';
import { Ingredient } from '@/types/ingredient';
import RecipeLine from './RecipeLine.vue';

import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle,
  IonAlert,
  IonSelect,
  IonSelectOption
} from '@ionic/vue';

// Import stores
import { useCategoryStore } from '@/store/useCategoryStore';
import { useCuisineStore } from '@/store/useCuisineStore';
import { useDietaryStore } from '@/store/useDietaryStore';
import { useMeasurementStore } from '@/store/useMeasurementStore';
import api from '@/api/axios';
import { Dietary } from '@/types/dietary';

const props = defineProps<{
  isOpen: boolean;
  editingMeal: Meal | null;
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

const showDeleteConfirm = ref(false);

interface RecipeLine {
  id?: number;
  recipe_id?: number;
  user_meal_id?: number;
  ingredient_id?: number;
  ingredient_name: string;
  quantity: number | null;
  measurement_id?: number;
  measurement_name: string;
  notes?: string;
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
    if (meal) {
      let recipeLines: RecipeLine[] = [];
      
      // Handle recipe lines if they exist
      if (meal.recipe_lines && meal.recipe_lines.length) {
        recipeLines = meal.recipe_lines.map(line => ({
          id: line.id,
          ingredient_id: line.ingredient_id,
          ingredient_name: line.ingredient?.name || line.ingredient_name,
          quantity: line.quantity,
          measurement_id: line.measurement_id,
          measurement_name: line.measurement?.name || line.measurement_name || '',
          notes: line.notes || '',
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
  emit('close');
}

function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    mealForm.value.image = input.files[0];
  }
}

function confirmDelete() {
  if (!props.editingMeal) return;
  showDeleteConfirm.value = true;
}

async function deleteMeal() {
  try {
    if (!props.editingMeal) return;
    await api.delete(`/user-meals/${props.editingMeal.id}`);
    emit('saved');
    close();
  } catch (error) {
    console.error("Error deleting meal:", error);
  } finally {
    showDeleteConfirm.value = false;
  }
}

async function saveMeal() {
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
        
        formData.append(`recipe_lines[${index}][measurement_name]`, line.measurement_name || '');
        
        if (line.notes) {
          formData.append(`recipe_lines[${index}][notes]`, line.notes);
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
      response = await api.post(`/user-meals/${props.editingMeal.id}`, formData);
    } else {
      response = await api.post('/user-meals', formData);
    }
    
    emit('saved');
    close();
  } catch (error) {
    console.error("Error saving meal:", error);
  }
}
</script>
