<template>
  <div :class="['home', { 'has-selected': selectedBook, 'has-results': books.length }]">
    <div class="home__container">
      <div class="home__book-view">
        <h1 class="home__title">БИБЛИОТЕКА</h1>
        <Book
          v-if="selectedBook"
          :volume="selectedBook"
          :is-in-favourites="isSelectedInFavourites"
          @goBack="setSelectedBook(null)"
          @toggleMark="toggleMark"
          @openFav="showFavourites"
        />
      </div>
      <div class="home__search-view">
        <div v-if="books === favourites" class="home__fav">
          <button type="button" class="home__back" @click="showSearch"></button>
          <div class="home__fav-text">Избранное</div>
        </div>
        <div v-else class="home__search-panel">
          <button
            :class="{ home__starred: true, hidden: isFocused }"
            type="button"
            @click="showFavourites"
          >
            <span class="home__starred-tooltip">Избранное</span>
          </button>
          <SearchSelect
            :class="{ focused: isFocused }"
            :options="selectOptions"
            :required="false"
            v-model="searchString"
            @blur="onBlur"
            @error="error = $event"
            @focus="isFocused = true"
            @input="debouncedSuggestQuery"
            @change="onChange"
            @select="onChange($event && $event.title)"
            placeholder="Поиск"
            searching-prop="title"
          >
            <template v-slot:default="slotProps">
              <div>
                {{ slotProps.option.title }}
              </div>
            </template>
          </SearchSelect>
        </div>
        <div v-if="isMobile" class="home__results" ref="searchResults" @scroll="debouncedOnScroll">
          <VolumeCard
            v-for="volume in books"
            :key="volume.id"
            :volume="volume"
            @click="showBook(volume)"
          />
        </div>
        <div v-else class="home__results" ref="searchResults">
          <VolumeCard
            v-for="volume in books"
            :key="volume.id"
            :volume="volume"
            @click="showBook(volume)"
          />
        </div>
        <paginate
          v-show="!isMobile && books.length"
          v-model="page"
          :page-count="totalPages"
          :page-range="7"
          :click-handler="getPage"
          prev-text=""
          next-text=""
          container-class="pagination"
          page-class="pagination__page"
          prev-class="pagination__page prev"
          next-class="pagination__page next"
        >
        </paginate>
      </div>
    </div>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions,
} from 'vuex';
import axios from 'axios';
import { debounce } from 'lodash';
import Paginate from 'vuejs-paginate';
import Book from '@/components/Book.vue';
import SearchSelect from '@/components/SearchSelect.vue';
import VolumeCard from '@/components/VolumeCard.vue';

export default {
  name: 'home',
  components: {
    Book,
    SearchSelect,
    VolumeCard,
    Paginate,
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
      lastSearchedString: '',
      viewportWidth: 0,
      maxResults: 5,
      threshold: 200,
      page: 0,
      totalPages: 0,
      lastBooks: [],
    };
  },
  computed: {
    ...mapState(['selectedBook', 'userId', 'favourites']),
    ...mapGetters(['isSelectedInFavourites']),
    isMobile() {
      return document.documentElement.clientWidth < 1280;
    },
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
    this.getUserFavourites();
  },
  methods: {
    ...mapMutations(['setUserId', 'setSelectedBook']),
    ...mapActions(['loadAndSetSelectedBook', 'loadFavorites', 'addToFavourites', 'removeFromFavourites']),
    onBlur() {
      this.isFocused = false;
      this.findBooks();
    },
    onChange(val) {
      const str = (val && val.trim()) || '';
      if (!str) {
        return;
      }
      if (val !== this.searchString) {
        this.searchString = str;
        this.books = [];
        this.findBooks();
      }
    },
    onScroll() {
      if (this.$route.name === 'home' && this.isMobile && (this.books !== this.favourites)) {
        const element = this.listElement;

        if (element.scrollHeight - element.scrollTop - this.threshold <= element.clientHeight) {
          this.startIndex += this.maxResults;
          this.findBooks();
        }
      }
    },
    suggestQuery(query) {
      const str = (query && query.trim()) || '';

      this.searchString = str;
      if (!str) {
        return;
      }
      this.script = document.createElement('script');

      /* this sets the src of the script equal to the url of the data */
      this.script.src = `https://suggestqueries.google.com/complete/search?ds=bo&client=books&callback=setQueryOptions&q=${query}`;

      /* this attaches the script to the body of the page */
      document.body.appendChild(this.script);
    },
    findBooks() {
      const url = `https://www.googleapis.com/books/v1/volumes?key=AIzaSyAYqnQuRmbz4Cs5gdGpx_pr4tKd5y8WOTk&q=${
        this.searchString
      }&startIndex=${
        this.startIndex
      }&maxResults=${this.maxResults}`;

      if (!this.searchString || url === this.lastSearchParams) {
        return;
      }
      if (this.lastSearchedString !== this.searchString) {
        this.lastSearchedString = this.searchString;
        this.books = [];
      }
      this.lastSearchParams = url;
      axios
        .get(url)
        .then((res) => {
          const { data } = res;
          this.totalPages = Math.ceil(data.totalItems / this.maxResults);
          this.books.push(...data.items);
        });
    },
    getPage() {
      this.startIndex = (this.page - 1) * this.maxResults;
      this.findBooks();
    },
    showBook(volume) {
      this.loadAndSetSelectedBook(volume);
    },
    toggleMark() {
      if (this.isSelectedInFavourites) {
        this.removeFromFavourites(this.selectedBook);
      } else {
        this.addToFavourites(this.selectedBook);
      }
    },
    getUserFavourites() {
      const { gapi, GoogleAuth, GOOGLE_O_AUTH_SCOPE } = window;

      if (!gapi || !GoogleAuth) {
        setTimeout(this.getUserFavourites, 2000);
        return;
      }

      gapi.client.request({
        method: 'GET',
        path: '/books/v1/mylibrary/bookshelves',
        scope: GOOGLE_O_AUTH_SCOPE,
      })
        .then(({ result }) => {
          const { items } = result;
          const shelf = (items && items[0]) || null;

          if (shelf) {
            const userId = (shelf.selfLink && shelf.selfLink.split('/')[6]) || 0;
            this.setUserId(userId);
          }
          return true;
        })
        .catch(({ result }) => {
          console.error(result && result.error);
        })
        .then(this.loadFavorites)
        .catch((res) => {
          console.error(res);
        });
    },
    showFavourites() {
      if (this.isMobile) {
        this.setSelectedBook(null);
        this.lastBooks = this.books;
      }
      this.books = this.favourites;
    },
    showSearch() {
      this.books = this.lastBooks;
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
  &.has-results {
    .home__search-view {
      background: #fff;
    }
    .home__title {
      @media screen and (max-width: @desktop - 1px) {
        display: none;
      }
    }
  }
  &.has-selected {
    .home__title {
      display: none;
    }
    .home__book-view {
      @media screen and (min-width: @desktop) {
        background: #F3F3F3;
      }
    }
    .home__search-view  {
      @media screen and (max-width: @desktop - 1px) {
        display: none;
      }
    }
  }

  &__container {
    @media screen and (min-width: @laptop) {
      max-width: 650px;
      margin: 0 auto;
    }
    @media screen and (min-width: @desktop) {
      max-width: 100%;
      display: flex;
      align-items: stretch;
    }
  }

  &__book-view {
    @media screen and (min-width: @desktop) {
      min-width: 54%;
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
    position: relative;
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
  }

  &__fav {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    padding-left: 20px;
    background: #F3F3F3;
  }

  &__back {
    width: 24px;
    height: 24px;
    background: url('../assets/images/back-black.svg') center no-repeat transparent;
  }

  &__fav-text {
    padding-left: 12px;
    font-weight: 500;
    font-size: 19px;
    color: #000000;
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
    position: sticky;
    top: 68px;
    max-height: 90vh;
    overflow-y: auto;
    margin-top: 18px;
    @media screen and (min-width: @desktop) {
      position: static;
      max-height: calc(100vh - 310px);
      margin: 34px 0 60px;
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
