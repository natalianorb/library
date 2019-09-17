<template>
  <div v-if="volume.volumeInfo" class="volume-card" @click="$emit('click')">
    <div v-if="volume.volumeInfo.imageLinks" class="volume-card__left">
      <img :src="volume.volumeInfo.imageLinks.thumbnail" alt="" class="volume-card__img">
    </div>
    <div class="volume-card__right">
      <div class="volume-card__rate">
        <div class="rating">
          <div
            v-for="i in 5"
            :key="i"
            class="rating__star"
            :class="{
              gold: i <= volume.volumeInfo.averageRating,
              half: i < volume.volumeInfo.averageRating && (i + 1) > volume.volumeInfo.averageRating
            }"
          ></div>
        </div>
      </div>
      <div class="volume-card__title">
        {{ volume.volumeInfo.title }}
      </div>
      <div class="volume-card__description">
        {{ volume.volumeInfo.description }}
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'VolumeCard',
  props: {
    volume: {
      type: Object,
      default() {
        return {};
      },
    },
  },
};
</script>

<style lang="less">
  @import "../assets/styles/common";

  .volume-card {
    display: flex;
    margin-top: 5px;
    padding: 12px 0 14px;
    border-bottom: 1px solid #979797;
    &__left {
      display: none;
      min-width: 75px;
      margin-right: 16px;
      text-align: center;
      @media screen and (min-width: @laptop) {
        display: block;
      }
    }
    &__img {
      max-width: 75px;
      max-height: 100px;
    }
    &__rate {
      margin-bottom: 6px;
    }
    &__title {
      margin-bottom: 6px;
      font-weight: 500;
      font-size: 17px;
      line-height: 24px;
      color: #000000;
    }
    &__description {
      height: 68px;
      overflow: hidden;
      font-weight: normal;
      font-size: 13px;
      line-height: 17px;
      @media screen and (min-width: @laptop) {
        height: 54px;
      }
    }
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
  }
</style>
