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
          <ion-input v-model="mealForm.cooking_time" placeholder="time in minutes eg. 30"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Serves</ion-label>
          <ion-input v-model="mealForm.serves" placeholder="no. of servings e.g. 4"></ion-input>
        </ion-item>


        <ion-item>
          <ion-label position="stacked">Category</ion-label>
          <ion-select v-model="mealForm.category" :multiple="true" placeholder="Select category of meal">
            <ion-select-option value="breakfast">Breakfast</ion-select-option>
            <ion-select-option value="lunch">Lunch</ion-select-option>
            <ion-select-option value="dinner">Dinner</ion-select-option>
            <ion-select-option value="dessert">Dessert</ion-select-option>
            <ion-select-option value="snack">Snack</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Cuisine</ion-label>
          <ion-select v-model="mealForm.cuisine" placeholder="Select cuisine">
            <ion-select-option value="american">American</ion-select-option>
            <ion-select-option value="brazilian">Brazilian</ion-select-option>
            <ion-select-option value="caribbean">Caribbean</ion-select-option>
            <ion-select-option value="chinese">Chinese</ion-select-option>
            <ion-select-option value="french">French</ion-select-option>
            <ion-select-option value="indian">Indian</ion-select-option>
            <ion-select-option value="italian">Italian</ion-select-option>
            <ion-select-option value="japanese">Japanese</ion-select-option>
            <ion-select-option value="korean">Korean</ion-select-option>
            <ion-select-option value="mediterranean">Mediterranean</ion-select-option>
            <ion-select-option value="mexican">Mexican</ion-select-option>
            <ion-select-option value="spanish">Spanish</ion-select-option>
            <ion-select-option value="thai">Thai</ion-select-option>
            <ion-select-option value="turkish">Turkish</ion-select-option>
            <ion-select-option value="vietnamese">Vietnamese</ion-select-option>
            <ion-select-option value="Snack"></ion-select-option>
          </ion-select>
        </ion-item>


        <ion-item>
          <ion-label position="stacked">Dietary Requirements</ion-label>
          <ion-select v-model="mealForm.dietary" :multiple="true" placeholder="Select dietary requirements">
            <ion-select-option value="gluten-free">Gluten Free</ion-select-option>
            <ion-select-option value="dairy-free">Dairy Free</ion-select-option>
            <ion-select-option value="egg-free">Egg Free</ion-select-option>
            <ion-select-option value="nut-free">Nut Free</ion-select-option>
            <ion-select-option value="vegetarian">Vegetarian</ion-select-option>
            <ion-select-option value="vegan">Vegan</ion-select-option>
            <ion-select-option value="pescatarian">Pescatarian</ion-select-option>
            <ion-select-option value="keto">Keto</ion-select-option>
            <ion-select-option value="paleo">Paleo</ion-select-option>
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
import { ref, watch } from 'vue';
import type { Meal } from '@/types/meal';
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
  editingMeal: Meal | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const showDeleteConfirm = ref(false);
const mealForm = ref({
  title: '',
  ingredients: '',
  instructions: '',
  serves: '',
  cooking_time: '',
  cuisine: '',
  category: [] as string[],
  dietary: [] as string[],
  image: null as File | null,
  active: true
});

watch(
  () => props.editingMeal,
  (meal) => {
    if (meal) {
      mealForm.value = {
        title: meal.title,
        ingredients: meal.ingredients || '',
        instructions: meal.instructions || '',
        cooking_time: meal.cooking_time || '',
        serves: meal.serves || '',
        category: typeof meal.category === 'string' ? meal.category.split(',') : (meal.category || []),
        cuisine: meal.cuisine || '',
        dietary: typeof meal.dietary === 'string' ? meal.dietary.split(',') : (meal.dietary || []),
        image: null,
        active: meal.active
      };
    } else {
      mealForm.value = {
        title: '',
        ingredients: '',
        instructions: '',
        cooking_time: '',
        serves: '',
        category: [],
        cuisine: '',
        dietary: [],
        image: null,
        active: true
      };
    }
  }
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
    formData.append('ingredients', mealForm.value.ingredients);
    formData.append('instructions', mealForm.value.instructions);
    formData.append('cooking_time', mealForm.value.cooking_time);
    formData.append('serves', mealForm.value.serves);
    formData.append('category', mealForm.value.category.join(','));
    formData.append('cuisine', mealForm.value.cuisine);
    formData.append('dietary', mealForm.value.dietary.join(','));
    if (mealForm.value.image) {
      formData.append('image', mealForm.value.image);
    }
    formData.append('active', mealForm.value.active ? '1' : '0');
    if (props.editingMeal) {
      await api.post(`/user-meals/${props.editingMeal.id}`, formData);
    } else {
      await api.post('/user-meals', formData);
    }

    emit('saved');
    close();
  } catch (error) {
    console.error("Error saving meal:", error);
  }
}</script>
