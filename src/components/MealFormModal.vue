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
          <ion-input v-model="mealForm.title" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Ingredients</ion-label>
          <ion-textarea v-model="mealForm.ingredients"></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Instructions</ion-label>
          <ion-textarea v-model="mealForm.instructions"></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Image</ion-label>
          <input type="file" @change="handleImageChange" accept="image/*">
        </ion-item>

        <ion-item>
          <ion-label>Active</ion-label>
          <ion-toggle v-model="mealForm.active"></ion-toggle>
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

    <ion-alert 
      :is-open="showDeleteConfirm" 
      header="Confirm Delete" 
      message="Are you sure you want to remove this meal from your list?"
      :buttons="[
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
      ]"
    ></ion-alert>
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
  IonAlert
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
  image: null as File | null,
  active: true
});

// Watch for changes in editingMeal to update form
watch(
  () => props.editingMeal,
  (meal) => {
    if (meal) {
      mealForm.value = {
        title: meal.title,
        ingredients: meal.ingredients || '',
        instructions: meal.instructions || '',
        image: null,
        active: meal.active
      };
    } else {
      mealForm.value = {
        title: '',
        ingredients: '',
        instructions: '',
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
}
</script>
