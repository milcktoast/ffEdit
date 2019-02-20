import Vue from 'vue'
import Router from 'vue-router'

import MainProcessor from '@/components/MainProcessor'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-processor',
      component: MainProcessor
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
