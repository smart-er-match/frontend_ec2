<template>
  <div class="flex w-full justify-center my-4">
    <div class="flex bg-gray-100 rounded-full p-1">
      
      <!-- 거리순 버튼 -->
      <button
        class="px-4 py-1.5 rounded-full text-sm font-semibold transition"
        :class="selected === 'distance'
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 hover:bg-gray-200'"
        @click="selected = 'distance'"
      >
        거리순
      </button>

      <!-- 정확도순 버튼 -->
      <button
        class="px-4 py-1.5 rounded-full text-sm font-semibold transition"
        :class="selected === 'score'
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 hover:bg-gray-200'"
        @click="selected = 'score'"
      >
        정확도순
      </button>

    </div>
  </div>

  <!-- 리스트 표시 -->
<div v-show="selected === 'distance'" class="mt-4">
  <h2 class="font-bold text-lg mb-2">거리순</h2>
  <div 
    v-for="value in hospital_distance" 
    :key="value.hpid" 
    class="border p-3 rounded-lg shadow-sm mb-3"
  >
    <p class="font-bold text-gray-900">{{ value.name }}</p>
    <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
    <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>
    <p class="text-gray-700 text-sm">거리 : {{ value.distance }}km</p>
  </div>
</div>

<div v-show="selected === 'score'" class="mt-4">
  <h2 class="font-bold text-lg mb-2">정확도순</h2>
  <div 
    v-for="value in hospital_score" 
    :key="value.hpid" 
    class="border p-3 rounded-lg shadow-sm mb-3"
  >
    <p class="font-bold text-gray-900">{{ value.name }}</p>
    <p class="text-gray-700 text-sm">전화번호 : {{ value.phone }}</p>
    <p class="text-gray-700 text-sm">주소 : {{ value.address }}</p>
  </div>
</div>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref('distance')

const raw = localStorage.getItem('hospital_data')
const hospital_data = raw ? JSON.parse(raw) : null

const hospital_distance = hospital_data?.sorted_by_distance || []
const hospital_score = hospital_data?.sorted_by_score || []

console.log(hospital_distance)
console.log(hospital_score)

</script>
