<template>
    <div class="container">
        <div class="card">
            <div class="card_item card_item_1">
                <span class="title">{{ bemorCount }}</span>
                <span class="sub_title">{{ $t('patient_count') }}</span>
            </div>
            <div class="card_item card_item_2">
                <span class="title">{{ xodimCount }}</span>
                <span class="sub_title">{{ $t('employee_count') }}</span>
            </div>
            <div class="card_item card_item_3">
                <span class="title">{{ tekshiruvCount }}</span>
                <span class="sub_title">{{ $t('tek_count') }}</span>
            </div>
            <div class="card_item card_item_4">
                <span class="title">{{ filialCount }}</span>
                <span class="sub_title">{{ $t('branch_count') }}</span>
            </div>
            <div class="card_item card_item_5">
                <span class="title">{{ roomCount }}</span>
                <span class="sub_title">{{ $t('room_count') }}</span>
            </div>
        </div>
        <div class="chart">
            <span class="big_title">{{ $t('ten_day') }}</span>
            <ChartVue ></ChartVue>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { Eye } from "@vicons/ionicons5"
import { SearchRound } from '@vicons/material'
import { useRouter } from "vue-router";
import ChartVue from "./Chart.vue"
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()

const dayJS = inject('dayJS')
const router = useRouter()
const message = useMessage()
const bemorCount = ref(null)
const xodimCount = ref(null)
const tekshiruvCount = ref(null)
const roomCount = ref(null)
const filialCount = ref(null)

// Get all Bemor api
// const getBemor = () => {
//     axios.get('/bemor/all')
//         .then(function (res) {
//             if (res.data) {
//                 bemorCount.value = res.data.length
//             }
//         })
//         .catch(function (error) {
//             console.log(error.message);
//         })
// }
// Get all Xodim api
const getXodim = () => {
    axios.get('/registration/for_analitic')
        .then(function (res) {
            if (res.success) {
                console.log(res.data);
                
                // xodimCount.value = res.data.length
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}
// Get all Tekshiruv api
// const getTekshiruv = () => {
//     axios.get('/inspection/all')
//         .then(function (res) {
//             if (res.data) {
//                 tekshiruvCount.value = res.data.length
//             }
//         })
//         .catch(function (error) {
//             console.log(error.message);
//         })
// }
// // Get all Room api
// const getRoom = () => {
//     axios.get('/room/all')
//         .then(function (res) {
//             if (res.data) {
//                 roomCount.value = res.data.length
//             }
//         })
//         .catch(function (error) {
//             console.log(error.message);
//         })
// }
// // Get all Room api
// const getFilial = () => {
//     axios.get('/filial/all')
//         .then(function (res) {
//             if (res.data) {
//                 filialCount.value = res.data.length
//             }
//         })
//         .catch(function (error) {
//             console.log(error.message);
//         })
// }

onMounted(() => {
    // getBemor()
    getXodim()
    // getTekshiruv()
    // getRoom()
    // getFilial()
})
</script>

<style scoped lang="scss">
.container{
    display: flex;
    flex-direction: column;
    gap: 20px;
    // margin: 10px;
    // padding: 20px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    animation: showBox 0.3s ease-in-out forwards alternate;
    height: calc(100vh - 80px);
    overflow: hidden;
    overflow: auto;
}
.card{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    gap: 20px;
    &_item{
        padding: 20px 15px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 20px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        // height: 130px;
        display: flex;
        flex-direction: column;
        justify-content: end;
        cursor: pointer;
        .title{
            font-size: 35px;
            font-weight: 600;
            color: #fff;
        }
        .sub_title{
            font-size: 18px;
            font-weight: 600;
            color: #fff;
        }
        &_1{
            background: #dd0b0b;
            box-shadow: 5px 8px 10px rgba(176, 35, 25, 0.4);
            &:hover {
                background-color: #fa6666;
            }
        }
        &_2{
            background: #0b0bdd;
            box-shadow: 5px 8px 10px rgba(25, 60, 176, 0.4);
            &:hover {
                background-color: #4c4cf1;
            }
        }
        &_3{
            background: #02b902;
            box-shadow: 5px 8px 10px rgba(38, 176, 25, 0.4);
            &:hover {
                background-color: #50db50;
            }
        }
        &_4{
            background: #f7bc50;
            box-shadow: 5px 8px 10px rgba(233, 187, 101, 0.4);
            &:hover {
                background-color: #fac563;
            }
        }
        &_5{
            background: #34e5eb;
            box-shadow: 5px 8px 10px hsla(182, 82%, 56%, 0.4);
            &:hover {
                background-color: #5ff3f8;
            }
        }
    }
}
.chart{
    height: calc(100vh - 340px);
    .big_title{
        font-size: 23px;
        font-weight: 700;
    }
}
</style>