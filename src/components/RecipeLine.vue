<!-- RecipeLineComponent.vue -->
<template>
  <div class="mt-5">
    <!-- Clickable empty state -->
    <div v-if="recipeLines.length === 0" 
      class="text-center py-6 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      @click="addIngredientLine">
      <p>Click here to add ingredients.</p>
    </div>

    <div v-else class="space-y-2">
      <div v-for="(line, index) in recipeLines" :key="index" class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <!-- Ingredient search field (takes most space) -->
        <div class="flex-grow w-4/12 relative ingredient-search-container">
          <ion-item class="w-full ingredient-input" lines="none" color="none">
            <ion-input :value="line.ingredient_name" placeholder="Ingredient"
              @input="updateIngredientName(index, $event)" @focus="activateSearchLine(index)"
              @blur="handleBlur"></ion-input>
          </ion-item>
        </div>
        
        <!-- Quantity field (smaller) -->
        <div class="w-3/12">
          <ion-item class="w-full quantity-input" lines="none" color="none">
            <ion-input 
              :value="line.quantity !== null ? line.quantity : ''" 
              @input="updateQuantity(index, $event)" 
              type="number" 
              placeholder="Qty"></ion-input>
          </ion-item>
        </div>
        
        <!-- Measurement dropdown (medium size) -->
        <div class="w-3/12">
          <ion-item class="w-full measurement-input" lines="none" color="none">
            <ion-select :value="line.measurement_id" placeholder="Unit" @ionChange="updateMeasurement(index, $event)">
              <ion-select-option v-for="measurement in measurementStore.measurement" :key="measurement.id" :value="measurement.id">
                {{ measurement.name }} {{ measurement.abbreviation ? `(${measurement.abbreviation})` : '' }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </div>
        
        <!-- Action buttons container -->
        <div class="w-2/12 flex items-center justify-center">
          <!-- Delete button -->
          <ion-button fill="clear" @click="removeIngredientLine(index)" size="small" color="danger" class="">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
          
          <!-- Order buttons stacked -->
          <div class="flex flex-col">
            <ion-button fill="clear" size="small" @click="moveIngredientLine(index, -1)" :disabled="index === 0" class="p-0 h-6">
              <ion-icon :icon="chevronUpOutline" size="small"></ion-icon>
            </ion-button>
            <ion-button fill="clear" size="small" @click="moveIngredientLine(index, 1)" :disabled="index === recipeLines.length - 1" class="p-0 h-6">
              <ion-icon :icon="chevronDownOutline" size="small"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed position suggestions dropdown - attached to the body -->
    <div 
      v-if="activeSearchIndex !== null && showSuggestions && searchResults.length > 0" 
      class="fixed z-50 border border-gray-300 bg-gray-900 rounded-b-lg shadow-lg max-h-48 overflow-y-auto w-80"
      :style="{ top: `${dropdownTop}px`, left: `20px` }"
    >
      <div 
        v-for="ingredient in searchResults" 
        :key="ingredient.id" 
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-white"
        @mousedown="selectIngredient(activeSearchIndex, ingredient)"
      >
        {{ ingredient.name }}
      </div>
    </div>

    <div class="mt-4" v-if="recipeLines.length > 0">
      <ion-button size="small" @click="addIngredientLine" class="flex items-center bg-gray-600 hover:bg-gray-700">
        <ion-icon :icon="addOutline" class="mr-1"></ion-icon>
        Add Another Ingredient
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, watch, nextTick, onMounted } from 'vue';
import { IonButton, IonIcon, IonItem, IonInput, IonSelect, IonSelectOption } from '@ionic/vue';
import { addOutline, trashOutline, chevronUpOutline, chevronDownOutline } from 'ionicons/icons';
import type { Ingredient } from '@/types/ingredient';
import type { Measurement } from '@/types/measurement';
import type { RecipeLine } from '@/types/recipeline';
import { useMeasurementStore } from '@/store/useMeasurementStore';
import api from '@/api/axios';

const props = defineProps<{
  modelValue: RecipeLine[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: RecipeLine[]): void;
}>();

// Initialize the measurement store
const measurementStore = useMeasurementStore();

// Ensure measurements are loaded
onMounted(async () => {
  if (measurementStore.measurement.length === 0) {
    await measurementStore.fetchMeasurement();
  }
});

// Internal state
const recipeLines = ref<RecipeLine[]>([]);
const searchResults = ref<Ingredient[]>([]);
const showSuggestions = ref(false);
const activeSearchIndex = ref<number | null>(null);
const searchTimeout = ref<number | null>(null);
const isSearching = ref(false);
const debugMode = ref(false);

// Dropdown positioning
const dropdownTop = ref(0);
const dropdownLeft = ref(0);
const dropdownWidth = ref(0);

// Creates a default recipe line with all required fields
const createDefaultRecipeLine = (sortOrder: number): RecipeLine => {
  return {
    ingredient_name: '',
    quantity: null,
    measurement_name: '',
    measurement_id: undefined,
    sort_order: sortOrder,
    notes: ''
  };
};

// Add a new ingredient line
const addIngredientLine = () => {
  const newLine = createDefaultRecipeLine(recipeLines.value.length);
  const newLines = [...recipeLines.value, newLine];
  recipeLines.value = newLines;
  emitUpdate();
};

// Initialize based on props
onMounted(() => {
  if (props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    // Copy prop data with required fields
    recipeLines.value = props.modelValue.map((line, index) => ({
      ...createDefaultRecipeLine(index),
      ...line
    }));
  } else {
    // Create default line if empty
    recipeLines.value = [createDefaultRecipeLine(0)];
  }
});

// Helper function to emit updates safely
const emitUpdate = () => {
  const copiedLines = JSON.parse(JSON.stringify(recipeLines.value));
  emit('update:modelValue', copiedLines);
};

// Update ingredient name
const updateIngredientName = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value || '';
  
  if (index >= 0 && index < recipeLines.value.length) {
    const updatedLines = [...recipeLines.value];
    updatedLines[index] = {
      ...updatedLines[index],
      ingredient_name: value
    };
    recipeLines.value = updatedLines;
    
    // Debounce search
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
    }
    
    activeSearchIndex.value = index;
    positionDropdown(index);
    
    searchTimeout.value = setTimeout(() => {
      searchIngredients(value);
    }, 300) as unknown as number;
  }
};

// Update quantity
const updateQuantity = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value ? Number(input.value) : null;
  
  if (index >= 0 && index < recipeLines.value.length) {
    const updatedLines = [...recipeLines.value];
    updatedLines[index] = {
      ...updatedLines[index],
      quantity: value
    };
    recipeLines.value = updatedLines;
    emitUpdate();
  }
};

// Update measurement
const updateMeasurement = (index: number, event: CustomEvent) => {
  const measurementId = event.detail.value;
  
  if (index >= 0 && index < recipeLines.value.length) {
    const measurement = measurementStore.measurement.find(m => m.id === measurementId);
    const measurementName = measurement ? measurement.name : '';
    
    const updatedLines = [...recipeLines.value];
    updatedLines[index] = {
      ...updatedLines[index],
      measurement_id: measurementId,
      measurement_name: measurementName
    };
    recipeLines.value = updatedLines;
    emitUpdate();
  }
};

// Set the active search line and position the dropdown
const activateSearchLine = async (index: number) => {
  activeSearchIndex.value = index;
  
  await nextTick();
  positionDropdown(index);
  
  if (recipeLines.value[index]?.ingredient_name) {
    searchIngredients(recipeLines.value[index].ingredient_name);
  }
};

// Position the dropdown under the current input field
const positionDropdown = (index: number) => {
  if (index < 0 || index >= recipeLines.value.length) {
    return;
  }

  let inputElement = null;
  const allInputs = document.querySelectorAll('.ingredient-input ion-input');
  
  if (allInputs.length > index) {
    inputElement = allInputs[index];
  }
  
  if (inputElement) {
    const inputRect = inputElement.getBoundingClientRect();
    dropdownTop.value = inputRect.bottom + window.scrollY;
    dropdownLeft.value = inputRect.left + window.scrollX;
    dropdownWidth.value = inputRect.width;
  }
};

// Handle input blur
const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
    activeSearchIndex.value = null;
  }, 200);
};

// Search ingredients
const searchIngredients = async (query: string) => {
  if (!query || query.length < 2) {
    searchResults.value = [];
    showSuggestions.value = false;
    return;
  }
  
  try {
    isSearching.value = true;
    const response = await api.get('/ingredients/search', {
      params: {
        q: query
      }
    });
    
    // If response has a data property with search results
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      searchResults.value = [];
    }

    searchResults.value = response.data.data;
    showSuggestions.value = searchResults.value.length > 0;
    
  } catch (error) {
    console.error("Error searching ingredients:", error);
    searchResults.value = [];
    showSuggestions.value = false;
  } finally {
    isSearching.value = false;
  }
};

// Select an ingredient from search results
const selectIngredient = (index: number | null, ingredient: Ingredient) => {
  if (index === null || index < 0 || index >= recipeLines.value.length) {
    return;
  }

  const updatedLines = [...recipeLines.value];
  updatedLines[index] = {
    ...updatedLines[index],
    ingredient_name: ingredient.name,
    ingredient_id: ingredient.id
  };
  
  recipeLines.value = updatedLines;
  showSuggestions.value = false;
  emitUpdate();
};

// Remove an ingredient line
const removeIngredientLine = (index: number) => {
  if (index < 0 || index >= recipeLines.value.length) return;
  
  const updatedLines = [...recipeLines.value];
  updatedLines.splice(index, 1);
  
  // Update sort order
  updatedLines.forEach((line, idx) => {
    line.sort_order = idx;
  });
  
  // Ensure there's always at least one line
  if (updatedLines.length === 0) {
    updatedLines.push(createDefaultRecipeLine(0));
  }
  
  recipeLines.value = updatedLines;
  emitUpdate();
};

// Move an ingredient line up or down
const moveIngredientLine = (index: number, direction: number) => {
  const newIndex = index + direction;
  
  if (newIndex < 0 || newIndex >= recipeLines.value.length) {
    return;
  }
  
  const updatedLines = [...recipeLines.value];
  const temp = updatedLines[index];
  updatedLines[index] = updatedLines[newIndex];
  updatedLines[newIndex] = temp;
  
  // Update sort order
  updatedLines.forEach((line, idx) => {
    line.sort_order = idx;
  });
  
  recipeLines.value = updatedLines;
  emitUpdate();
};

// Watch for external prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== recipeLines.value) {
      if (newValue && Array.isArray(newValue) && newValue.length > 0) {
        // Copy prop data with required fields
        recipeLines.value = newValue.map((line, index) => ({
          ...createDefaultRecipeLine(index),
          ...line
        }));
      } else if (recipeLines.value.length === 0) {
        // Create default line if empty
        recipeLines.value = [createDefaultRecipeLine(0)];
      }
    }
  },
  { deep: true }
);
</script>

<style scoped></style>
