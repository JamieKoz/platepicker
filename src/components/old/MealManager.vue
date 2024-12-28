<template>
  <div>
    <MealChooser v-if="!comparingFavourites" @compare="compareFavourites" :favourites="favourites" />
    <CompareFavourites v-if="comparingFavourites" :favourites="favourites" @return="returnToMealChooser" />
  </div>
</template>

<script>
import MealChooser from './MealChooser.vue';
import CompareFavourites from './CompareFavourites.vue';

export default {
  components: {
    MealChooser,
    CompareFavourites
  },
  data() {
    return {
      comparingFavourites: false,
      favourites: [],
    };
  },
  methods: {
    compareFavourites(favourites) {
      this.favourites = favourites;
      this.comparingFavourites = true;
    },
    returnToMealChooser() {
      this.favourites = [];
      this.comparingFavourites = false;
    },
    clearFavourites() {
      this.favourites = [];
    }
  }
};
</script>
