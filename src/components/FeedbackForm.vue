<!-- FeedbackForm.vue -->
<template>
  <div class="feedback-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Share Your Feedback</h2>
      </div>

      <form @submit.prevent="submitFeedback" class="feedback-form">
        <div class="form-group">
          <label>Rating</label>
          <div class="star-rating">
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

        <div class="form-group">
          <label for="feedbackType">Type of Feedback</label>
          <select v-model="feedback.type" id="feedbackType" required>
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug Report</option>
            <option value="compliment">Compliment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="feedbackMessage">Your Feedback</label>
          <textarea
            v-model="feedback.message"
            id="feedbackMessage"
            rows="5"
            required
            placeholder="Tell us what you think..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="userEmail">Your Email (optional)</label>
          <input
            type="email"
            v-model="feedback.email"
            id="userEmail"
            placeholder="email@example.com"
          >
        </div>

        <div class="form-actions">
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
    email: ''
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
.feedback-modal {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
}

input, select, textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

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

.star-rating {
  display: flex;
  gap: 0.5rem;
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
