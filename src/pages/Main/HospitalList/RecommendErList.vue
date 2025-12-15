<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      <!-- 왼쪽: 지도 -->
      <div >
        <general-find-map />
      </div>

      <!-- 오른쪽: 정렬 버튼 + 리스트 -->
      <div class="min-w-0">
        <!-- 정렬 토글 -->
        <div class="flex justify-center lg:justify-start">
          <div class="inline-flex bg-gray-100 rounded-full p-1">
            <button
              class="px-4 py-1.5 rounded-full text-sm font-semibold transition"
              :class="selected === 'distance'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-200'"
              @click="selected = 'distance'"
            >
              거리순
            </button>

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

        <!-- 리스트 영역 (원하면 스크롤) -->
        <div class="mt-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
          
          <!-- 거리순 -->
          <div v-show="selected === 'distance'">

            <div
              v-for="value in hospital_distance"
              :key="value.hpid"
              class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
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

            <div v-if="hospital_distance.length === 0" class="text-gray-500">
              조회된 병원이 없습니다.
            </div>
          </div>

          <!-- 정확도순 -->
          <div v-show="selected === 'score'">
            <h2 class="font-bold text-lg text-red-500 mb-2">AI 분석 기반 추천 응급실입니다.</h2>

            <div
              v-for="value in hospital_score"
              :key="value.hpid"
              class="border p-3 rounded-lg shadow-sm mb-3 bg-white"
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

            <div v-if="hospital_score.length === 0" class="text-gray-500">
              조회된 병원이 없습니다.
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import api from '../../../components/api'
import GeneralFindMap from '../Location/GeneralFindMap.vue'

const selected = ref('distance')

const raw = localStorage.getItem('hospital_data')
const hospital_data = raw ? JSON.parse(raw) : null
const user_data = JSON.parse(localStorage.getItem('user'))
const symptom = JSON.parse(localStorage.getItem('symptom'))

const hospital_distance = hospital_data?.sorted_by_distance || []
const hospital_score = hospital_data?.sorted_by_score || []

const userClickData = async (hospitalname) => {
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
