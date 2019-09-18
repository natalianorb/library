<template>
  <div v-if="volume.volumeInfo" class="volume-card" @click="$emit('click')">
    <div class="volume-card__left">
      <img
        v-if="volume.volumeInfo.imageLinks"
        :src="volume.volumeInfo.imageLinks.thumbnail"
        :alt="volume.volumeInfo.title"
        class="volume-card__img"
      >
      <img
        v-else
        src="../assets/images/no-cover.svg"
        :alt="volume.volumeInfo.title"
        class="volume-card__img"
      >
    </div>
    <div class="volume-card__right">
      <div class="volume-card__rate">
        <Rating :rating="volume.volumeInfo.averageRating"/>
      </div>
      <div class="volume-card__title">
        {{ volume.volumeInfo.title }}
      </div>
      <div :class="['volume-card__description', { 'empty': !volume.volumeInfo.description }]">
        {{ volume.volumeInfo.description ? volume.volumeInfo.description : 'Нет описания' }}
      </div>
    </div>

  </div>
</template>

<script>
import Rating from '@/components/Rating.vue';

export default {
  name: 'VolumeCard',
  components: { Rating },
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
    &__right {
      overflow: hidden;
    }
    &__rate {
      margin-bottom: 6px;
    }
    &__title {
      margin-bottom: 6px;
      font-weight: 500;
      font-size: 17px;
      line-height: 24px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      &.empty {
        color: #4c4c4c;
      }
    }
  }
</style>
