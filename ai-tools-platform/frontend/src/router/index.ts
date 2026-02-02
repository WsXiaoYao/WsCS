import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/tools',
      name: 'Tools',
      component: () => import('@/views/Tools.vue')
    },
    {
      path: '/tool/:id',
      name: 'ToolDetail',
      component: () => import('@/views/ToolDetail.vue')
    },
    {
      path: '/history',
      name: 'ConversationHistory',
      component: () => import('@/views/ConversationHistory.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/About.vue')
    }
  ]
})

export default router
