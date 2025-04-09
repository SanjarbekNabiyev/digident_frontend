<script setup>
import axios from "axios"
import { watch, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useNotification, useLoadingBar } from 'naive-ui';
import { createEventBus } from './emitter'
const router = useRouter();
const route = useRoute()
createEventBus()
const loadingBar = useLoadingBar();

// Get getUseTimeApi 
const getUseTimeApi = async () => {
   const sameTime = Math.floor(new Date().getTime() / 1000)
   axios.get('/filial/get_use_time')
   .then(res => {
      if(res.data){
         if (sameTime > res.data.use_time) {
            router.push('/login')
            localStorage.clear()
         }
      }
   })
   .catch(error => {
      console.log(error.message);
   });
}

router.beforeEach(() => {
   loadingBar.start();
   getUseTimeApi()
})
router.afterEach(() => {
   loadingBar.finish();
})
</script>

<template>
   <router-view></router-view>
</template>