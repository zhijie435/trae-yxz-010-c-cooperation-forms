import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import SkillApplyPage from '@/pages/SkillApplyPage.vue'
import MarketApplyPage from '@/pages/MarketApplyPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/skill',
    name: 'skill',
    component: SkillApplyPage,
  },
  {
    path: '/market',
    name: 'market',
    component: MarketApplyPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
