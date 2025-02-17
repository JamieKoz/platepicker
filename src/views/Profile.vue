<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="router.go(-1)">
            <ion-icon :icon="arrowBack" />
          </ion-button>
        </ion-buttons>
        <ion-title>Edit Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="max-w-md mx-auto">
        <div class="mb-6">
          <h2 class="font-bold text-lg font-medium mb-4">We'd love your feedback!</h2>
          <ion-item>
            <ion-button class="p-2 w-full text-lg" @click="navigateTo('/feedback')">Submit your feedback</ion-button>
          </ion-item>
        </div>

        <form @submit.prevent="updateProfile" class="space-y-4">
          <!-- Profile Section -->
          <div class="mb-6">
            <h2 class="font-bold text-lg font-medium mb-4">Profile Details</h2>

            <ion-item>
              <ion-label position="stacked" class="font-bold">Username</ion-label>
              <ion-input v-model="formData.username" type="text" required
                @input="e => formData.username = capitalizeFirstLetter(e.target.value)" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked" class="font-bold">First Name</ion-label>
              <ion-input v-model="formData.firstName" type="text" required :value="user?.firstName || ''" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked" class="font-bold">Last Name</ion-label>
              <ion-input v-model="formData.lastName" type="text" required :value="user?.lastName || ''" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked" class="font-bold">Email</ion-label>
              <ion-input v-model="formData.email" type="email" required
                :value="user?.primaryEmailAddress?.emailAddress || ''" />
            </ion-item>
          </div>

          <!-- Password Section -->
          <div class="mb-6">
            <h2 class="text-lg font-medium mb-4 font-bold">Change Password</h2>
            <ion-item>
              <ion-label position="stacked" class="font-bold">Current Password</ion-label>
              <ion-input v-model="passwordData.currentPassword" type="password" :clear-input="true" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked" class="font-bold">New Password</ion-label>
              <ion-input v-model="passwordData.newPassword" type="password" :clear-input="true" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked" class="font-bold">Confirm New Password</ion-label>
              <ion-input v-model="passwordData.confirmPassword" type="password" :clear-input="true" />
            </ion-item>
            <div v-if="passwordError" class="text-red-500 text-sm mt-2">
              {{ passwordError }}
            </div>
          </div>

          <ion-button type="submit" expand="block">
            Save Changes
          </ion-button>
        </form>
      </div>
    </ion-content>

    <ion-loading :is-open="isLoading" message="Please wait..." :duration="3000" />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUser } from '@clerk/vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonLoading,
  toastController
} from '@ionic/vue';
import { arrowBack } from 'ionicons/icons';
import { capitalizeFirstLetter } from '@/utils/string-utils';
const router = useRouter();
const { user } = useUser();
const isLoading = ref(false);
const passwordError = ref('');

const formData = ref({
  username: '',
  firstName: '',
  lastName: '',
  email: ''
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Watch for user data changes and update form
watch(user, (newUser) => {
  if (newUser) {
    formData.value = {
      username: newUser.username || '',
      firstName: newUser.firstName || '',
      lastName: newUser.lastName || '',
      email: newUser.primaryEmailAddress?.emailAddress || ''
    };
  }
}, { immediate: true });

const showToast = async (message: string, color: string = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color
  });
  await toast.present();
};

const validatePasswordChange = () => {
  if (!passwordData.value.currentPassword && !passwordData.value.newPassword && !passwordData.value.confirmPassword) {
    return true; // No password change requested
  }

  if (!passwordData.value.currentPassword) {
    passwordError.value = 'Current password is required';
    return false;
  }

  if (!passwordData.value.newPassword) {
    passwordError.value = 'New password is required';
    return false;
  }

  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    passwordError.value = 'New passwords do not match';
    return false;
  }

  if (passwordData.value.newPassword.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long';
    return false;
  }

  passwordError.value = '';
  return true;
};

const updateProfile = async () => {
  try {
    isLoading.value = true;
    passwordError.value = '';

    if (!user.value) return;

    // Validate password change if attempted
    if (!validatePasswordChange()) {
      isLoading.value = false;
      return;
    }

    // Update profile information
    await user.value.update({
      username: formData.value.username.toLowerCase(),
      firstName: formData.value.firstName,
      lastName: formData.value.lastName
    });

    // Update email if changed
    if (formData.value.email !== user.value.primaryEmailAddress?.emailAddress) {
      const emailAddress = await user.value.createEmailAddress({
        email: formData.value.email
      });
      // await emailAddress.setPrimary();
    }

    // Update password if provided
    if (passwordData.value.currentPassword && passwordData.value.newPassword) {
      try {
        await user.value.updatePassword({
          currentPassword: passwordData.value.currentPassword,
          newPassword: passwordData.value.newPassword
        });
        
        // Clear password fields after successful update
        passwordData.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (error) {
        console.error('Error updating password:', error);
        passwordError.value = 'Failed to update password. Please check your current password.';
        throw error;
      }
    }

    await showToast('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    await showToast('Failed to update profile', 'danger');
  } finally {
    isLoading.value = false;
  }
};

const navigateTo = async (path: string) => {
  try {
    await router.push(path);
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

watch(user, (newUser) => {
  if (newUser) {
    const username = newUser.username || '';
    formData.value = {
      username: username.charAt(0).toUpperCase() + username.slice(1),
      firstName: newUser.firstName || '',
      lastName: newUser.lastName || '',
      email: newUser.primaryEmailAddress?.emailAddress || ''
    };
  }
}, { immediate: true });
</script>
