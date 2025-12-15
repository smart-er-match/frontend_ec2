// src/stores/location.js
import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', {
  state: () => ({
    lat: null,
    lng: null,
    address: '',
    distance: 10,
  }),

  getters: {
    hasLocation: (state) => state.lat !== null && state.lng !== null,
  },

  actions: {
    setLocation({ lat, lng, address }) {
      this.lat = lat
      this.lng = lng
      if (address !== undefined) this.address = address
      this.loaded = true
    },

    setDistance(distance) {
      this.distance = distance
    },

    setAddress(address) {
      this.address = address
    },

    clear() {
      this.lat = null
      this.lng = null
      this.address = ''
      this.distance = 10
      this.loaded = false
    },
  },
})
