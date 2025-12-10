import { createRouter, createWebHistory } from 'vue-router'

import Home from "../pages/Home.vue";
import Signup from '../pages/Auth/Signup.vue';
import Main from '../pages/Main/Main.vue';
import License from '../pages/Auth/License.vue';
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
import RecommendErList from '../pages/Main/HospitalList/RecommendErList.vue';
import ERList from '../pages/Main/HospitalList/ERList.vue';
import LogOut from '../pages/Auth/LogOut.vue';



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
        { path: 'findauth', name: 'findauth', component: FindAuth},
        { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotAuthenticated },
        { path: 'logout', name: 'logout', component: LogOut },
    ]
    },
    
    // 메인기능
    {
      path: '/main/',
      component: MainLayout,
      children: [
        { path: '', name: 'main', component: Main, meta: {requiresAuth: true} },
        { path: 'license', name: 'license', component: License},
        { path: 'findlocations', name: 'findlocations', component: FindLocation},
        { path: 'generalfindmap', name: 'generalfindmap', component: GeneralFindMap},
        { path: 'generalsymptoms', name: 'generalsymptoms', component: GeneralSymptoms},
        { path: 'recommenderlist', name: 'recommenderlist', component: RecommendErList},
        { path: 'erlist', name: 'erlist', component: ERList},
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

const authPages = ['home', 'signup']
if (token && authPages.includes(to.name)) {
  return next({ name: 'main' })
}
  
  next() // 통과
})

export default router