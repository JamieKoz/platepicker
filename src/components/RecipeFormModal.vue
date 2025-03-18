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
      <form @submit.prevent="saveMeal">
        <ion-item>
          <ion-label position="stacked">Title</ion-label>
          <ion-input v-model="mealForm.title" required placeholder="Pasta Bolognese"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Ingredients</ion-label>
          <ion-textarea v-model="mealForm.ingredients" class="min-h-[150px]" placeholder="- 2 eggs,
- 500g Salt"></ion-textarea>
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
          <ion-label position="stacked">Cooking Time</ion-label>
          <ion-input type="number" step="5" v-model="mealForm.cooking_time" placeholder="time in minutes eg. 30"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Serves</ion-label>
          <ion-input type="number" v-model="mealForm.serves" placeholder="no. of servings e.g. 4"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Category</ion-label>
          <ion-select v-model="mealForm.categories" :multiple="true" placeholder="Select category of meal">
            <ion-select-option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Cuisine</ion-label>
          <ion-select v-model="mealForm.cuisines" :multiple="true" placeholder="Select cuisine">
            <ion-select-option v-for="cuisine in cuisines" :key="cuisine.id" :value="cuisine.id">
              {{ cuisine.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Dietary Requirements</ion-label>
          <ion-select v-model="mealForm.dietary" :multiple="true" placeholder="Select dietary requirements">
            <ion-select-option v-for="dietary in dietaryRequirements" :key="dietary.id" :value="dietary.id">
              {{ dietary.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

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
import type { Recipe } from '@/types/recipe';
import type { Category } from '@/types/category';
import type { Cuisine } from '@/types/cuisine';
import type { Dietary } from '@/types/dietary';
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
import api from '@/api/axios';

const props = defineProps<{
  isOpen: boolean;
  editingMeal: Recipe | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const showDeleteConfirm = ref(false);
const categories = ref<Category[]>([]);
const cuisines = ref<Cuisine[]>([]);
const dietaryRequirements = ref<Dietary[]>([]);

const mealForm = ref({
  title: '',
  ingredients: '',
  instructions: '',
  cooking_time: '',
  cuisines: [] as number[],
  categories: [] as number[],
  serves: '',
  dietary: [] as number[],
  image: null as File | null,
  active: true
});

// Fetch reference data (categories, cuisines, dietary requirements)
onMounted(async () => {
  try {
    // You'll need to create these endpoints in your API
    const [categoriesRes, cuisinesRes, dietaryRes] = await Promise.all([
      api.get('/categories'),
      api.get('/cuisines'),
      api.get('/dietary')
    ]);
    
    categories.value = categoriesRes.data;
    cuisines.value = cuisinesRes.data;
    dietaryRequirements.value = dietaryRes.data;
  } catch (error) {
    console.error("Error fetching reference data:", error);
  }
});

// Helper function to convert category strings to IDs
const getCategoryIds = (categoryNames: string[]): number[] => {
  if (!categoryNames || !categoryNames.length) return [];
  return categories.value
    .filter(category => categoryNames.includes(category.name))
    .map(category => category.id);
};

// Helper function to convert cuisine string to IDs
const getCuisineIds = (cuisineName: string): number[] => {
  if (!cuisineName) return [];
  const cuisine = cuisines.value.find(c => c.name === cuisineName);
  return cuisine ? [cuisine.id] : [];
};

// Helper function to convert dietary strings to IDs
const getDietaryIds = (dietaryNames: string[]): number[] => {
  if (!dietaryNames || !dietaryNames.length) return [];
  return dietaryRequirements.value
    .filter(dietary => dietaryNames.includes(dietary.name))
    .map(dietary => dietary.id);
};

watch(
  () => props.editingMeal,
  (meal) => {
    if (meal) {
      console.log('Meal data received:', meal);
      
      // For existing recipes, handle both the new format (with relationships) and old format
      let categoryIds: number[] = [];
      let cuisineIds: number[] = [];
      let dietaryIds: number[] = [];
      
      if (meal.categories && meal.categories.length) {
        // New format with relationships
        categoryIds = meal.categories.map(cat => cat.id);
      } else if (meal.category) {
        // Old format with string
        const categoryNames = typeof meal.category === 'string' 
          ? meal.category.split(',').map(cat => cat.trim()) 
          : meal.category;
        categoryIds = getCategoryIds(categoryNames);
      }
      
      if (meal.cuisines && meal.cuisines.length) {
        // New format with relationships
        cuisineIds = meal.cuisines.map(cuisine => cuisine.id);
      } else if (meal.cuisine) {
        // Old format with string
        cuisineIds = getCuisineIds(meal.cuisine);
      }
      
      // The issue: dietary is coming as an array of objects, not dietary_items
      if (meal.dietary_items && meal.dietary_items.length) {
        dietaryIds = meal.dietary_items.map(dietary => dietary.id);
      } else if (meal.dietary && Array.isArray(meal.dietary)) {
        // Check if dietary is an array of objects with id property
        if (meal.dietary.length > 0 && typeof meal.dietary[0] === 'object' && 'id' in meal.dietary[0]) {
          console.log('Found dietary as array of objects:', meal.dietary);
          dietaryIds = meal.dietary.map((dietary: any) => dietary.id);
        } else {
          // It's an array of strings
          console.log('Found dietary as array of strings:', meal.dietary);
          dietaryIds = getDietaryIds(meal.dietary as string[]);
        }
      } else if (meal.dietary && typeof meal.dietary === 'string') {
        // It's a string that needs splitting
        console.log('Found dietary as string:', meal.dietary);
        const dietaryNames = meal.dietary.split(',').map(d => d.trim());
        dietaryIds = getDietaryIds(dietaryNames);
      }
      
      console.log('Final dietary IDs:', dietaryIds);
      
      mealForm.value = {
        title: meal.title,
        ingredients: meal.ingredients || '',
        instructions: meal.instructions || '',
        cooking_time: meal.cooking_time || '',
        serves: meal.serves || '',
        categories: categoryIds,
        cuisines: cuisineIds,
        dietary: dietaryIds,
        image: null,
        active: meal.active
      };
    } else {
      // Reset form for new recipes
      mealForm.value = {
        title: '',
        ingredients: '',
        instructions: '',
        serves: '',
        cooking_time: '',
        categories: [],
        cuisines: [],
        dietary: [],
        image: null,
        active: true
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
    await api.delete(`/recipes/${props.editingMeal.id}`);
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
    formData.append('ingredients', mealForm.value.ingredients);
    formData.append('instructions', mealForm.value.instructions);
    formData.append('cooking_time', mealForm.value.cooking_time);
    formData.append('serves', mealForm.value.serves);
    
    // Send arrays of IDs for relationships
    mealForm.value.categories.forEach(categoryId => {
      formData.append('categories[]', categoryId.toString());
    });
    
    mealForm.value.cuisines.forEach(cuisineId => {
      formData.append('cuisines[]', cuisineId.toString());
    });
    
    mealForm.value.dietary.forEach(dietaryId => {
      formData.append('dietary[]', dietaryId.toString());
    });
    
    if (mealForm.value.image) {
      formData.append('image', mealForm.value.image);
    }
    
    formData.append('active', mealForm.value.active ? '1' : '0');
    
    if (props.editingMeal) {
      await api.post(`/recipes/${props.editingMeal.id}`, formData);
    } else {
      await api.post('/recipes', formData);
    }
    
    emit('saved');
    close();
  } catch (error) {
    console.error("Error saving meal:", error);
  }
}
</script>
