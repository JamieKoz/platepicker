<template>
  <ion-list>
    <ion-item>
      <ion-input v-model="form.email" label="Email" type="email" placeholder="email@domain.com"></ion-input>
    </ion-item>

    <ion-item>
      <ion-input v-model="form.password" label="Password" type="password" placeholder="Enter password"></ion-input>
    </ion-item>

    <ion-item>
      <ion-button expand="block" @click="loginUser">Login</ion-button>
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
    const form = reactive({ email: '', password: '' });

    const loginUser = async () => {
      try {
        await axios.post('http://127.0.0.1:8000/api/login', form);
        alert('Login successful');
      } catch (error) {
        alert('Login failed');
      }
    };

    return { form, loginUser };
  }
});
</script>
