import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import MainLayout from '../views/MainLayout.vue';

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
        path: '/sign-in',
        name: 'SignIn',
        component: () => import('@/views/SignIn.vue'),
        meta: { requiresAuth: false },
        children: [
          {
            path: 'factor-one',
            component: () => import('@/views/SignIn.vue')
          },
          {
            path: 'factor-two',
            component: () => import('@/views/SignIn.vue')
          }
        ]
      },
      {
        path: '/sign-up',
        name: 'SignUp',
        component: () => import('@/views/SignUp.vue'),
        meta: { requiresAuth: false }
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
        path: 'favourites',
        component: () => import('@/views/Favourites.vue')
      },
      {
        path: 'buy-options',
        component: () => import('@/views/BuyOptions.vue')
      },
      {
        path: 'restaurant-chooser/:mode',
        component: () => import('@/views/RestaurantChooser.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Add navigation guard
router.beforeEach((to, from, next) => {
  next();
});

export default router;
