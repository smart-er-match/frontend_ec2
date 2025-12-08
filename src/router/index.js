import { createRouter, createWebHistory } from 'vue-router'

import Home from "../pages/Home.vue";
import Signup from '../pages/Auth/Signup.vue';
import Main from '../pages/Main/Main.vue';
import License from '../pages/Auth/License.vue';
import HospitalList from '../pages/Main/HospitalList.vue';
import NaverCallback from '../pages/Auth/Oauth/NaverCallback.vue';
import KakaoCallback from '../pages/Auth/Oauth/KakaoCallback.vue';
import FindLocation from '../pages/Main/Location/FindLocation.vue';
import GeneralFindMap from '../pages/Main/Location/GeneralFindMap.vue';
import GeneralSymptoms from '../pages/Main/Symptoms/GeneralSymptoms.vue';
import ResetPassword from '../pages/Auth/Forget/ResetPassword.vue';
import NotAuthenticated from '../pages/etc/NotAuthenticated.vue';
import MainLayout from '../layouts/MainLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import Mypage from '../pages/Auth/MyPage/Mypage.vue';
import FindAuth from '../pages/Auth/Forget/FindAuth.vue';



const routes = [
    { path: '/', name: 'home', component: Home},

    // 인증 관련
    {
      path: '/auth/',
      component: AuthLayout,
      children: [
        { path: 'signup', name: 'signup', component: Signup},
        { path: 'resetpassword', name: 'resetpassword', component: ResetPassword},
        { path: 'notauthenticated', name: 'notauthenticated', component: NotAuthenticated},
        { path: 'license', name: 'license', component: License},
        { path: 'findauth', name: 'findauth', component: FindAuth},

    ]
    },
    
    // 메인기능
    {
      path: '/main/',
      component: MainLayout,
      children: [
        { path: '', name: 'main', component: Main, meta: {requiresAuth: true} },
        { path: 'findlocations', name: 'findlocations', component: FindLocation},
        { path: 'generalfindmap', name: 'generalfindmap', component: GeneralFindMap},
        { path: 'generalsymptoms', name: 'generalsymptoms', component: GeneralSymptoms},
        { path: 'hospitallist', name: 'hospitallist', component: HospitalList},
        { path: 'mypage', name: 'mypage', component: Mypage},
      ]
    },


    {
        path: '/auth/kakao/callback',
        name: 'KakaoCallback',
        component: KakaoCallback ,
        }, 
    {
        path: '/auth/naver/callback',
        name: 'NaverCallback',
        component: NaverCallback ,
        }, 
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotAuthenticated,
  },
    
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

if (to.meta.requiresAuth && !token) {
  return next({ name: 'notauthenticated' }) 
}

const authPages = ['login', 'signup']
if (token && authPages.includes(to.name)) {
  return next({ name: 'main' })
}
  
  next() // 통과
})

export default router