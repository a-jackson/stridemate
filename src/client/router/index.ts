import { createRouter, createWebHistory } from 'vue-router';
import Activities from '../views/activities.vue';
import Home from '../views/home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      icon: 'home',
    },
  },
  {
    path: '/Activities',
    name: 'Activities',
    component: Activities,
    meta: {
      icon: 'running',
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
