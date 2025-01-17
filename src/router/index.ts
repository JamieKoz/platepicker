import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import MainLayout from '../views/MainLayout.vue' // Rename TabsPage to MainLayout

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'home',
        component: () => import('@/views/Home.vue') // Renamed from Tab1Page
      },
      {
        path: 'meal-chooser',
        component: () => import('@/views/MealChooser.vue') // Renamed from Tab2Page
      },
      {
        path: 'list',
        component: () => import('@/views/List.vue')
      }
      // {
      //   path: 'profile',
      //   component: () => import('@/views/Profile.vue')
      // },
      // {
      //   path: 'settings',
      //   component: () => import('@/views/Settings.vue')
      // },
      // {
      //   path: 'login',
      //   component: () => import('@/views/Login.vue')
      // },
      // {
      //   path: 'register',
      //   component: () => import('@/views/Register.vue')
      // },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
