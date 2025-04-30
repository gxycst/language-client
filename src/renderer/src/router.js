import { createRouter, createWebHashHistory } from 'vue-router'
import active from './pages/active.vue'
import notActive from './pages/notActive.vue'
const routes = [
  { path: '/activated', component: active },
  { path: '/not-activated', component: notActive }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
