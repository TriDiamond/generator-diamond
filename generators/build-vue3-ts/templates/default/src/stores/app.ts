import { defineStore } from 'pinia'

const state = () => ({})

const getters = {}

const actions = {}

export const useAppStore = defineStore({
  // id is the name of the store
  // it is used in devtools and allows restoring state
  id: 'app',
  state,
  getters,
  actions
})
