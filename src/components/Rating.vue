<template>
  <div class="rating">
    <div
      v-for="i in 5"
      :key="i"
      class="rating__star"
      :class="{
              gold: i <= rating,
              half: i < rating && (i + 1) > rating
            }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Rating',
  props: {
    rating: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="less" scoped>
  .rating {
    position: relative;
    z-index: 1;
    display: flex;
    &__star {
      position: relative;
      z-index: 2;
      width: 14px;
      height: 14px;
      margin: 0 1px;
      background: url('../assets/images/star.svg') center/cover no-repeat;
      &.gold {
        background: url('../assets/images/star-gold.svg') center/cover no-repeat;
      }
      &.half {
        background: url('../assets/images/half-star.svg') center/cover no-repeat;
      }
    }
  }
</style>
