<template>
  <div v-if="mealData" class="ion-activatable ripple-parent rectangle meal-card" @click="chooseMeal(mealData)">
    <ion-card class="card-content my-2 mx-2">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="meal-image">
        <ion-img :src="`http://127.0.0.1:8000/storage/food-images/${mealData.image_name}.jpg`" class="h-full w-full object-cover"></ion-img>
      </div>
      <ion-card-title class="py-4">
        <ion-card-subtitle class="text-white text-center">{{ mealData.title }}</ion-card-subtitle>
      </ion-card-title>
    </ion-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMealStore } from '@/store/useMealStore';
import { IonCard, IonCardHeader, IonCardTitle, IonRippleEffect, IonImg } from '@ionic/vue';

export default defineComponent({
  components: { IonCard, IonCardHeader, IonCardTitle, IonRippleEffect, IonImg },

  props: {
    mealData: {
      type: Object,
      required: true
    }
  },

  setup(props, { emit }) {
    const mealStore = useMealStore();

    const chooseMeal = (meal) => {
      // Get a new meal and emit an event to update the parent component
      emit('replaceMeal', meal); // Notify parent to replace the meal
    };

    return {
      chooseMeal
    };
  }
});
</script>


<style scoped>
  .ripple-parent {
    position: relative;
    overflow: hidden;
    border: 1px solid #ddd;
    border-radius: .75rem;
  }

  .meal-card {
    display: flex;
    flex-direction: column;
  }

  .meal-image {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 70%;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .ion-card-header {
    flex: 0 1 auto;
    padding: 10px;
    text-align: center;
  }

  .ion-card-title {
    font-size: 1.2rem;
    font-weight: bold;
    padding: 5px;
    white-space: normal;
    word-wrap: break-word;
    overflow: hidden;
  }

</style>

