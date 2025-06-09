<!-- RecipeLineComponent.vue -->
<template>
  <div class="mt-5">
    <div class="flex justify-between items-center mb-4">
      <ion-label class="opacity-70 text-sm font-medium block">Ingredients</ion-label>

      <!-- Manage Groups button -->
      <div v-if="savedLines.length > 0 || showNewLine" class="flex gap-2">

        <ion-button @click="showGroupManager = !showGroupManager" size="small" fill="clear" color="primary">
          <ion-icon name="layers-outline" slot="start"></ion-icon>
          {{ showGroupManager ? 'Close' : 'Manage Groups' }}
        </ion-button>

        <ion-button v-if="savedLines.length > 1" @click="reorderMode = !reorderMode" size="small" fill="clear">
          <ion-icon :name="reorderMode ? 'checkmark-done' : 'swap-vertical'" slot="start"></ion-icon>
          {{ reorderMode ? 'Done' : 'Reorder' }}
        </ion-button>
      </div>
    </div>

    <!-- Group Manager - Simple input to create groups -->
    <div v-if="showGroupManager" class="mb-4 p-3 border-1 border-gray-300 rounded-lg">
      <div v-if="!entityId" class="text-sm text-gray-600 mb-2">
        Save the {{ storeType === 'recipe' ? 'recipe' : 'meal' }} first to create ingredient groups
      </div>
      <div v-else class="flex items-center gap-2">
        <ion-input v-model="newGroupName" placeholder="Create new group" class="flex-1"
          @keyup.enter="createGroup"></ion-input>
        <ion-button @click="createGroup" size="small" :disabled="!newGroupName">
          <ion-icon name="add" slot="start"></ion-icon>
          Create Group
        </ion-button>
      </div>
    </div>

    <!-- Reorderable list -->
    <div v-if="reorderMode && savedLines.length > 1" class="mt-4 space-y-2">
      <div class="text-sm font-medium mb-2">Drag to reorder ingredients:</div>
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
            <div class="font-medium">{{ line.quantity || '' }} {{ line.measurement_name }} {{ line.ingredient_name }}
            </div>
            <div v-if="line.recipe_group_name" class="text-xs text-gray-500">Group: {{ line.recipe_group_name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ingredients grouped by their groups -->
    <div v-if="savedLines.length > 0" class="space-y-4 mb-4">
      <div v-for="(group, groupName) in groupedIngredients" :key="groupName" class="group-section">
        <!-- Group header -->
        <div v-if="groupName !== 'Main Ingredients'" class="group-header mb-2">
          <h3 class="text-lg font-semibold text-primary border-b border-gray-300 pb-1">
            {{ groupName }}
          </h3>
        </div>
        <div v-else class="group-header mb-2">
          <h3 class="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-1">
            {{ groupName }}
          </h3>
        </div>

        <!-- Ingredients in this group -->
        <div class="space-y-2" :class="{ 'ml-4': groupName !== 'Main Ingredients' }">
          <div v-for="(line, index) in group" :key="line.originalIndex" class="group">
            <!-- Display mode -->
            <div v-if="editingIndex !== line.originalIndex" @click="editLine(line.originalIndex)"
              class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border-1 border-gray-300 hover:border-gray-400">
              <div class="flex-1 flex items-center gap-1">
                <span class="font-medium">{{ formatRecipeLine(line) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <ion-icon name="create-outline" class="text-gray-400"></ion-icon>
                <ion-button fill="clear" size="small" color="danger" @click.stop="deleteLine(line.originalIndex)"
                  class="ml-1">
                  <ion-icon name="trash" size="small"></ion-icon>
                </ion-button>
              </div>
            </div>

            <!-- Edit mode -->
            <div v-else class="p-3 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <RecipeLineEditor v-model="currentLine" :recipe-id="props.recipeId" :user-meal-id="props.userMealId"
                :store-type="storeType" :available-groups="availableGroups" @save="saveLine" @cancel="cancelEdit" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New ingredient form -->
    <div v-if="showNewLine">
      <div v-if="showNewLine">
        <RecipeLineEditor v-model="currentLine" :recipe-id="props.recipeId" :user-meal-id="props.userMealId"
          :store-type="storeType" :available-groups="availableGroups"
          container-class="mb-4 p-3 rounded-lg border-2 border-green-200 dark:border-green-700" @save="saveLine"
          @cancel="cancelEdit" />
      </div>
    </div>

    <!-- Add ingredient button -->
    <ion-button v-if="!showNewLine && editingIndex === null" @click="addNewLine" fill="outline" size="small"
      class="w-full">
      <ion-icon name="add" slot="start"></ion-icon> Add {{ savedLines.length > 0 ? 'Another' : '' }} Ingredient
    </ion-button>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import {
  IonButton,
  IonIcon,
  IonLabel,
  IonInput
} from '@ionic/vue';
import { decimalToFraction } from '@/utils/fractionHelpers';
import type { RecipeLine } from '@/types/recipeline';
import { useMeasurementStore } from '@/store/useMeasurementStore';
import { useRecipeGroupsStore } from '@/store/useRecipeGroupsStore';
import { useUserMealGroupsStore } from '@/store/useUserMealGroupsStore';
import RecipeLineEditor from '@/components/RecipeLineEditor.vue';
import { RecipeGroup } from '@/types/recipeGroup';

const props = defineProps<{
  modelValue: RecipeLine[];
  recipeId?: number;
  userMealId?: number;
  storeType?: 'recipe' | 'userMeal'; // New prop to determine which store to use
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: RecipeLine[]): void;
}>();

// Initialize stores
const measurementStore = useMeasurementStore();
const recipeGroupsStore = useRecipeGroupsStore();
const userMealGroupsStore = useUserMealGroupsStore();

// Determine which store and ID to use
const storeType = computed(() => {
  if (props.storeType) return props.storeType;
  // Auto-detect based on props
  return props.recipeId ? 'recipe' : 'userMeal';
});

const entityId = computed(() => {
  const id = storeType.value === 'recipe' ? props.recipeId : props.userMealId;
  return id;
});

const groupsStore = computed(() => {
  return storeType.value === 'recipe' ? recipeGroupsStore : userMealGroupsStore;
});

// State
const savedLines = ref<RecipeLine[]>([]);
const currentLine = ref<RecipeLine>({
  ingredient_name: '',
  quantity: null,
  measurement_name: '',
  measurement_abbreviation: '',
  measurement_id: undefined,
  recipe_group_id: undefined,
  sort_order: 0,
});
const editingIndex = ref<number | null>(null);
const showNewLine = ref(false);
const showGroupManager = ref(false);
const newGroupName = ref('');
const reorderMode = ref(false);

// Available groups for the select
const availableGroups = computed(() => {
  const storeGroups = groupsStore.value.groups;
  return Array.isArray(storeGroups) ? storeGroups : [];
});

// Group ingredients by their group names
const groupedIngredients = computed(() => {
  const groups: Record<string, Array<RecipeLine & { originalIndex: number }>> = {};
  
  savedLines.value.forEach((line, index) => {
    let groupName = 'Main Ingredients';
    
    const groupIdField = storeType.value === 'recipe' ? 'recipe_group_id' : 'user_meal_group_id';
    const groupId = (line as any)[groupIdField];
    
    if (groupId && Array.isArray(groupsStore.value.groups)) {
      const group = groupsStore.value.groups.find((g: RecipeGroup) => g.id === groupId);
      groupName = group?.name || 'Main Ingredients';
    }
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push({ ...line, originalIndex: index });
  });
  
  // Sort groups so "Main Ingredients" comes first
  const sortedGroups: Record<string, Array<RecipeLine & { originalIndex: number }>> = {};
  
  if (groups['Main Ingredients']) {
    sortedGroups['Main Ingredients'] = groups['Main Ingredients'];
  }
  
  Object.keys(groups)
    .filter(key => key !== 'Main Ingredients')
    .sort()
    .forEach(key => {
      sortedGroups[key] = groups[key];
    });
  
  return sortedGroups;
});

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

// Initialize
onMounted(async () => {
  // Load measurements
  if (measurementStore.measurement.length === 0) {
    await measurementStore.fetchMeasurement();
  }

  // Load groups for this entity
  if (entityId.value) {
    try {
      if (storeType.value === 'recipe') {
        await recipeGroupsStore.fetchGroups(entityId.value);
      } else {
        await userMealGroupsStore.fetchGroups(entityId.value);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
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

// Create a new group
const createGroup = async () => {
  if (!newGroupName.value.trim()) return;

  if (!entityId.value) {
    console.warn(`Cannot create group: ${storeType.value === 'recipe' ? 'Recipe' : 'User meal'} must be saved first`);
    return;
  } 

  try {
    if (storeType.value === 'recipe') {
      await recipeGroupsStore.createGroup(entityId.value, { 
        name: newGroupName.value.trim() 
      });
    } else {
      await userMealGroupsStore.createGroup(entityId.value, { 
        name: newGroupName.value.trim() 
      });
    }
    newGroupName.value = '';
  } catch (error) {
    console.error('Failed to create group:', error);
  }
};

// Add new ingredient
const addNewLine = () => {
  showNewLine.value = true;
  editingIndex.value = null;
  
  const baseLineData = {
    ingredient_name: '',
    quantity: null,
    measurement_name: '',
    measurement_abbreviation: '',
    measurement_id: undefined,
    sort_order: savedLines.value.length,
  };

  // Set the appropriate group ID field based on store type
  if (storeType.value === 'recipe') {
    currentLine.value = {
      ...baseLineData,
      recipe_group_id: undefined,
    };
  } else {
    currentLine.value = {
      ...baseLineData,
      user_meal_group_id: undefined,
    };
  }
};

// Edit existing ingredient
const editLine = (index: number) => {
  editingIndex.value = index;
  showNewLine.value = false;
  const line = savedLines.value[index];
  currentLine.value = { ...line };
};

// Save ingredient
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
  
  const baseLineData = {
    ingredient_name: '',
    quantity: null,
    measurement_name: '',
    measurement_abbreviation: '',
    measurement_id: undefined,
    sort_order: savedLines.value.length,
  };

  // Set the appropriate group ID field based on store type
  if (storeType.value === 'recipe') {
    currentLine.value = {
      ...baseLineData,
      recipe_group_id: undefined,
    };
  } else {
    currentLine.value = {
      ...baseLineData,
      user_meal_group_id: undefined,
    };
  }
};

// Delete ingredient
const deleteLine = (index: number) => {
  savedLines.value.splice(index, 1);
  // Update sort orders
  savedLines.value.forEach((line, idx) => {
    line.sort_order = idx;
  });
  emitUpdate();
};

// Format recipe line for display
const formatRecipeLine = (line: RecipeLine): string => {
  let result = '';

  if (line.quantity !== undefined && line.quantity !== null && line.quantity > 0) {
    result += decimalToFraction(line.quantity);
  }

  if (line.measurement_name) {
    if (line.measurement_name !== 'Units') {
      result += ` ${line.measurement_abbreviation || line.measurement_name}`;
    }
    result += ' ';
  } else if (result) {
    result += ' ';
  }

  if (line.ingredient && line.ingredient.name) {
    result += line.ingredient.name;
  } else if (line.ingredient_name) {
    result += line.ingredient_name;
  }

  // Add notes if they exist
  if (line.notes) {
    result += ` (${line.notes})`;
  }

  return result.trim();
};
// Emit update
const emitUpdate = () => {
  emit('update:modelValue', [...savedLines.value]);
};
</script>
