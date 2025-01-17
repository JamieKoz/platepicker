import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import MainLayout from '../views/MainLayout.vue'

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
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'meal-chooser',
        component: () => import('@/views/MealChooser.vue')
      },
      {
        path: 'list',
        component: () => import('@/views/List.vue')
      },
      {
        path: 'buy-options',
        component: () => import('@/views/BuyOptions.vue')
      },
      {
        path: 'restaurant-chooser/:mode',
        component: () => import('@/views/RestaurantChooser.vue')
      },
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
