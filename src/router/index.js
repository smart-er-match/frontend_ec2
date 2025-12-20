import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'


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
import GoogleCallback from '../pages/Auth/Oauth/GoogleCallback.vue';
import ErDetail from '../pages/Main/HospitalList/ErDetail.vue';
import MedicalErList from '../pages/Main/HospitalList/MedicalErList.vue';




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
      
        { path: 'erlist', name: 'erlist', component: ERList, meta: {requiresAuth: true} },
        { path: 'mypage', name: 'mypage', component: Mypage},
        { path: 'erdetail/:id', name: 'erdetail', component: ErDetail, props: true,},
        { path: 'medicalerlist', name: 'medicalerlist', component: MedicalErList },
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
        path: '/auth/google/callback',
        name: 'google-callback',
        component: GoogleCallback,
      }
    ]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.hydrate() // 새로고침 대비(이미 다른 곳에서 1회 하면 제거 가능)

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'home' } // 또는 login 페이지
  }
})


export default router