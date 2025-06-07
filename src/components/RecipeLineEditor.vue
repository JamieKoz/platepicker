<template>
  <div :class="containerClass">
    <div class="flex items-center gap-2">
      <!-- Ingredient search field -->
      <div class="flex-grow relative">
        <ion-input v-model="line.ingredient_name" placeholder="Ingredient name" class="ingredient-input"
          @ionInput="handleIngredientInput" @ionFocus="activateSearch" @ionBlur="handleBlur"></ion-input>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-1">
        <ion-button @click="onCancel" size="small" fill="clear">
          <ion-icon name="close-circle" size="large"></ion-icon>
        </ion-button>
        <ion-button @click="onSave" size="small" fill="clear" :disabled="!line.ingredient_name" color="success">
          <ion-icon name="checkmark-circle" size="large"></ion-icon>
        </ion-button>
      </div>
    </div>
    <div v-if="showSuggestions && searchResults.length"
      class="absolute z-50 mt-1 w-full max-w-sm border bg-gray-900 border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto left-4"
      :style="dropdownStyle">
      <div v-for="ingredient in searchResults" :key="ingredient.id"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        @mousedown="selectIngredient(ingredient)">
        {{ ingredient.name }}
      </div>
    </div>

    <!-- Quantity & Unit -->
    <div class="flex items-center">
      <div class="w-24">
        <ion-input :value="line.quantity !== null ? line.quantity : ''" @ionInput="handleQuantityInput" type="number"
          step="any" placeholder="Qty"></ion-input>
      </div>

      <div class="w-32 ml-8">
        <ion-select v-model="line.measurement_id" placeholder="Unit" @ionChange="updateMeasurementName">
          <ion-select-option v-for="m in measurementStore.measurement" :key="m.id" :value="m.id">
            {{ m.name }}
          </ion-select-option>
        </ion-select>
      </div>
    </div>

    <!-- Notes -->
    <div class="mt-2" v-if="showNotes || line.notes">
      <ion-item lines="none">
        <ion-input v-model="line.notes" placeholder="Notes (optional)"></ion-input>
      </ion-item>
    </div>
    <div v-if="!showNotes && !line.notes" class="mt-2">
      <ion-button @click="showNotes = true" fill="clear" size="small">
        <ion-icon name="add" slot="start"></ion-icon> Add Notes
      </ion-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { IonInput, IonItem, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/vue';
import { useMeasurementStore } from '@/store/useMeasurementStore';
import api from '@/api/axios';
import type { Ingredient, RecipeLine } from '@/types';

const props = defineProps<{
  modelValue: RecipeLine;
  containerClass?: string;
}>();
const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const measurementStore = useMeasurementStore();

const line = ref<RecipeLine>({ ...props.modelValue });
const showNotes = ref(!!line.value.notes);
const searchResults = ref<Ingredient[]>([]);
const showSuggestions = ref(false);
const dropdownStyle = ref({});
let searchTimeout: number | null = null;

const handleIngredientInput = (event: CustomEvent) => {
  const value = event.detail.value || '';
  line.value.ingredient_name = value;

  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (value.length >= 2) searchIngredients(value);
    else {
      searchResults.value = [];
      showSuggestions.value = false;
    }
  }, 300);
};

const handleQuantityInput = (event: CustomEvent) => {
  const value = event.detail.value;
  line.value.quantity = value === '' ? null : parseFloat(value);
};

const updateMeasurementName = () => {
  const m = measurementStore.measurement.find(m => m.id === line.value.measurement_id);
  if (m) {
    line.value.measurement_name = m.name;
    line.value.measurement_abbreviation = m.abbreviation;
  }
};

const searchIngredients = async (query: string) => {
  try {
    const { data } = await api.get('/ingredients/search', { params: { q: query } });
    searchResults.value = data?.data ?? [];
    showSuggestions.value = !!searchResults.value.length;
    await nextTick();
  } catch {
    searchResults.value = [];
    showSuggestions.value = false;
  }
};

const selectIngredient = (ingredient: Ingredient) => {
  line.value.ingredient_name = ingredient.name;
  line.value.ingredient_id = ingredient.id;
  showSuggestions.value = false;
};

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const activateSearch = () => {
  if (line.value.ingredient_name?.length >= 2) searchIngredients(line.value.ingredient_name);
};

const onSave = () => {
  emit('update:modelValue', { ...line.value });
  emit('save');
};

const onCancel = () => {
  emit('cancel');
};
</script>
