<template>
  <div class="book">
    <div class="book__header">
      <button type="button" class="book__back" @click="$emit('goBack')"></button>
    </div>
    <div class="book__top">
      <div class="book__cover">
        <img
          :src="imageSrc"
          :alt="volume.volumeInfo.title"
          class="book__img"
        >
      </div>
      <div class="book__content">
        <div class="book__title">
          {{ volume.volumeInfo.title }}
        </div>
        <div class="book__authors">
          <span class="book__label">Автор:</span>
          <span
            v-for="(author, i) in volume.volumeInfo.authors"
            :key="author"
          >
          <span class="book__author">{{ author }}</span>
          {{(i < (volume.volumeInfo.authors.length - 1))? ',': '' }}
      </span>
        </div>
        <div v-if="volume.volumeInfo.publishedDate" class="book__year">
          <span class="book__label">Год:</span>
          <span class="book__value">{{ volume.volumeInfo.publishedDate.substr(0, 4) }}</span>
        </div>
        <div class="book__rating">
          <Rating :rating="volume.volumeInfo.averageRating"/>
          <span class="book__label">Рейтинг:</span>
          <span class="book__value">{{ volume.volumeInfo.averageRating }}</span>
        </div>
        <div class="book__buttons">
          <!--<button v-if="starred" type="button" class="book__add-mark">В избранное</button>-->
          <button type="button" class="book__add-mark">В избранное</button>
          <button type="button" class="book__share">Поделиться</button>
        </div>
      </div>
    </div>

    <div class="book__descr">
      <div class="book__descr-title">Отрывок книги </div>
      <div class="book__descr-text">
        {{ volume.volumeInfo.description ? volume.volumeInfo.description : 'Нет описания' }}
      </div>
    </div>
  </div>
</template>

<script>
import Rating from '@/components/Rating.vue';

export default {
  name: 'Book',
  components: { Rating },
  props: {
    volume: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    imageSrc() {
      if (!this.volume || !this.volume.volumeInfo) {
        return '../assets/images/no-cover.svg';
      }
      const { imageLinks } = this.volume && this.volume.volumeInfo;

      return imageLinks.medium ? imageLinks.medium : imageLinks.thumbnail;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "../assets/styles/common";

  .book {
    position: relative;
    padding-bottom: 30px;
    font-size: 15px;
    line-height: 20px;
    @media screen and (min-width: @desktop) {
      padding: 64px 40px 40px 40px;
    }
    &__header {
      position: absolute;
    }
    &__back {
      width: 16px;
      height: 16px;
    }
    &__top {
      @media screen and (min-width: @desktop) {
        display: flex;
      }
    }
    &__cover {
      box-shadow: 0 7px 21px rgba(0, 0, 0, 0.4);
      @media screen and (min-width: @desktop) {
        width: 178px;
      }
    }
    &__img {
      display: block;
      width: 100%;
      height: auto;
    }
    &__content {
      padding: 0 16px;
    }
    &__title {
      margin-top: 24px;
      font-weight: 500;
      font-size: 19px;
      line-height: 26px;
    }
    &__authors {
      margin-top: 16px;
    }
    &__label {
      margin-right: 5px;
      color: #7D8888;
    }
    &__author {
      color: #417505;
      text-decoration: underline;
    }
    &__year {
      margin-top: 4px;
    }
    &__value {
      color: #000000;
    }
    &__rating {
      display: flex;
      margin-top: 16px;
      .book__label {
        margin-left: 12px;
      }
    }
    &__buttons {
      margin-top: 24px;
      display: flex;
    }
    &__add-mark {
      height: 20px;
      padding-left: 28px;
      font-size: 13px;
      color: #C7CAD2;
      background: url('../assets/images/heart.svg') left center no-repeat transparent;
    }
    &__share {
      margin-left: 52px;
      padding-left: 33px;
      font-size: 13px;
      color: #C7CAD2;
      background: url('../assets/images/share.svg') left center no-repeat transparent;
      @media screen and (min-width: @desktop) {
        margin-left: 27px;
      }
    }
    &__descr-title {
      margin-top: 36px;
      padding: 0 16px;
      font-weight: 500;
      font-size: 19px;
      line-height: 24px;
      color: #000000;
    }
    &__descr-text {
      margin-top: 16px;
      padding: 0 16px;
      font-size: 15px;
      color: #000000;
    }
  }
</style>
