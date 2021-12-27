import Vue from 'vue'
import Router from 'vue-router'
import Lottery from '@/components/Lottery'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/lottery',
      name: 'lotterybox',
      component: Lottery
    }
  ]
})
