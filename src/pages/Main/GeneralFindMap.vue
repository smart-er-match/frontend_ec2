

<template>
    <router-link
      to="/main"
      class="block text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500"
    >
      뒤로가기
    </router-link>
    <h1 class="text-center text-3xl"> 병위 위치 찾기 </h1>
    <FindLocation  @updateLocation="handleLocation"/>

    <div>
      <button @click="findhospital" class=" mt-5 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500">
        증상 입력하기
      </button>
    </div>
</template>

<script setup>
import axios from 'axios';
import FindLocation from '../../components/FindLocation.vue';
import { ref } from 'vue'
import { API_BASE_URL } from '../../config';
import { useRouter } from 'vue-router';
import api from '../../components/api'

const lat = ref('')
const lng = ref('')
const address = ref('')
const distance = ref('')
const user = ref(JSON.parse(localStorage.getItem("user") || "{}"))._rawValue
const access_token = localStorage.getItem("access_token")

const handleLocation = (info) => {
  lat.value = info.lat
  lng.value = info.lng
  address.value = info.address
  distance.value = info.distance

}

const router = useRouter()

const findhospital = async () =>{

    try{
     await api.post(`hospitals/user/location/`,{
        useremail : user.email,
        sign_kind : user.sign_kind,
        latitude : lat.value,
        longitude : lng.value,
        locationstext : address.value,
        radius : distance.value
     },{
          headers: {
            Authorization: `Bearer ${access_token}`,
          },})
        router.push('/generalsymptoms')
    }
    catch (error){
        console.error(error)
    }
    }
</script>

<style scoped>

</style>