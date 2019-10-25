import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios';
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
import common from './util/common';
import moment from 'moment';

Vue.use(ElementUI);

Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.prototype.$moment = moment;
Vue.prototype.GLOBAL = common;

// 添加响应拦截器
axios.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    if (err.response.status == 403) {
      router.push('/login');
    } else {
      return Promise.reject(err);
    }
  });
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})
