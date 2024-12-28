<template>
  <div>
    <CompareFavourites v-if="comparingFavourites" :favourites="localFavourites" />
    <div v-else class="flex flex-col min-h-screen bg-gray-900">
      <div class="flex lg:flex-col justify-around items-center lg:py-4 py-2">
        <h1 class="text-white mb-4 text-lg font-bold">{{ mealCounter }}</h1>
        <button v-show="localFavourites.length > 0" @click="emitCompareFavourites" class="lg:mt-4 text-sm bg-gray-500 text-white px-4 py-2 rounded">Compare Favourites</button>
        <!-- <div class="flex justify-center lg:mb-4"> -->
        <!--   <select id="category" v-model="selectedCategory" @change="updateCategory" class="bg-gray-200 text-gray-900 dark:text-white"> -->
        <!--     <option value="all">All</option> -->
        <!--     <option value="Dessert">Dessert</option> -->
        <!--     <option value="Meal">Meal</option> -->
        <!--   </select> -->
        <!-- </div> -->
      </div>

      <div class="flex-1 flex items-center justify-center">
        <div class="grid lg:grid-cols-2 grid-cols-1 lg:gap-6 gap-2 lg:w-1/2 lg:h-full px-4" style="height:500px;">
          <!-- <transition-group name="meal" mode="out-in" class="lg:w-full w-full flex flex-wrap"> -->
            <div v-for="(meal, index) in displayedMeals" :key="meal.title" @click="chooseMeal(index)" :class="{'smoke': loading && loadingIndex === index}" class="cursor-pointer lg:p-6 p-2 hover:bg-gray-700 bg-gray-800 transition duration-300 rounded-lg border border-white-100 relative flex flex-col items-center justify-center meal-box">
              <div class="flex flex-col items-center">
                <div class="lg:ml-4 lg:text-lg text-sm lg:leading-7 font-semibold text-white">{{ meal.title }}</div>
                <img :src="`http://127.0.0.1:8000/storage/food-images/${meal.image_name}.jpg`" class="h-auto lg:w-full lg:h-80 mx-auto lg:mt-4 rounded-lg" />
              </div>
            </div>
          <!-- </transition-group> -->
        </div>
      </div>

      <div class="lg:mt-8 bg-gray-800 overflow-hidden shadow sm:rounded-lg mx-4 p-2 lg:p-4 favourites-box">
        <h2 class="text-sm lg:text-lg font-semibold text-white">Favourites ({{localFavourites.length}})</h2>
        <ul class="flex flex-wrap">
          <li v-if="localFavourites.length > 3" class="w-full text-center">
            <button @click="showFavourites = true" class="bg-gray-700 text-white px-4 py-2 rounded">
              Show Favourites
            </button>
          </li>
          <li v-else v-for="(localFavourite, index) in localFavourites" :key="index" class="relative text-white lg:border border-white-100 w-24">
            <img v-if="localFavourite.image_name" :src="`http://127.0.0.1:8000/storage/food-images/${localFavourite.image_name}.jpg`" @click="showTitle(index)" :class="{'new-favourite': newFavouriteIndex === index}" class="h-16 w-16 mx-auto mt-4 cursor-pointer" />
            <div v-if="showTitleIndex === index" class="absolute bottom-20 left-4 bg-gray-700 text-white p-2 rounded-md z-100" style="min-width: 200px">
              <button @click="deleteFromFavourites(index)" class="text-white px-2 rounded absolute top-3 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" width="16" height="16" viewBox="0 0 456 511.82"><path fill="#FD3B3B"/></svg>
              </button>
              <span>{{ localFavourite.title }}</span>
            </div>
          </li>
        </ul>
        <transition name="modal">
          <div v-if="showFavourites" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg relative">
              <button @click="showFavourites = false" class="absolute top-2 right-2 text-white">
                &times;
              </button>
              <ul class="flex flex-wrap">
                <li v-for="(localFavourite, index) in localFavourites" :key="index" class="relative text-white lg:border border-white-100 w-24">
                  <img v-if="localFavourite.img" :src="`http://127.0.0.1:8000/storage/food-images/${localFavourite.img}.jpg`" @click="showTitle(index)" :class="{'new-favourite': newFavouriteIndex === index}" class="h-16 w-16 mx-auto lg:mt-4 cursor-pointer" />
                  <div v-if="showTitleIndex === index" class="absolute bottom-20 left-4 bg-gray-700 text-white p-2 rounded-md z-100" style="min-width: 175px; min-height:80px">
                    <button @click="deleteFromFavourites(index)" class="text-white px-2 rounded absolute top-3 right-2">
                      <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" width="16" height="16" viewBox="0 0 456 511.82"><path fill="#FD3B3B" d="M48.42 140.13h361.99c17.36 0 29.82 9.78 28.08 28.17l-30.73 317.1c-1.23 13.36-8.99 26.42-25.3 26.42H76.34c-13.63-.73-23.74-9.75-25.09-24.14L20.79 168.99c-1.74-18.38 9.75-28.86 27.63-28.86zM24.49 38.15h136.47V28.1c0-15.94 10.2-28.1 27.02-28.1h81.28c17.3 0 27.65 11.77 27.65 28.01v10.14h138.66c.57 0 1.11.07 1.68.13 10.23.93 18.15 9.02 18.69 19.22.03.79.06 1.39.06 2.17v42.76c0 5.99-4.73 10.89-10.62 11.19-.54 0-1.09.03-1.63.03H11.22c-5.92 0-10.77-4.6-11.19-10.38 0-.72-.03-1.47-.03-2.23v-39.5c0-10.93 4.21-20.71 16.82-23.02 2.53-.45 5.09-.37 7.67-.37zm83.78 208.38c-.51-10.17 8.21-18.83 19.53-19.31 11.31-.49 20.94 7.4 21.45 17.57l8.7 160.62c.51 10.18-8.22 18.84-19.53 19.32-11.32.48-20.94-7.4-21.46-17.57l-8.69-160.63zm201.7-1.74c.51-10.17 10.14-18.06 21.45-17.57 11.32.48 20.04 9.14 19.53 19.31l-8.66 160.63c-.52 10.17-10.14 18.05-21.46 17.57-11.31-.48-20.04-9.14-19.53-19.32l8.67-160.62zm-102.94.87c0-10.23 9.23-18.53 20.58-18.53 11.34 0 20.58 8.3 20.58 18.53v160.63c0 10.23-9.24 18.53-20.58 18.53-11.35 0-20.58-8.3-20.58-18.53V245.66z"/></svg>
                    </button>
                    <span>{{ localFavourite.title }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <transition name="move">
      <img v-if="movingImage" :src="movingImage" :style="movingImageStyle" class="moving-image" />
    </transition>
  </div>
</template>


<script>
import CompareFavourites from './CompareFavourites.vue';
import axios from 'axios';

export default {
  props: ['favourites'],
  data() {
    return {
      selectedCategory: 'all',
      meals: [],
      blocklist: [],
      loading: false,
      loadingIndex: null,
      selectionCount: {},
      localFavourites: [...this.favourites],
      mealCounter: 25,
      comparingFavourites: false,
      showTitleIndex: null,
      showFavourites: false,
      newFavouriteIndex: null,
      movingImage: null,
      movingImageStyle: {},
      displayedMeals: [],
    };
  },
  components: {
    CompareFavourites,
  },
  methods: {
    async updateCategory() {
      await this.getMeals();
    },

    emitCompareFavourites() {
      this.$emit('compare', this.localFavourites);
    },
    async getMeals() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/recipe');

        this.meals = response.data;

        const meal1 = await this.getMeal(this.meals, this.blocklist, this.selectedCategory);
        const meal2 = await this.getMeal(this.meals, this.blocklist, this.selectedCategory, meal1.title);

        this.displayedMeals = [meal1, meal2];
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    },
    async getMeal(meals, blocklist, category, excludedMeal = null) {
      let meal;
      do {
        if (!Array.isArray(meals) || this.mealCounter === 0) {
          this.compareFavourites();
          return;
        }
        meal = meals.pop();
      } while (
        blocklist.includes(meal.title) ||
        (category === 'Dessert' && meal.category !== 'Dessert') ||
        (category !== 'Dessert' && meal.category === 'Dessert') ||
        (excludedMeal && meal.title === excludedMeal)
      );

      return meal;
    },

    async chooseMeal(chosenIndex) {
      if (this.mealCounter === 1) {
        this.compareFavourites();
        this.resetMealCounter();
      }
      const otherIndex = chosenIndex === 0 ? 1 : 0;
      this.loading = true;
      this.loadingIndex = otherIndex;

      const chosenMeal = this.displayedMeals[chosenIndex];

      // Update the selection count for the chosen meal
      if (!this.selectionCount[chosenMeal.title]) {
        this.selectionCount[chosenMeal.title] = 0;
      }
      this.selectionCount[chosenMeal.title] += 1;

      // Add to favourites if chosen 3 times in a row
      if (this.selectionCount[chosenMeal.title] === 3) {
        this.addToFavourites(chosenMeal);
        this.selectionCount[chosenMeal.title] = 0; // Reset the count

        const newMeal = await this.getMeal(this.meals, this.blocklist, this.selectedCategory);

        this.displayedMeals[chosenIndex] = newMeal;  // Update displayedMeals instead of meals
      } else {
        this.blocklist.push(chosenMeal.title);

        const newMeal = await this.getMeal(this.meals, this.blocklist, this.selectedCategory);

        // Update the meals array, replacing the unchosen meal with a new meal
        this.displayedMeals[otherIndex] = newMeal;
      }

      this.loading = false;
      this.loadingIndex = null;
      this.mealCounter -= 1;
    },

    addToFavourites(chosenMeal) {
      this.localFavourites.push(chosenMeal);
      this.newFavouriteIndex = this.localFavourites.length - 1; // Set the new favourite index

      // Create moving image element
      this.movingImage = `http://127.0.0.1:8000/storage/food-images/${chosenMeal.image_name}.jpg`;
      this.$nextTick(() => {
        const mealBox = this.$el.querySelector('.meal-box');
        const favouritesBox = this.$el.querySelector('.favourites-box');

        const mealBoxRect = mealBox.getBoundingClientRect();
        const favouritesBoxRect = favouritesBox.getBoundingClientRect();

        const x = favouritesBoxRect.left - mealBoxRect.left;
        const y = favouritesBoxRect.top - mealBoxRect.top;

        this.movingImageStyle = {
          '--x': `${x}px`,
          '--y': `${y}px`,
          left: `${mealBoxRect.left}px`,
          top: `${mealBoxRect.top}px`,
          width: `${mealBoxRect.width}px`,
          height: `${mealBoxRect.height}px`,
        };

        setTimeout(() => {
          this.movingImage = null; // Remove the moving image after animation
          this.newFavouriteIndex = null; // Remove the animation class after animation duration
        }, 1000);
      });
    },

    compareFavourites() {
      this.comparingFavourites = true;
    },

    resetMealCounter() {
      this.mealCounter = 25;
    },

    showTitle(index) {
      this.showTitleIndex = this.showTitleIndex === index ? null : index;
    },

    deleteFromFavourites(index) {
      this.localFavourites.splice(index, 1);
      if (this.showTitleIndex === index) {
        this.showTitleIndex = null;
      }
    },
  },
  created() {
    this.getMeals();
  }
};
</script>



<style scoped>
@keyframes scaleDown {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.new-favourite {
  animation: scaleDown 1s forwards;
}

@keyframes smoke {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
}

.smoke {
  animation: smoke 1s forwards;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.meal-enter-active {
  animation: scaleIn 1s forwards;
}

.meal-leave-active {
  animation: smoke 1s forwards;
}

.meal-enter {
  transform: scale(0);
  opacity: 0;
}

.meal-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes moveToBox {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(var(--x), var(--y)) scale(0.25);
  }
}

.moving-image {
  position: absolute;
  animation: moveToBox 1s forwards;
  z-index: 1000;
}
</style>
