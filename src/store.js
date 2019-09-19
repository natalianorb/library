import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectedBook: null,
  },
  mutations: {
    setSelectedBook(state, payload) {
      state.selectedBook = payload;
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
  },
});
