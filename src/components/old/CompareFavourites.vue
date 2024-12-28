<template>
  <MealChooser v-if="!comparingFavourites" />
  <div v-else class="flex flex-col min-h-screen bg-gray-900">
    <div class="flex-1 flex items-center relative">
      <div v-if="finalResult !== null" class="absolute top-0 w-full h-full flex flex-col items-center justify-center z-10 bg-gray-900 bg-opacity-75 transition-opacity duration-500">
        <div class="text-2xl font-bold text-white">
          Your meal has been decided!
        </div>
        <div class="mt-4">
          <svg class="h-16 w-16 text-yellow-500 animate-sparkle" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 0l3.09 8.26L24 9.27l-6 5.73L20.18 24 12 19.77 3.82 24 6 15 0 9.27l8.91-1.01L12 0z"></path>
          </svg>
        </div>
        <div 
          class="cursor-pointer mt-8 p-6 bg-gray-800 border-green-500 border-4 relative flex flex-col items-center justify-center"
          @click="flipCard"
          :class="{ 'flipped': isFlipped }"
          style="width:350px; height:475px;">
          <div class="flipper">
            <div v-show="!isFlipped" class="absolute flex flex-col items-center">
              <div class="ml-4 text-lg leading-7 font-semibold text-white">
                {{ displayedMeals[finalResult].title }}
              </div>
              <img :src="`http://127.0.0.1:8000/storage/food-images/${displayedMeals[finalResult].image_name}.jpg`" class="meal-image mx-auto mt-4" />
              <!-- <div class="text-center mt-4"> -->
              <!--   <div class="mt-2 text-white text-sm"> -->
              <!--     {{ displayedMeals[finalResult].strCategory }} -->
              <!--   </div> -->
              <!--   <div class="mt-2 text-white text-sm"> -->
              <!--     {{ displayedMeals[finalResult].strArea }} -->
              <!--   </div> -->
              <!-- </div> -->
            </div>

            <div class="back flex flex-col items-start text-white p-4">
              <div class="ml-4 text-lg leading-7 font-semibold">
                Instructions
              </div>
              <div class="mt-2 text-sm">
                {{ displayedMeals[finalResult].instructions }}
              </div>
              <div class="mt-4">
                <div class="font-semibold">Ingredients:</div>
                <ul class="text-sm">
                  <li v-for="(ingredient, index) in ingredients" :key="index">{{ ingredient }}</li>
                </ul>
              </div>
              <div class="mt-4">
                <!-- <a :href="displayedMeals[finalResult].strYoutube" target="_blank" class="text-blue-500 underline"> -->
                <!--   Watch on YouTube -->
                <!-- </a> -->
              </div>
            </div>
          </div>
        </div>
        <button class="text-white flex my-2"><i><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 50 50">
          <path d="M 4 4 L 4 44 A 2.0002 2.0002 0 0 0 6 46 L 44 46 A 2.0002 2.0002 0 0 0 46 44 L 46 32 L 42 32 L 42 42 L 8 42 L 8 4 L 4 4 z M 35.978516 4.9804688 A 2.0002 2.0002 0 0 0 34.585938 8.4140625 L 37.171875 11 L 36.048828 11 C 25.976906 10.74934 19.618605 12.315463 15.953125 16.726562 C 12.287645 21.137662 11.831327 27.512697 12 36.039062 A 2.0003814 2.0003814 0 1 0 16 35.960938 C 15.835673 27.654299 16.533777 22.2844 19.029297 19.28125 C 21.524817 16.2781 26.334094 14.76066 35.951172 15 L 35.974609 15 L 37.171875 15 L 34.585938 17.585938 A 2.0002 2.0002 0 1 0 37.414062 20.414062 L 43.236328 14.591797 A 2.0002 2.0002 0 0 0 43.619141 14.208984 L 44.828125 13 L 43.619141 11.791016 A 2.0002 2.0002 0 0 0 43.228516 11.400391 L 37.414062 5.5859375 A 2.0002 2.0002 0 0 0 35.978516 4.9804688 z" fill="#FFF"></path>
          </svg></i></button>
        <button class="text-white border-4" @click="emitReturnToMealChooser">Not satisfied? Continue comparing</button>

      </div>

      <div v-if="finalResult === null" class="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:w-1/2 h-full px-4">
        <div v-for="(meal, index) in displayedMeals" :key="index" @click="chooseFavouriteMeal(index)" :class="[ 'cursor-pointer lg:p-6 p-2 hover:bg-gray-700 bg-gray-800 transition duration-300 rounded-lg border border-white-100 cursor-pointer relative flex flex-col items-center justify-center meal-box', { 'border-green-500 border-4': finalResult === index } ]" style="width: 100%; max-width: 500px; height: 100%; max-height: 800px;">
          <div class="flex flex-col items-center">
            <div class="lg:ml-4 lg:text-lg text-sm lg:leading-7 font-semibold text-white">{{ meal.title }}</div>
            <img :src="`http://127.0.0.1:8000/storage/food-images/${meal.image_name}.jpg`" class="h-auto lg:w-full w-1/2 mx-auto lg:mt-4" />
            <div class="text-center lg:mt-4 mt-1">
              <!-- <div class="lg:mt-2 text-white text-sm">{{ meal.strCategory }}, {{ meal.strArea }}</div> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios';
import MealChooser from './MealChooser.vue';

export default {
  props: ['favourites'],
  data() {
    return {
      displayedMeals: [],
      loading: false,
      loadingIndex: null,
      finalResult: null,
      localFavourites: [...this.favourites],
      isFlipped: false,
      ingredients: [],
      comparingFavourites: true,
    };
  },
  components: {
    MealChooser,
  },
  methods: {
    emitReturnToMealChooser() {
      this.$emit('return');
      window.location.reload();
    },
    async startComparison() {
      if (this.localFavourites.length > 1) {
        this.displayedMeals = [
          this.localFavourites[0],
          this.localFavourites[1],
        ];
      } else if (this.localFavourites.length === 1) {
        this.displayedMeals = [this.localFavourites[0]];
        this.finalResult = 0;
        this.getIngredients(this.displayedMeals[0]);
      }
    },

    async chooseFavouriteMeal(chosenIndex) {
      const otherIndex = chosenIndex === 0 ? 1 : 0;
      if (this.displayedMeals.length > 1) {
        this.localFavourites.splice(otherIndex, 1);
        if (this.localFavourites.length > 1) {
          this.displayedMeals = [
            this.localFavourites[0],
            this.localFavourites[1],
          ];
        } else if (this.localFavourites.length === 1) {
          this.displayedMeals = [this.localFavourites[0]];
          this.finalResult = 0;
          this.getIngredients(this.displayedMeals[0]);
        }
      } else if (this.displayedMeals.length === 1) {
        this.finalResult = 0;
        this.getIngredients(this.displayedMeals[0]);
      }
    },

    getIngredients(meal) {
      let cleanedIngredientsStr = meal.cleaned_ingredients;
      cleanedIngredientsStr = cleanedIngredientsStr.slice(1, -1);
      cleanedIngredientsStr = cleanedIngredientsStr.replace(/\\"/g, '"');
      cleanedIngredientsStr = cleanedIngredientsStr.replace(/'/g, '"');
      cleanedIngredientsStr = cleanedIngredientsStr.replace(/\\\//g, '/');
      let ingredientsArray = [];
      try {
        ingredientsArray = JSON.parse(cleanedIngredientsStr);
      } catch (error) {
        console.error('Error parsing cleaned_ingredients:', error);
        return;
      }

      this.ingredients = ingredientsArray;
    },

    flipCard() {
      this.isFlipped = !this.isFlipped;
    },
    returnToMealChooser() {
      this.comparingFavourites = false;
    },
  },
  created() {
    this.startComparison();
  },
};
</script>
<style scoped>
.flip-container {
  perspective: 1000px;
  width: 100%;
  max-width: 1000px;
}

.flipper {
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
  width: 100%;
  height: 100%;
}

.flipped .flipper {
  transform: rotateY(180deg);
}

.front, .back {
  backface-visibility: hidden;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.back {
  transform: rotateY(180deg);
}

.meal-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

.animate-sparkle {
  animation: sparkle 1s infinite;
}
</style>


