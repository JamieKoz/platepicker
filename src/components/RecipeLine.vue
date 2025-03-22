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
            <ion-input v-model="line.ingredient_name" placeholder="Ingredient"
              @input="() => debounceSearch(line, index)" @focus="activateSearchLine(index)"
              @blur="handleBlur"></ion-input>
          </ion-item>
        </div>
        
        <!-- Quantity field (smaller) -->
        <div class="w-3/12">
          <ion-item class="w-full quantity-input" lines="none" color="none">
            <ion-input v-model="line.quantity" type="number" placeholder="Qty"></ion-input>
          </ion-item>
        </div>
        
        <!-- Measurement dropdown (medium size) -->
        <div class="w-3/12">
          <ion-item class="w-full measurement-input" lines="none" color="none">
            <ion-select v-model="line.measurement_id" placeholder="Unit" @ionChange="updateMeasurementName(line)">
              <ion-select-option v-for="measurement in measurements" :key="measurement.id" :value="measurement.id">
                {{ measurement.name }} {{ measurement.abbreviation && measurement.abbreviation.length > 0 ? "(" + measurement.abbreviation + ")" : ""}}
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
        @mousedown="selectIngredient(recipeLines[activeSearchIndex], ingredient)"
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
import { ref, defineEmits, defineProps, watch, nextTick } from 'vue';
import { IonButton, IonIcon, IonItem, IonInput, IonSelect, IonSelectOption } from '@ionic/vue';
import { addOutline, trashOutline, chevronUpOutline, chevronDownOutline } from 'ionicons/icons';
import api from '@/api/axios';
import type { Ingredient } from '@/types/ingredient';
import type { Measurement } from '@/types/measurement';
import type { RecipeLine } from '@/types/recipeline';

const props = defineProps<{
  modelValue: RecipeLine[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: RecipeLine[]): void;
}>();

const recipeLines = ref<RecipeLine[]>([]);
const measurements = ref<Measurement[]>([]);
const searchResults = ref<Ingredient[]>([]);
const showSuggestions = ref(false);
const activeSearchIndex = ref<number | null>(null);
const searchTimeout = ref<number | null>(null);
const isSearching = ref(false);
const debugMode = ref(false); // Set to true to see debug info

// Dropdown positioning
const dropdownTop = ref(0);
const dropdownLeft = ref(0);
const dropdownWidth = ref(0);

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      recipeLines.value = [...newValue];
    }
  },
  { immediate: true }
);

// Watch for internal changes
watch(
  recipeLines,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true }
);

// Fetch measurements
const fetchMeasurements = async () => {
  try {
    const response = await api.get('/measurements');
    measurements.value = response.data;
  } catch (error) {
    console.error("Error fetching measurements:", error);
  }
};

fetchMeasurements();

// Set the active search line and position the dropdown
const activateSearchLine = async (index: number) => {
  activeSearchIndex.value = index;
  
  // Position the dropdown properly
  await nextTick();
  positionDropdown(index);
  
  if (recipeLines.value[index].ingredient_name) {
    // Search with current value when focusing
    searchIngredients(recipeLines.value[index].ingredient_name);
  }
};

// Position the dropdown under the current input field
const positionDropdown = (index: number) => {
  // Try multiple selectors to find the correct input element
  let inputElement = null;
  const selectors = [
    `.ingredient-search-container:nth-child(${index + 1}) ion-input`,
    `.w-4\\/12:nth-of-type(${index + 1}) ion-input`,
    `.recipe-line:nth-child(${index + 1}) .w-4\\/12 ion-input`,
    `ion-item:nth-of-type(${index * 3 + 1}) ion-input`
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      inputElement = elements[0];
      break;
    }
  }
  
  // Fallback to finding all ingredient inputs and using the index
  if (!inputElement) {
    const allInputs = document.querySelectorAll('.w-4\\/12 ion-input');
    if (allInputs.length > index) {
      inputElement = allInputs[index];
    }
  }
  
  if (inputElement) {
    const inputRect = inputElement.getBoundingClientRect();
    dropdownTop.value = inputRect.bottom + window.scrollY;
    dropdownLeft.value = inputRect.left + window.scrollX;
    dropdownWidth.value = inputRect.width;
    
    if (debugMode.value) {
      console.log('Dropdown position:', {
        top: dropdownTop.value,
        left: dropdownLeft.value,
        width: dropdownWidth.value
      });
    }
  } else {
    console.error('Could not find input element for positioning dropdown');
  }
};

// Handle input blur
const handleBlur = () => {
  // Delay hiding suggestions to allow clicking on them
  setTimeout(() => {
    showSuggestions.value = false;
    activeSearchIndex.value = null;
  }, 200);
};

// Debounce search to prevent too many API calls
const debounceSearch = (line: RecipeLine, index: number) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // Ensure the active index is set
  activeSearchIndex.value = index;
  
  // Position dropdown when searching
  positionDropdown(index);
  
  searchTimeout.value = setTimeout(() => {
    searchIngredients(line.ingredient_name);
  }, 300) as unknown as number;
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
        q: query,
        limit: 10
      }
    });
    
    searchResults.value = response.data;
    showSuggestions.value = searchResults.value.length > 0;
    
    // Debug info
    if (debugMode.value) {
      console.log("Search results:", searchResults.value);
      console.log("Show suggestions:", showSuggestions.value);
    }
    
  } catch (error) {
    console.error("Error searching ingredients:", error);
    searchResults.value = [];
    showSuggestions.value = false;
  } finally {
    isSearching.value = false;
  }
};

// Select an ingredient from search results
const selectIngredient = (line: RecipeLine, ingredient: Ingredient) => {
  if (line) {
    line.ingredient_name = ingredient.name;
    line.ingredient_id = ingredient.id;
    console.log("Selected ingredient:", ingredient);
  }
  showSuggestions.value = false;
};

// Update measurement name when ID changes
const updateMeasurementName = (line: RecipeLine) => {
  if (line.measurement_id) {
    const measurement = measurements.value.find(m => m.id === line.measurement_id);
    if (measurement) {
      line.measurement_name = measurement.name;
    }
  } else {
    line.measurement_name = '';
  }
};

// Add a new ingredient line
const addIngredientLine = () => {
  recipeLines.value.push({
    ingredient_name: '',
    ingredient_id: undefined,
    quantity: null,
    measurement_name: '',
    measurement_id: null,
    sort_order: recipeLines.value.length
  });
};

// Remove an ingredient line
const removeIngredientLine = (index: number) => {
  recipeLines.value.splice(index, 1);
  
  // Update sort order
  recipeLines.value.forEach((line, idx) => {
    line.sort_order = idx;
  });
};

// Move an ingredient line up or down
const moveIngredientLine = (index: number, direction: number) => {
  const newIndex = index + direction;
  
  if (newIndex < 0 || newIndex >= recipeLines.value.length) {
    return;
  }
  
  const temp = recipeLines.value[index];
  recipeLines.value[index] = recipeLines.value[newIndex];
  recipeLines.value[newIndex] = temp;
  
  // Update sort order
  recipeLines.value.forEach((line, idx) => {
    line.sort_order = idx;
  });
};
</script>

<style scoped></style>
