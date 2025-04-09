<template>
    <div class="content">
        <div class="content_head">
            <img 
                v-if="list && list.image" 
                :src="BASE_URL + list.image" 
                alt="tooth" 
                height="80px" 
                width="80px"
            >
            <div v-else>
                <span>No Image Available</span>
            </div>
            <div class="content_head_info" v-if="list">
                <span class="title">{{ list.name || 'No Name' }}</span>
                <span class="phone">{{ list.phone_number || 'No Phone' }}</span>
            </div>
        </div>
        <div class="navbat">{{ $t('doctor_chek') }}</div>
        <div v-for="(item, index) in chekList" :key="index" class="content_body">
            <div v-for="(it, ind) in item.child" :key="ind"
                style="padding: 0 10px 0 0; font-size: 14pt; line-height: 14pt; font-weight: 600;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <div style="display: flex; align-items: start; justify-content: space-between; gap: 5px;">
                        <span> №:</span>
                        <span style="width: 70%; text-align: end;">{{ it.navbat }} - {{ $t('que_chek') }}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 5px;">
                        <span>{{ $t('data') }}:</span>
                        <span>{{ dayJS(it.inspection_time * 1000).format('YYYY-MM-DD') + ' ' + dayJS(it.inspection_time * 1000).format("HH:mm") }}</span>
                    </div>
                    <div style="display: flex; align-items: start; justify-content: space-between; gap: 5px;">
                        <span>{{ $t('doctor') }}:</span>
                        <span style="width: 70%; text-align: end;">{{ it.xodim }}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 5px;">
                        <span>{{ $t('room') }}:</span>
                        <span>{{ it.room_name }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div style="display: flex; justify-content: center; padding-top: 5px;">
            <span style="font-style: italic;">{{ $t('soglik') }}</span>
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
const counter = useCounterStore()
chekList.value = JSON.parse(localStorage.getItem('DoctorChek'))
const BASE_URL = import.meta.env.VITE_BASE_URL + '/logo/'
const list = ref(null);

const getAll = () => {
    const filial_id = Number(localStorage.getItem('user_filial'))
    axios.get('/filial/info/' + filial_id)
        .then(function (res) {
            if (res.data) {
                list.value = res.data;
                setTimeout(() => {
                    window.print();
                    setTimeout(() => {
                        window.close()
                    }, 500)
                }, 3000);
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}
onMounted(() => {
    getAll()
})
</script>

<style scoped lang="scss">
.content {
    width: 420px;
    padding: 5px;
    &_head {
        display: grid;
        grid-template-columns: 100px 300px;
        align-items: center;
        gap: 20px;
        text-align: center;

        &_info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .title {
                white-space: wrap;
                text-overflow: ellipsis;
                font-size: 25px;
                font-weight: 700;
            }

            .phone {
                font-weight: 600;
            }
        }
    }

    .navbat {
        font-size: 22px;
        font-weight: 700;
        text-align: center;
        padding: 15px 0;
    }

    &_body {
        padding: 5px;
        border-top: 2px dashed black;
        border-bottom: 2px dashed black;
    }
}
</style>