import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'subscription-manager',
      component: require('@/components/SubscriptionManager').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
