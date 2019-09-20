import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectedBook: null,
    userId: 0,
    favourites: [],
  },
  getters: {
    isSelectedInFavourites(state) {
      if (!state.selectedBook || !state.favourites.length) {
        return false;
      }
      return state.favourites.some(i => i.id === state.selectedBook.id);
    },
  },
  mutations: {
    setSelectedBook(state, payload) {
      state.selectedBook = payload;
    },
    setUserId(state, payload) {
      state.userId = payload;
    },
    setFavourites(state, payload) {
      state.favourites = payload;
    },
    addFavourite(state, payload) {
      state.favourites.push(payload);
    },
    removeFavourite(state, payload) {
      const index = state.favourites.findIndex(i => i.id === payload.id);

      if (index > -1) {
        state.favourites.splice(index, 1);
      }
    },
  },
  actions: {
    loadAndSetSelectedBook({ commit }, volume) {
      if (!volume || !volume.selfLink) {
        return Promise.reject();
      }
      return axios.get(volume.selfLink)
        .then(({ data }) => commit('setSelectedBook', data));
    },
    addToFavourites({ commit }, volume) {
      const gapi = window.gapi || null;

      if (!gapi || !volume.id) {
        return Promise.reject();
      }
      return gapi.client.request({
        method: 'POST',
        path: '/books/v1/mylibrary/bookshelves/0/addVolume',
        params: {
          volumeId: volume.id,
        },
      })
        .then((res) => {
          commit('addFavourite', volume);
          return res;
        });
    },
    removeFromFavourites({ commit }, volume) {
      const gapi = window.gapi || null;

      if (!gapi || !volume.id) {
        return Promise.reject();
      }
      return gapi.client.request({
        method: 'POST',
        path: '/books/v1/mylibrary/bookshelves/0/removeVolume',
        params: {
          volumeId: volume.id,
        },
      })
        .then((res) => {
          commit('removeFavourite', volume);
          return res;
        });
    },
    loadFavorites({ commit }) {
      const gapi = window.gapi || null;
      const { GOOGLE_O_AUTH_SCOPE } = window;

      if (!gapi) {
        return Promise.reject();
      }

      return gapi.client.request({
        method: 'GET',
        path: '/books/v1/mylibrary/bookshelves/0/volumes',
        scope: GOOGLE_O_AUTH_SCOPE,
      })
        .then(({ result }) => {
          const { items = [] } = result;
          commit('setFavourites', items);
          return true;
        });
    },
  },
});
