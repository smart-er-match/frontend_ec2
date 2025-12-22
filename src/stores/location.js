// src/stores/location.js
import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', {
  state: () => ({
    lat: null,
    lng: null,
    address: '',
    distance: 10,
  }),
  persist: true,

  getters: {
    hasLocation: (state) => state.lat !== null && state.lng !== null,
  },

  actions: {
    setLocation({ lat, lng, address }) {
      this.lat = lat
      this.lng = lng
      this.address = address
    },

    setDistance(distance) {
      this.distance = distance
    },

    clear() {
      this.lat = null
      this.lng = null
      this.address = ''
      this.distance = 10
    },
  },
})
