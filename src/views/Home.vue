<template>
  <div class="home">
    <div class="home__container">
      <div class="home__book-view">
        <h1 class="home__title">БИБЛИОТЕКА</h1>
      </div>
      <div :class="['home__search-view', { 'has-results': books.length }]">
        <div class="home__search-panel">
          <button :class="{ home__starred: true, hidden: isFocused }" type="button">
            <span class="home__starred-tooltip">Избранное</span>
          </button>
          <SearchSelect
            :class="{ focused: isFocused }"
            :options="selectOptions"
            :required="false"
            @blur="isFocused = false"
            @error="error = $event"
            @focus="isFocused = true"
            @input="debouncedSuggestQuery"
            @change="onChange"
            @select="onSelect"
            placeholder="Поиск"
            searching-prop="title"
            v-model="searchString"
          >
            <template v-slot:default="slotProps">
              <div>
                {{ slotProps.option.title }}
              </div>
            </template>
          </SearchSelect>
        </div>
        <div class="home__results" ref="searchResults">
          <VolumeCard v-for="volume in books" :key="volume.id" :volume="volume" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { debounce } from 'lodash';
import SearchSelect from '@/components/SearchSelect.vue';
import VolumeCard from '@/components/VolumeCard.vue';

export default {
  name: 'home',
  components: {
    SearchSelect,
    VolumeCard,
  },
  data() {
    return {
      searchString: '',
      error: '',
      selectOptions: [],
      books: [],
      script: null,
      isFocused: false,
      startIndex: 0,
      listElement: null,
      lastSearchParams: '',
      viewportWidth: 0,
    };
  },
  created() {
    window.setQueryOptions = (res) => {
      this.selectOptions = res && res[1].map(item => ({ title: item[0] }));
      if (this.script) {
        document.body.removeChild(this.script);
      }
    };

    this.debouncedSuggestQuery = debounce(this.suggestQuery, 450);
    this.debouncedOnScroll = debounce(this.onScroll, 100);
  },
  mounted() {
    this.listElement = this.$el && this.$el.querySelector('.home__results');
    this.viewportWidth = document.documentElement.clientWidth;
    if (this.viewportWidth < 1024) {
      window.addEventListener('scroll', this.debouncedOnScroll);
    }
  },
  beforeDestroy() {
    if (this.viewportWidth < 1024) {
      window.removeEventListener('scroll', this.debouncedOnScroll);
    }
  },
  methods: {
    onChange(val) {
      this.getBooks(val);
    },
    onSelect(option) {
      this.getBooks(option.title);
    },
    onScroll() {
      const viewportHeight = document.documentElement.clientHeight;
      const { bottom } = document.body.getBoundingClientRect();

      if (bottom <= 1.2 * viewportHeight) {
        this.startIndex += 4;
        this.getBooks();
      }
    },
    suggestQuery(query) {
      if (!query) {
        return;
      }
      this.script = document.createElement('script');

      /* this sets the src of the script equal to the url of the data */
      this.script.src = `https://suggestqueries.google.com/complete/search?ds=bo&client=books&callback=setQueryOptions&q=${query}`;

      /* this attaches the script to the body of the page */
      document.body.appendChild(this.script);
    },
    getBooks() {
      // const url = `https://www.googleapis.com/books/v1/volumes?q=${this.searchString}&fields=kind,items(volumeInfo/title,volumeInfo/averageRating,volumeInfo/description,volumeInfo/imageLinks)`
      const url = `https://www.googleapis.com/books/v1/volumes?q=${this.searchString}&startIndex=${
        this.startIndex
      }&maxResults=4`;

      if (!this.searchString || url === this.lastSearchParams) {
        return;
      }
      this.lastSearchParams = url;
      axios
        .get(
          `https://www.googleapis.com/books/v1/volumes?q=${this.searchString}&startIndex=${
            this.startIndex
          }&maxResults=4`,
        )
        .then(({ data }) => {
          this.books.push(...data.items);
        });
    },
  },
};
</script>

<style lang="less">
@import "../assets/styles/common";

@starred-button-height: 44px;
.bordered-shadow-box() {
  background-color: #fff;
  border: 1px solid #7d8888;
  box-shadow: 0 16px 17px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.home {
  position: relative;
  @media screen and (min-width: @laptop) {
    background-size: contain;
  }
  @media screen and (min-width: @desktop) {
    min-height: 0;
  }

  &__container {
    @media screen and (min-width: @laptop) {
      max-width: 650px;
      margin: 0 auto;
    }
    @media screen and (min-width: @desktop) {
      max-width: 100%;
      display: flex;
    }
  }

  &__book-view {
    @media screen and (min-width: @desktop) {
      min-width: 54%;
      max-height: 100vh;
      background: url('../assets/images/books.png') left top/690px 100% no-repeat #ddd;
    }
  }

  &__title {
    position: absolute;
    top: 75%;
    width: 100%;
    left: 0;
    margin: 0;
    font-weight: 900;
    font-size: 33px;
    line-height: 37px;
    text-align: center;
    color: #4B5959;
    @media screen and (min-width: @desktop) {
      width: auto;
      left: 273px;
      top: 600px;
      font-size: 59px;
    }
  }

  &__search-view {
    min-height: 100vh;
    padding: 24px 16px 16px 16px;
    background: url('../assets/images/books.png') center top/cover no-repeat #fff;
    @media screen and (min-width: @laptop) {
      padding: 64px 80px 64px 64px;
    }
    @media screen and (min-width: @desktop) {
      width: 46%;
      background: #fff;
    }
    &.has-results {
      background: #fff;
    }
  }

  &__search-panel {
    display: flex;
    width: 100%;
  }

  &__starred {
    position: relative;
    min-width: @starred-button-height;
    height: @starred-button-height;
    margin-right: 12px;
    background: url("../assets/images/heart-dark.svg") center no-repeat;
    line-height: 17px;
    text-align: center;
    .bordered-shadow-box();
    @media screen and (min-width: @laptop) {
      &:hover {
        .home__starred-tooltip {
          opacity: 1;
          visibility: visible;
        }
      }
    }
  }

  &__starred-tooltip {
    @tooltip-width: 110px;
    display: block;
    opacity: 0;
    visibility: hidden;
    position: absolute;
    width: @tooltip-width;
    left: (@starred-button-height - @tooltip-width) / 2;
    bottom: @starred-button-height + 11px;
    padding: 5px 16px 6px;
    border-radius: 4px;
    background: #4c4c4c;
    color: #fff;
    font-size: 15px;
    transition: opacity 0.3s 0.1s;
    &:after {
      position: absolute;
      top: 100%;
      left: (@tooltip-width - 16px) / 2;
      display: block;
      content: "";
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 7px 8px 0 8px;
      border-color: #4c4c4c transparent transparent transparent;
    }
  }

  &__results {
    padding-top: 18px;
    @media screen and (min-width: @desktop) {
      padding-top: 34px;
    }
  }

  .hidden {
    display: none;
  }

  .search-select {
    flex-grow: 1;

    &__input {
      .bordered-shadow-box();
    }
  }
}
</style>
