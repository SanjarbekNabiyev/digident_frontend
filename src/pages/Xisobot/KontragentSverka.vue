<template>
    <div class="wrap">
        <h2>{{ $t('kontragent_sverka') }}</h2>
        <div class="wrap_head">
            <n-form-item :label="t('data')">
                <n-date-picker
                    v-model:value="range"
                    type="daterange"
                    clearable
                    :start-placeholder="t('start_date')"
                    :end-placeholder="t('end_date')"
                    size="large"
                />
            </n-form-item>
            <n-form-item :label="t('kontragent')">
                <n-select 
                    v-model:value="doctorId" 
                    :options="doctorArray" 
                    size="large" 
                    :placeholder="t('kontragent')" 
                    style="width: 250px;"
                    label-field="name"
                    value-field="id"
                    clearable
                />
            </n-form-item>
            <n-form-item label="">
                <n-button type="info" size="large" @click="showInfo">
                  <n-icon size="18"><Eye/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('show_btn') }}</span>
                </n-button>
            </n-form-item>
            <n-form-item label="">
                <n-button type="info" size="large" @click="downloadExcel">
                  <n-icon size="18"><Download/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('download') }}</span>
                </n-button>
            </n-form-item>
        </div>
        <div class="wrap_table" style="position: relative;">
            <table id="table">
                <thead style="background: #E9ECEF;">
                    <tr style="color: #007fbb;">
                        <th rowspan="2" style="width: 3%;">#</th>
                        <th rowspan="2" style="width: 10%;">{{  $t('data') }}</th>
                        <th rowspan="2" style="width: 27%;">{{  $t('comment') }}</th>
                        <th colspan="2">{{ $t('naqd') }}</th>
                        <th colspan="2">{{ $t('plastik') }}</th>
                        <th colspan="2">{{ $t('click') }}</th>
                    </tr>
                    <tr style="color: #007fbb;">
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="begin">
                        <td colspan="3">{{ $t('start_discount') }}</td>
                        <td>{{ useSummaFormat(begin.begin_naqd_kirim) }}</td>
                        <td>{{ useSummaFormat(begin.begin_naqd_chiqim) }}</td>
                        <td>{{ useSummaFormat(begin.begin_plastik_kirim) }}</td>
                        <td>{{ useSummaFormat(begin.begin_plastik_chiqim) }}</td>
                        <td>{{ useSummaFormat(begin.begin_klik_kirim) }}</td>
                        <td>{{ useSummaFormat(begin.begin_klik_chiqim) }}</td>
                    </tr>
                    <tr class="text-center" v-for="(item, index) in list" :key="index">
                        <td>{{ index+1 }}</td>
                        <td>{{ dayJS(item.datetime * 1000).format('YYYY-MM-DD')+' / '+ dayJS(item.datetime * 1000).format("HH:mm") }}</td>
                        <td>{{ item.place }}</td>
                        <td>{{ useSummaFormat(item.naqd_kirim) || 0 }}</td>
                        <td>{{ useSummaFormat(item.naqd_chiqim) || 0 }}</td>
                        <td>{{ useSummaFormat(item.plastik_kirim) || 0 }}</td>
                        <td>{{ useSummaFormat(item.plastik_chiqim) || 0 }}</td>
                        <td>{{ useSummaFormat(item.click_kirim) || 0 }}</td>
                        <td>{{ useSummaFormat(item.click_chiqim) || 0 }}</td>
                    </tr>
                    <tr v-if="end" style="color: #007fbb;">
                        <td colspan="3">{{ $t('total_summa') }}</td>
                        <td>{{ useSummaFormat(end.end_naqd_kirim) }}</td>
                        <td>{{ useSummaFormat(end.end_naqd_chiqim) }}</td>
                        <td>{{ useSummaFormat(end.end_plastik_kirim) }}</td>
                        <td>{{ useSummaFormat(end.end_plastik_chiqim) }}</td>
                        <td>{{ useSummaFormat(end.end_klik_kirim) }}</td>
                        <td>{{ useSummaFormat(end.end_klik_chiqim) }}</td>
                    </tr>
                    <tr v-if="end" style="color: #007fbb;background: #E9ECEF;">
                        <td colspan="3">{{ $t('end_discount') }}</td>
                        <td colspan="2">{{ useSummaFormat(end.end_naqd_kirim - end.end_naqd_chiqim) || 0 }}</td>
                        <!-- <td>{{ useSummaFormat() }}</td> -->
                        <td colspan="2">{{ useSummaFormat(end.end_plastik_kirim - end.end_plastik_chiqim) || 0 }}</td>
                        <!-- <td>{{ useSummaFormat() }}</td> -->
                        <td colspan="2">{{ useSummaFormat(end.end_klik_kirim - end.end_klik_chiqim) || 0 }}</td>
                        <!-- <td>{{ useSummaFormat() }}</td> -->
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Download } from '@vicons/fa'
import { ref, reactive, onMounted, inject } from 'vue'
import { useRoute } from "vue-router";
import { Eye } from "@vicons/ionicons5"
import { useSummaFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dayJS = inject('dayJS')
const route = useRoute()
const doctorId = ref(null)
const doctorArray = ref([])
const range = ref(null)
const list = ref([])
const begin = ref(null)
const end = ref(null)

const getAllkontragent = () => {
    axios.get('/kontragent/all')
    .then(function (res) {
        let data = res.data
        doctorArray.value = data
        if(!route.query.kontragent_id){
            doctorId.value = data[0].id
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const daterange = () => {
    var currentDate = new Date();
    currentDate.setDate(1);
    range.value = [currentDate.getTime(),new Date().getTime()]
}

const showInfo = () => {
    let data = {
        datetime: range.value,
        doctorId: doctorId.value
    }
    if(range.value && doctorId.value){
        axios.post('/report/kontragent-sverka', data)
        .then(function (res) {
            if(res.data){
                begin.value = res.data.begin
                list.value = res.data.items
                end.value = res.data.end
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }else{
        message.error(t('error_message'))
    }
}

const getOneKontragentSverka = () => {
    if(route.query.kontragent_id){
        range.value = JSON.parse(localStorage.getItem('kontragent_range_time'))
        doctorId.value = Number(route.query.kontragent_id)
        let data = {
            datetime: range.value,
            doctorId: route.query.kontragent_id
        }
        axios.post('/report/kontragent-sverka', data)
        .then(function (res) {
            if(res.data){
                begin.value = res.data.begin
                list.value = res.data.items
                end.value = res.data.end
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

// Download Excel
const downloadExcel = () => {
    let wb = XLSX.utils.table_to_book(document.getElementById("table")),
    wopts = {
        bookType: "xlsx",
        bookSST: false,
        type: "binary"
    };
    var wscols = [{ width: 5 },{ width: 25 },{ width: 7 },{ width: 7 },{ width: 11 },{ width: 11 },{ width: 7 },{ width: 7 },{ width: 11 },{ width: 11 },{ width: 7 },{ width: 7 },{ width: 11 },{ width: 11 }]; 
    wb.Sheets.Sheet1['!cols']=wscols;
    let wbout = XLSX.write(wb, wopts);
    FileSaver.saveAs(
    new Blob([s2ab(wbout)], {
        type: "application/octet-stream;charset=utf-8",
    }),
    new Date() + "Kontragent_sverka.xlsx"
    );
}
const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

onMounted(() => {
    daterange()
    getAllkontragent()
    getOneKontragentSverka()
})

</script>

<style scoped lang="scss">
.wrap{
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background-color: #F4F9FC;
    height: 100vh;
    &_head{
        display: flex;
        align-items: center;
        gap: 30px;
    }
    &_table{
        padding: 10px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        height: calc(100vh - 280px);
        overflow: hidden;
        overflow: auto;
    }
}

#table {
    width: 100%;
    margin: 0px 0px;
    border: none;
    border-collapse: collapse;
    border: 1px solid #acacac;
    background-color: #F4F9FC;
}

label,
td,
th,
tr {
  font-weight: 600;
  text-transform: capitalize;
  font-size: 15px;
  height: 30px !important;
  border: 1px solid #acacac;
  text-align: center;
}
</style>