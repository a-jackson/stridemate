import { createRouter, createWebHistory } from 'vue-router';
import Activities from '../views/activities.vue';
import Details from '../views/details.vue';
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
  {
    path: '/Details/:id',
    name: 'Details',
    component: Details,
    meta: {
      hidden: true
    },
    props: true,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
