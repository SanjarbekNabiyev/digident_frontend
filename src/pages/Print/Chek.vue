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
        <div class="navbat">{{ $t('view_ins') }}</div>
        <div class="content_box">
            <div v-for="(item, index) in insList" :key="index" >
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 10px 0 0; font-size: 14pt; line-height: 14pt; font-weight: 600;">
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <span>{{ $t('teeth_number') }}:</span>
                        <span>{{ $t('tek') }}:</span>
                        <span>{{ $t('summa') }}:</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <span>{{ item.number }}</span>
                        <span>{{ item.inspection_name }}</span>
                        <span>{{ useSummaFormat(item.inspection_summa) || '0,00' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="navbat">{{ $t('pay_chek') }}</div>
        <div v-for="(item, index) in chekList" :key="index" class="content_body">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 10px 0 0; font-size: 14pt; line-height: 14pt; font-weight: 600;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <span>{{ $t('data') }}:</span>
                    <span>{{ $t('pay_type') }}:</span>
                    <span>{{ $t('total_price') }}:</span>
                    <span>{{ $t('total_pay') }}:</span>
                    <span>{{ $t('total_keshback') }}:</span>
                    <span>{{ $t('total_debt') }}:</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <span>{{ dayJS(item.datetime * 1000).format('YYYY-MM-DD') + ' ' + dayJS(item.datetime * 1000).format("HH:mm") }}</span>
                    <span>{{ item.paytype }}</span>
                    <span>{{ useSummaFormat(parseFloat(item.pay_summa || 0)+parseFloat(item.skidka_summa || 0)+parseFloat(item.qarzdorlik_summa || 0)) || '0,00' }}</span>
                    <span>{{ useSummaFormat(item.pay_summa) || '0,00' }}</span>
                    <span>{{ useSummaFormat(item.skidka_summa) || '0,00' }}</span>
                    <span>{{ useSummaFormat(item.qarzdorlik_summa) || '0,00' }}</span>
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
const BASE_URL = import.meta.env.VITE_BASE_URL + '/logo/'
const dayJS = inject('dayJS')
const chekList = ref([]);
const insList = ref([]);
const counter = useCounterStore()
const list = ref(null);
insList.value = JSON.parse(localStorage.getItem('inspection_Chek'))
// chekList.value = JSON.parse(localStorage.getItem('chek'))

const calcSumma = () => {
    const chek = JSON.parse(localStorage.getItem('chek')) || [];

    const groupedData = {};

    chek.forEach(item => {
        const key = `${item.datetime}_${item.paytype}`;

        if (!groupedData[key]) {
            groupedData[key] = {
                datetime: item.datetime,
                paytype: item.paytype,
                pay_summa: 0,
                skidka_summa: 0,
                qarzdorlik_summa: 0
            };
        }

        groupedData[key].pay_summa += Number(item.pay_summa) || 0;
        groupedData[key].skidka_summa += Number(item.skidka_summa) || 0;
        groupedData[key].qarzdorlik_summa += Number(item.qarzdorlik_summa) || 0;
    });

    chekList.value = Object.values(groupedData);
}

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
    calcSumma()
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
    .navbat{
        font-size: 22px;
        font-weight: 700;
        text-align: center;
        padding: 15px 0;
    }
    &_box{
        padding: 5px;
        border-top: 2px dashed black;
    }
    &_body{
        padding: 5px;
        border-top: 2px dashed black;
        border-bottom: 2px dashed black;
    }
}
</style>