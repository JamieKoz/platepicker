<template>
  <ion-list>
    <ion-item>
      <ion-input v-model="form.name" label="Name" placeholder="Enter your name"></ion-input>
    </ion-item>

    <ion-item>
      <ion-input v-model="form.email" label="Email" type="email" placeholder="email@domain.com"></ion-input>
    </ion-item>

    <ion-item>
      <ion-input v-model="form.password" label="Password" type="password" placeholder="Enter password"></ion-input>
    </ion-item>

    <ion-item>
      <ion-button expand="block" @click="registerUser">Register</ion-button>
    </ion-item>
  </ion-list>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import axios from 'axios';
import { IonInput, IonItem, IonList, IonButton } from '@ionic/vue';

export default defineComponent({
  components: { IonInput, IonItem, IonList, IonButton },
  setup() {
    const form = reactive({ name: '', email: '', password: '' });

    const registerUser = async () => {
      try {
        await axios.post('http://127.0.0.1:8000/api/register', form);
        alert('Registration successful');
      } catch (error) {
        alert('Registration failed');
      }
    };

    return { form, registerUser };
  }
});
</script>
