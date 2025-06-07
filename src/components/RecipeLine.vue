<!-- RecipeLineComponent.vue -->
<template>
  <div class="mt-5">
    <div class="flex justify-between">
      <ion-label class="opacity-70 text-sm font-medium block">Ingredients</ion-label>
      <!-- Reorder mode toggle -->
      <div v-if="savedLines.length > 1">
        <ion-button @click="reorderMode = !reorderMode" size="small" fill="clear">
          <ion-icon :name="reorderMode ? 'checkmark-done' : 'swap-vertical'" slot="start"></ion-icon>
          {{ reorderMode ? 'Done Reordering' : 'Reorder' }}
        </ion-button>
      </div>
    </div>
    <!-- Saved ingredients list -->
    <div v-if="savedLines.length > 0" class="space-y-2 mb-4">
      <div v-for="(line, index) in savedLines" :key="index" class="group">
        <!-- Display mode -->
        <div v-if="editingIndex !== index" @click="editLine(index)"
          class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border-1 border-gray-300 hover:border-gray-400">
          <div class="flex-1 flex items-center gap-1">
            <span class="font-medium">
              {{ formatRecipeLine(line) }}
            </span>
            <span v-if="line.notes" class="text-sm italic">({{ line.notes }})</span>
          </div>
          <div class="flex items-center gap-2">
            <ion-icon name="create-outline" class="text-gray-400"></ion-icon>
            <ion-button fill="clear" size="small" color="danger" @click.stop="deleteLine(index)" class="ml-1">
              <ion-icon name="trash" size="small"></ion-icon>
            </ion-button>
          </div>
        </div>

        <!-- Edit mode (inline) -->
        <div v-else class="p-3 rounded-lg border-2 border-blue-200 dark:border-blue-700">
          <RecipeLineEditor v-if="editingIndex !== null" v-model="currentLine" @save="saveLine" @cancel="cancelEdit" />
        </div>
      </div>
    </div>

    <!-- New ingredient form (only shown when adding new) -->
    <div v-if="showNewLine">
      <RecipeLineEditor v-if="showNewLine" v-model="currentLine"
        container-class="mb-4 p-3 rounded-lg border-2 border-green-200 dark:border-green-700" @save="saveLine"
        @cancel="cancelEdit" />
    </div>

    <!-- Add ingredient button -->
    <ion-button v-if="!showNewLine && editingIndex === null" @click="addNewLine" fill="outline" size="small"
      class="w-full">
      <ion-icon name="add" slot="start"></ion-icon> Add {{ savedLines.length > 0 ? 'Another' : '' }} Ingredient
    </ion-button>


    <!-- Reorderable list -->
    <div v-if="reorderMode && savedLines.length > 1" class="mt-2 space-y-2">
      <div v-for="(line, index) in savedLines" :key="index" class="flex items-center gap-2">
        <div class="flex flex-col">
          <ion-button fill="clear" size="small" @click="moveLine(index, -1)" :disabled="index === 0">
            <ion-icon name="chevron-up" size="small"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="small" @click="moveLine(index, 1)" :disabled="index === savedLines.length - 1">
            <ion-icon name="chevron-down" size="small"></ion-icon>
          </ion-button>
        </div>
        <div class="flex-1 p-2 border-1 border-gray-300 rounded-lg">
          <div class="m-2">
            {{ line.quantity || '' }} {{ line.measurement_name }} {{ line.ingredient_name }}
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  IonButton,
  IonIcon,
  IonLabel
} from '@ionic/vue';
import { addIcons } from 'ionicons';
import { decimalToFraction } from '@/utils/fractionHelpers';
import {
  add,
  createOutline,
  checkmarkCircle,
  closeCircle,
  trash,
  chevronUp,
  chevronDown,
  swapVertical,
  checkmarkDone
} from 'ionicons/icons';
import type { RecipeLine } from '@/types/recipeline';
import { useMeasurementStore } from '@/store/useMeasurementStore';
import RecipeLineEditor from '@/components/RecipeLineEditor.vue';

// Register icons
addIcons({
  add,
  'create-outline': createOutline,
  'checkmark-circle': checkmarkCircle,
  'close-circle': closeCircle,
  trash,
  'chevron-up': chevronUp,
  'chevron-down': chevronDown,
  'swap-vertical': swapVertical,
  'checkmark-done': checkmarkDone
});

const props = defineProps<{
  modelValue: RecipeLine[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: RecipeLine[]): void;
}>();

// Initialize stores
const measurementStore = useMeasurementStore();

// State
const savedLines = ref<RecipeLine[]>([]);
const currentLine = ref<RecipeLine>({
  ingredient_name: '',
  quantity: null,
  measurement_name: '',
  measurement_abbreviation: '',
  measurement_id: undefined,
  sort_order: 0,
  notes: ''
});
const editingIndex = ref<number | null>(null);
const showNewLine = ref(false);
const showNotesField = ref(false);
const reorderMode = ref(false);

// Search state
const showSuggestions = ref(false);

// Initialize from props
onMounted(async () => {
  // Load measurements if not already loaded
  if (measurementStore.measurement.length === 0) {
    await measurementStore.fetchMeasurement();
  }

  // Initialize saved lines from props
  if (props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
    savedLines.value = props.modelValue.map((line, index) => ({
      ...line,
      sort_order: line.sort_order ?? index
    }));
  }
});

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    savedLines.value = newValue.map((line, index) => ({
      ...line,
      sort_order: line.sort_order ?? index
    }));
  }
}, { deep: true });

// Add new line
const addNewLine = () => {
  showNewLine.value = true;
  editingIndex.value = null;
  currentLine.value = {
    ingredient_name: '',
    quantity: null,
    measurement_name: '',
    measurement_abbreviation: '',
    measurement_id: undefined,
    sort_order: savedLines.value.length,
    notes: ''
  };
  showNotesField.value = false;
};

// Edit existing line
const editLine = (index: number) => {
  if (reorderMode.value) return;

  editingIndex.value = index;
  showNewLine.value = false;
  const line = savedLines.value[index];
  currentLine.value = { ...line };
  showNotesField.value = !!line.notes;
};

// Save current line
const saveLine = () => {
  if (!currentLine.value.ingredient_name) return;

  const lineToSave = { ...currentLine.value };

  if (editingIndex.value !== null) {
    // Update existing line
    savedLines.value[editingIndex.value] = lineToSave;
  } else {
    // Add new line
    savedLines.value.push(lineToSave);
  }

  emitUpdate();
  cancelEdit();
};

// Cancel editing
const cancelEdit = () => {
  editingIndex.value = null;
  showNewLine.value = false;
  currentLine.value = {
    ingredient_name: '',
    quantity: null,
    measurement_name: '',
    measurement_abbreviation: '',
    measurement_id: undefined,
    sort_order: savedLines.value.length,
    notes: ''
  };
  showSuggestions.value = false;
  showNotesField.value = false;
};

// Delete line
const deleteLine = (index: number) => {
  savedLines.value.splice(index, 1);
  // Update sort orders
  savedLines.value.forEach((line, idx) => {
    line.sort_order = idx;
  });
  emitUpdate();
};

// Move line up or down
const moveLine = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= savedLines.value.length) return;

  const temp = savedLines.value[index];
  savedLines.value[index] = savedLines.value[newIndex];
  savedLines.value[newIndex] = temp;

  // Update sort orders
  savedLines.value.forEach((line, idx) => {
    line.sort_order = idx;
  });
  emitUpdate();
};

const formatRecipeLine = (line: RecipeLine): string => {
  let result = '';

  // Handle quantity - check for valid number and convert to fraction
  if (line.quantity !== undefined && line.quantity !== null && line.quantity > 0) {
    result += decimalToFraction(line.quantity);
  }

  // Handle measurement
  if (line.measurement_name) {
    if (line.measurement_name !== 'Units') {
      result += ` ${line.measurement_abbreviation || line.measurement_name}`;
    }
    result += ' ';
  } else if (result) {
    // If we have a quantity but no measurement, add a space
    result += ' ';
  }

  // Handle ingredient name
  if (line.ingredient && line.ingredient.name) {
    result += line.ingredient.name;
  } else if (line.ingredient_name) {
    result += line.ingredient_name;
  }

  // Handle notes
  if (line.notes) {
    result += `, ${line.notes}`;
  }

  return result.trim();
};

// Emit update
const emitUpdate = () => {
  emit('update:modelValue', [...savedLines.value]);
};
</script>

