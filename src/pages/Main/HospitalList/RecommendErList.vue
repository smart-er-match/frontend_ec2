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
    <a
      @click="userClickData(value.name)"
      :href="`https://map.naver.com/p/search/${encodeURIComponent(value.name)}?c=15.00,0,0,0,dh`"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sm text-blue-600 underline hover:text-blue-800"
    >
      병원 위치 확인
    </a>

  </div>

  <div v-if="hospital_distance.length === 0">조회된 병원이 없습니다.</div>
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
    <p class="text-gray-700 text-sm">AI 추천 점수: {{ value.score }}</p>
    <a
      @click="userClickData(value.name)"
      :href="`https://map.naver.com/p/search/${encodeURIComponent(value.name)}?c=15.00,0,0,0,dh`"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sm text-blue-600 underline hover:text-blue-800"
    >
      병원 위치 확인
    </a>
  </div>
    <div v-if="hospital_distance.length === 0">조회된 병원이 없습니다.</div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../../components/api'

const selected = ref('distance')

const raw = localStorage.getItem('hospital_data')
const hospital_data = raw ? JSON.parse(raw) : null
const user_data = JSON.parse(localStorage.getItem('user'))
const symptom = JSON.parse(localStorage.getItem('symptom'))

const hospital_distance = hospital_data?.sorted_by_distance || []
const hospital_score = hospital_data?.sorted_by_score || []

const userClickData = async (hospitalname) => {
  console.log("data 전송")
   try{
    const res = await api.post(`hospitals/userclick/`,{
      username: user_data.name,
      usersighkind: user_data.sigh_kind,
      hospitalname: hospitalname,
     })
      console.log("성공")
    }
    catch (error){
      console.error(error)
    }
}

</script>
