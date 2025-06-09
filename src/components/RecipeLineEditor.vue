<!-- RecipeLineEditor.vue -->
<template>
  <div :class="containerClass">
    <!-- Main ingredient input row -->
    <div class="flex items-center gap-2 mb-3">
      <!-- Ingredient search field -->
      <div class="flex-grow relative">
        <ion-input v-model="line.ingredient_name" placeholder="Ingredient name" class="ingredient-input"
          @ionInput="handleIngredientInput" @ionFocus="activateSearch" @ionBlur="handleBlur"></ion-input>

        <!-- Ingredient suggestions dropdown -->
        <div v-if="showSuggestions && searchResults.length"
          class="absolute z-50 mt-1 w-full border bg-gray-900 dark:bg-gray-900 border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          <div v-for="ingredient in searchResults" :key="ingredient.id"
            class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            @mousedown="selectIngredient(ingredient)">
            {{ ingredient.name }}
          </div>
        </div>
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

    <!-- Quantity, Unit & Group row -->
    <div class="grid grid-cols-12 gap-3 items-end">
      <!-- Quantity -->
      <div class="col-span-3">
        <ion-label class="text-xs text-gray-500 block mb-1">Quantity</ion-label>
        <ion-input :value="line.quantity !== null ? line.quantity : ''" @ionInput="handleQuantityInput" type="number"
          step="any" placeholder="Qty"></ion-input>
      </div>

      <!-- Unit -->
      <div class="col-span-4">
        <ion-label class="text-xs text-gray-500 block mb-1">Unit</ion-label>
        <ion-select v-model="line.measurement_id" placeholder="Select unit" @ionChange="updateMeasurementName">
          <ion-select-option v-for="m in measurementStore.measurement" :key="m.id" :value="m.id">
            {{ m.name }}
          </ion-select-option>
        </ion-select>
      </div>

      <!-- Group -->
      <div class="col-span-5">
        <ion-label class="text-xs text-gray-500 block mb-1">Group (optional)</ion-label>
        <ion-select v-model="groupId" placeholder="Select group" interface="popover">
          <ion-select-option :value="null">Main Ingredients</ion-select-option>
          <ion-select-option v-for="group in availableGroups" :key="group.id" :value="group.id">
            {{ group.name }}
          </ion-select-option>
        </ion-select>
        <div v-if="!entityId" class="text-xs text-gray-500 mt-1">
          Save first to create custom groups
        </div>
      </div>
      <div class="col-span-12 mt-2">
        <ion-label class="text-xs text-gray-500 block mb-1">Notes (optional)</ion-label>
        <ion-input v-model="line.notes" placeholder="e.g., optional, to taste, etc." class="text-sm"></ion-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue';
import { 
  IonInput, 
  IonButton, 
  IonIcon, 
  IonSelect, 
  IonSelectOption, 
  IonLabel 
} from '@ionic/vue';

import { addIcons } from 'ionicons';
import { add, createOutline, trash, layersOutline, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { useMeasurementStore } from '@/store/useMeasurementStore';
import api from '@/api/axios';
import type { Ingredient } from '@/types/ingredient';
import type { RecipeLine } from '@/types/recipeline';
import type { RecipeGroup } from '@/types/recipeGroup';

const props = defineProps<{
  modelValue: RecipeLine;
  recipeId?: number;
  userMealId?: number;
  storeType?: 'recipe' | 'userMeal';
  availableGroups: RecipeGroup[];
  containerClass?: string;
}>();

addIcons({
  add,
  'create-outline': createOutline,
  trash,
  'layers-outline': layersOutline,
  'checkmark-circle': checkmarkCircle,
  'close-circle': closeCircle
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const measurementStore = useMeasurementStore();

const line = ref<RecipeLine>({ ...props.modelValue });
const searchResults = ref<Ingredient[]>([]);
const showSuggestions = ref(false);
let searchTimeout: number | null = null;

// Determine which entity ID we're working with
const entityId = computed(() => {
  const id = props.recipeId || props.userMealId;
  return id;
});

// Computed property for the group ID that handles both recipe and user meal contexts
const groupId = computed({
  get: () => {
    const storeType = props.storeType || (props.recipeId ? 'recipe' : 'userMeal');
    return storeType === 'recipe' 
      ? line.value.recipe_group_id 
      : line.value.user_meal_group_id;
  },
  set: (value: number | undefined) => {
    const storeType = props.storeType || (props.recipeId ? 'recipe' : 'userMeal');
    if (storeType === 'recipe') {
      line.value.recipe_group_id = value;
      // Clear the other field to avoid conflicts
      delete line.value.user_meal_group_id;
    } else {
      line.value.user_meal_group_id = value;
      // Clear the other field to avoid conflicts
      delete line.value.recipe_group_id;
    }
  }
});

// Watch for changes in the line and emit updates
watch(line, (newValue) => {
  emit('update:modelValue', { ...newValue });
}, { deep: true });

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
    line.value.measurement_abbreviation = m.abbreviation || '';
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
  emit('save');
};

const onCancel = () => {
  emit('cancel');
};
</script>
