<template>
    <div class="content">
        <div class="content_head" v-for="(item, index) in list" :key="index">
            <img :src="BASE_URL+item.image" alt="tooth" height="80px" width="80px">
            <div class="content_head_info">
                <span class="title">{{ item.name }}</span>
                <span class="phone">{{ item.phone }}</span>
            </div>
        </div>
        <div class="navbat">{{ $t('queue_chek') }}</div>
        <div v-for="(item, index) in chekList" :key="index" >
            <div  v-for="(it, ind) in item.child" :key="ind" class="content_body" style="display: flex; align-items: center; justify-content: space-between; padding: 0 10px 0 0; font-size: 16px;">
                <div  style="display: flex; flex-direction: column; gap: 5px;">
                    <!-- <span>Bemor:</span> -->
                    <span>{{ $t('doctor') }}:</span>
                    <span>{{ $t('ins_day') }}:</span>
                    <span>{{ $t('ins_time') }}:</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <!-- <span>{{ item.paytype }}</span> -->
                    <span>{{ it.xodim }}</span>
                    <span>{{ dayJS(it.inspection_time * 1000).format('YYYY-MM-DD') }}</span>
                    <span>{{ dayJS(it.inspection_time * 1000).format("HH:mm") + ' ' + $t('dan') + ' ' + dayJS(it.between_time * 1000).format("HH:mm")+ ' ' + $t('gacha') }}</span>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, watch, inject } from 'vue'
import { useEventBus } from '../../emitter';
import { useCounterStore } from '../../stores/counter';
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dayJS = inject('dayJS')
const chekList = ref([]);
const counter = useCounterStore();
chekList.value = JSON.parse(localStorage.getItem('navbatChek'))
const BASE_URL = import.meta.env.VITE_BASE_URL + '/logo/'
const list = ref([]);

const getAll = () => {
  axios.get('/setting/all')
    .then(function (res) {
        if (res.data) {
            list.value = res.data
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

onMounted(() => {
    getAll()
    setTimeout(() => {
        window.print();
        setTimeout(() => {
            window.close()
        }, 500)
    }, 500);
})
</script>

<style scoped lang="scss">
.content {
    width: 420px;
    padding: 5px;

    &_head {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;

        &_info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .title {
                font-size: 25px;
                font-weight: 700;
            }

            .phone {
                font-weight: 600;
            }
        }
    }
    .navbat{
        font-size: 22px;
        font-weight: 700;
        text-align: center;
        padding: 15px 0;
    }
    &_body{
        padding: 5px;
        border-top: 1px dashed black;
        border-bottom: 1px dashed black;
    }
}
</style>