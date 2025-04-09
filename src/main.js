import './assets/style.scss';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naiveui from 'naive-ui';
import Provider from './components/Provider.vue'
import router from './router'
import dayjs from 'dayjs';
import axios from 'axios';
import mitt from 'mitt';
import { i18n } from './i18n.config';
import VueEasyLightbox from 'vue-easy-lightbox'
const emitter = mitt();
const app = createApp(Provider)
app.use(createPinia())
app.use(VueEasyLightbox)
app.provide('emitter', emitter);
import { useErrorStore } from './stores/errors';
const errorStore = useErrorStore();

let BASE_URL = import.meta.env.VITE_BASE_URL
axios.defaults.baseURL = BASE_URL
axios.interceptors.request.use(function (config) {
    config.headers['Authorization'] = `Bearer `+ localStorage.getItem('token');
    return config;
  },
  function (error) {
    return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
    return response.data;
  },
  function (error) {
    if(error.code == 'ERR_NETWORK') {
      router.push({ name: 'Login' });
      localStorage.clear();
    } else if(error.response.status == 400) {
      errorStore.error_text = error.response.data.message
    } else if(error.response.status == 401) {
      errorStore.error_text = error.response.data.message
      router.push({ name: 'Login' });
    } else if(error.response.status == 500) {
      errorStore.error_text = error.response.data.message
    } else {
      errorStore.error_text = error.message
    }
    return Promise.reject(error);
});

app.use(router)
app.use(naiveui)
app.use(i18n)
app.provide('dayJS', dayjs);
app.mount('#app')
