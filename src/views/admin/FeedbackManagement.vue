<!-- FeedbackManagement.vue -->
<template>
  <ion-page>
    <ion-content>
      <ion-header class="ion-no-border">
        <ion-toolbar class="transparent-toolbar">
        </ion-toolbar>
      </ion-header>
      <div class="container mx-auto p-4">
        <div class="flex">
          <Back-Arrow />
          <h1 class="text-xl font-bold my-6">Feedback</h1>
        </div>
        <!-- Feedback Filters -->
        <div class="mb-6 flex flex-wrap gap-2">
          <ion-select v-model="typeFilter" class="p-2 rounded border border-gray-300">
            <ion-select-option value="">All Types</ion-select-option>
            <ion-select-option value="suggestion">Suggestions</ion-select-option>
            <ion-select-option value="bug">Bug Reports</ion-select-option>
            <ion-select-option value="compliment">Compliments</ion-select-option>
            <ion-select-option value="other">Other</ion-select-option>
          </ion-select>

          <ion-select v-model="statusFilter" class="p-2 rounded border border-gray-300">
            <ion-select-option value="">All Status</ion-select-option>
            <ion-select-option value="true">Resolved</ion-select-option>
            <ion-select-option value="false">Unresolved</ion-select-option>
          </ion-select>

          <ion-select v-model="sortBy" class="p-2 rounded border border-gray-300">
            <ion-select-option value="created_at">Sort by Date</ion-select-option>
            <ion-select-option value="rating">Sort by Rating</ion-select-option>
            <ion-select-option value="type">Sort by Type</ion-select-option>
          </ion-select>

          <button @click="sortDirection = sortDirection === 'desc' ? 'asc' : 'desc'"
            class="p-2 rounded hover:bg-gray-300">
            {{ sortDirection === 'desc' ? '↓' : '↑' }}
          </button>
        </div>

        <!-- Feedback List -->
        <div v-if="loading" class="text-center py-8">
          Loading feedback...
        </div>

        <div v-else-if="filteredFeedback.length === 0" class="text-center py-8">
          No feedback found matching your filters.
        </div>

        <div v-else class="grid gap-4">
          <div v-for="item in filteredFeedback" :key="item.id"
            class="p-4 border rounded shadow-sm hover:shadow-md transition"
            :class="{'bg-green-500': item.is_resolved, 'dark:bg-gray-800': !item.is_resolved}">

            <div class="flex justify-between mb-2">
              <div>
                <span class="font-semibold">{{ formatType(item.type) }}</span>
                <span class="ml-2 text-yellow-500">
                  {{ '★'.repeat(item.rating) }}{{ '☆'.repeat(5 - item.rating) }}
                </span>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(item.created_at) }}
              </div>
            </div>

            <p class="mb-2">{{ item.message }}</p>

            <div v-if="item.email" class="text-sm dark:text-gray-200 mb-2">
              Contact: {{ item.email }}
            </div>

            <div class="flex justify-between items-center mt-4">
              <div>
                <span :class="item.is_resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                  class="px-2 py-1 rounded text-xs">
                  {{ item.is_resolved ? 'Resolved' : 'Unresolved' }}
                </span>
              </div>

              <button @click="openFeedbackDetail(item)"
                class="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                View Details
              </button>
            </div>
          </div>
        </div>

        <!-- Feedback Detail Modal -->
         <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Feedback Details</h2>
                <button @click="showModal = false" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
                  &times;
                </button>
              </div>

              <div v-if="selectedFeedback" class="space-y-4">
                <div class="text-gray-900 dark:text-white">
                  <span class="font-semibold">Type:</span> {{ formatType(selectedFeedback.type) }}
                </div>

                <div class="text-gray-900 dark:text-white">
                  <span class="font-semibold">Rating:</span>
                  <span class="text-yellow-500">
                    {{ '★'.repeat(selectedFeedback.rating) }}{{ '☆'.repeat(5 - selectedFeedback.rating) }}
                  </span>
                </div>

                <div class="text-gray-900 dark:text-white">
                  <span class="font-semibold">Submitted:</span> {{ formatDate(selectedFeedback.created_at, true) }}
                </div>

                <div v-if="selectedFeedback.email" class="text-gray-900 dark:text-white">
                  <span class="font-semibold">Contact:</span> {{ selectedFeedback.email }}
                </div>

                <div class="text-gray-900 dark:text-white">
                  <span class="font-semibold">Message:</span>
                  <p class="mt-1 whitespace-pre-wrap">{{ selectedFeedback.message }}</p>
                </div>

                <div class="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <div class="mb-2 flex items-center">
                    <span class="font-semibold mr-2 text-gray-900 dark:text-white">Status:</span>
                    <ion-select v-model="selectedFeedback.is_resolved" class="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <ion-select-option :value="false">Unresolved</ion-select-option>
                      <ion-select-option :value="true">Resolved</ion-select-option>
                    </ion-select>
                  </div>

                  <div class="mb-2">
                    <span class="font-semibold text-gray-900 dark:text-white">Resolution Notes:</span>
                    <textarea v-model="selectedFeedback.resolution_notes" 
                      class="mt-1 p-2 w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows="3" placeholder="Add notes about how this feedback was resolved..."></textarea>
                  </div>

                  <button @click="saveFeedback"
                    class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonSelect, IonSelectOption, IonHeader, IonToolbar } from '@ionic/vue';
import api from '@/api/axios';
import BackArrow from '@/components/navigation/BackArrow.vue';

// State
const feedback = ref([]);
const loading = ref(true);
const typeFilter = ref('');
const statusFilter = ref('');
const sortBy = ref('created_at');
const sortDirection = ref('desc');
const showModal = ref(false);
const selectedFeedback = ref(null);

// Fetch feedback data
const fetchFeedback = async () => {
  loading.value = true;
  try {
    const response = await api.get('/feedback');
    feedback.value = response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
  } finally {
    loading.value = false;
  }
};

// Computed properties
const filteredFeedback = computed(() => {
  let result = [...feedback.value];
  
  // Apply type filter
  if (typeFilter.value) {
    result = result.filter(item => item.type === typeFilter.value);
  }
  
  // Apply status filter
  if (statusFilter.value === 'true') {
    result = result.filter(item => item.is_resolved);
  } else if (statusFilter.value === 'false') {
    result = result.filter(item => !item.is_resolved);
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy.value === 'rating') {
      comparison = a.rating - b.rating;
    } else if (sortBy.value === 'type') {
      comparison = a.type.localeCompare(b.type);
    } else { // Default: created_at
      comparison = new Date(a.created_at) - new Date(b.created_at);
    }
    
    return sortDirection.value === 'desc' ? -comparison : comparison;
  });
  
  return result;
});

// Methods
const formatType = (type) => {
  const types = {
    'suggestion': 'Suggestion',
    'bug': 'Bug Report',
    'compliment': 'Compliment',
    'other': 'Other'
  };
  return types[type] || type;
};

const formatDate = (dateString, includeTime = false) => {
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleString();
  }
  
  return date.toLocaleDateString();
};

const openFeedbackDetail = (item) => {
  selectedFeedback.value = JSON.parse(JSON.stringify(item));
  showModal.value = true;
};

const saveFeedback = async () => {
  try {
    const response = await api.put(`/feedback/${selectedFeedback.value.id}`, {
      is_resolved: selectedFeedback.value.is_resolved,
      resolution_notes: selectedFeedback.value.resolution_notes
    });
    
    // Update the item in the local array
    const index = feedback.value.findIndex(item => item.id === selectedFeedback.value.id);
    if (index !== -1) {
      feedback.value[index] = response.data.feedback;
    }
    
    showModal.value = false;
  } catch (error) {
    console.error('Error updating feedback:', error);
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchFeedback();
});
</script>
