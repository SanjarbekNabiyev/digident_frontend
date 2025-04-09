import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const chekData = ref([])
  const birthdayData = ref([]);
  const showNavbar = ref(true);

  return { chekData, birthdayData, showNavbar }
})
