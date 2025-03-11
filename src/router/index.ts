import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import MainLayout from '../views/layout/MainLayout.vue';

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
        path: '/sign-in',
        name: 'SignIn',
        component: () => import('@/views/auth/SignIn.vue'),
        meta: { requiresAuth: false },
        children: [
          {
            path: 'factor-one',
            component: () => import('@/views/auth/SignIn.vue')
          },
          {
            path: 'factor-two',
            component: () => import('@/views/auth/SignIn.vue')
          }
        ]
      },
      {
        path: '/sign-up',
        name: 'SignUp',
        component: () => import('@/views/auth/SignUp.vue'),
        meta: { requiresAuth: false }
      },
      // src/router/index.ts
      {
        path: '/home',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'buy-or-cook',
        component: () => import('@/views/choosers/BuyOrCookChooser.vue')
      },
      {
        path: 'meal-chooser',
        component: () => import('@/views/choosers/MealChooser.vue')
      },
      {
        path: 'list',
        component: () => import('@/views/profile/List.vue'),
      },
      {
        path: 'favourites',
        component: () => import('@/views/profile/Favourites.vue')
      },
      {
        path: 'restaurant-chooser/:mode',
        component: () => import('@/views/choosers/RestaurantChooser.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/profile/Profile.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'feedback',
        component: () => import('@/views/profile/Feedback.vue')
      },
      {
        path: 'recipes-list',
        component: () => import('@/views/admin/RecipeList.vue')
      },
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
