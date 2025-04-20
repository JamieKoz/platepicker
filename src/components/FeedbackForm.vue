<!-- FeedbackForm.vue -->
<template>
  <div class="w-full flex items-center justify-center">
    <div class="p-4 rounded-md w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto modal-content">
      <div class="flex justify-between items-center mb-4">
        <h2>Share Your Feedback</h2>
      </div>

      <form @submit.prevent="submitFeedback" class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <label>Rating</label>
          <div class="flex gap-2">
            <button 
              v-for="star in 5" 
              :key="star"
              type="button"
              @click="feedback.rating = star"
              class="star-button"
              :class="{ 'active': star <= feedback.rating }"
            >
              ★
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="feedbackType">Type of Feedback</label>
          <select v-model="feedback.type" id="feedbackType" class="p-2 border-solid border-1 border-white rounded-lg" required>
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug Report</option>
            <option value="compliment">Compliment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label for="feedbackMessage">Your Feedback</label>
          <textarea
            v-model="feedback.message"
            id="feedbackMessage"
            rows="5"
            required
            placeholder="Tell us what you think..."
            class="resize-y p-2 border-solid border-1 border-white rounded-lg"
          ></textarea>
        </div>

        <div> 
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Sending...' : 'Submit Feedback' }}
          </button>
        </div>

        <div v-if="submitStatus" :class="['status-message', submitStatus.type]">
          {{ submitStatus.message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FeedbackData {
  type: 'suggestion' | 'bug' | 'compliment' | 'other';
  message: string;
  email: string;
  rating: number;
}

interface SubmitStatus {
  type: 'success' | 'error';
  message: string;
}

const isSubmitting = ref(false)
const feedback = ref<FeedbackData>({
  type: 'suggestion',
  message: '',
  email: '',
  rating: 0
})
const submitStatus = ref<SubmitStatus | null>(null)

const resetForm = () => {
  feedback.value = {
    type: 'suggestion',
    message: '',
    email: '', 
    rating: 0 
  }
  submitStatus.value = null
}

const submitFeedback = async () => {
  isSubmitting.value = true
  submitStatus.value = null

  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedback.value)
    })

    if (!response.ok) {
      throw new Error('Failed to submit feedback')
    }

    submitStatus.value = {
      type: 'success',
      message: 'Thank you for your feedback!'
    }

    // Reset form after success
    setTimeout(() => {
      resetForm()
    }, 2000)
  } catch (error) {
    submitStatus.value = {
      type: 'error',
      message: 'Failed to submit feedback. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>

button[type="submit"] {
  background-color: #4CAF50;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status-message {
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.status-message.success {
  color: #2e7d32;
}

.status-message.error {
  color: #c62828;
}

.star-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #ddd;
  padding: 0;
  transition: color 0.2s;
}

.star-button.active {
  color: #ffd700;
}

.star-button:hover {
  color: #ffd700;
}
</style>
