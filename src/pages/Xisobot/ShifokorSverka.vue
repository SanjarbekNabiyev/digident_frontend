<template>
    <div class="wrap">
        <h2>{{ $t('employee_sverka') }}</h2>
        <div class="wrap_head">
            <n-form-item :label="t('start_date')">
                <n-date-picker v-model:value="timeData.datetime1" type="date" size="large" />
            </n-form-item>
            <n-form-item :label="t('end_date')">
                <n-date-picker v-model:value="timeData.datetime2" type="date" size="large" />
            </n-form-item>
            <n-form-item :label="t('xodim')">
                <n-select 
                    :disabled="disabledSelect"
                    v-model:value="timeData.doctorId" 
                    :options="doctorArray" 
                    size="large" 
                    :placeholder="t('xodim')" 
                    style="width: 250px;"
                    label-field="full_name"
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
        <div class="wrap_table">
            <table id="table" class="table">
                <thead style="height: 30px !important; line-height: 40px; color: #007fbb;background: #E9ECEF;">
                    <tr>
                        <th>№</th>
                        <th>{{ $t('name') }}</th>
                        <th>{{ $t('data') }}</th>
                        <th style="width: 17%;">{{ $t("kirim") }}</th>
                        <th style="width: 17%;">{{ $t("chiqim") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="color: #007fbb; background: #E9ECEF;">
                        <td colspan="3">{{ $t('start_discount') }}</td>
                        <td colspan="2">{{ useSummaFormat(begin.begin_price) || '0,00' }}</td>
                    </tr>
                    <tr v-for="(item, index) in list" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.place }}</td>
                        <td>{{ dayJS(item.datetime * 1000).format('YYYY-MM-DD')+' / '+ dayJS(item.datetime * 1000).format("HH:mm") }}</td>
                        <td>{{ useSummaFormat(item.kirim) || '0,00' }}</td>
                        <td>{{ useSummaFormat(item.chiqim) || '0,00' }}</td>
                    </tr>
                </tbody>
                <tbody style="position: sticky; bottom: -10px; z-index: 1;background-color: #E9ECEF; border: 1px solid #000;">
                    <tr v-if="end">
                        <td colspan="3">{{ $t('total_summa') }}</td>
                        <td>{{ useSummaFormat(end.total_kirim_price) || '0,00' }}</td>
                        <td>{{ useSummaFormat(end.total_chiqim_price) || '0,00' }}</td>
                    </tr>
                    <tr style="color: #007fbb;">
                        <td colspan="3">{{ $t('end_discount') }}</td>
                        <td colspan="2">{{ useSummaFormat(end.end_price) || '0,00' }}</td>
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
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { Download } from '@vicons/fa'
import { Eye } from "@vicons/ionicons5"
import { useSummaFormat } from '../../composible/NumberFormat';
import { useMessage, useNotification, NButton, NIcon, NText, NTag, useDialog } from 'naive-ui'
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const message = useMessage()
const dayJS = inject('dayJS')
const router = useRouter()
const route = useRoute()
const range = ref(null)
const doctorArray = ref([])
const activeUser = Number(localStorage.getItem('user_role_id'))

let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
const endOfDay = new Date(currentDate);
endOfDay.setHours(23, 59, 59, 999);

const timeData = ref({
    datetime1: Math.floor(currentDate.getTime()),
    datetime2: Math.floor(endOfDay.getTime()),
    doctorId: null,
})

const disabledSelect = ref(false)
if (activeUser == 1 || activeUser == 2 || activeUser == 4) {
    disabledSelect.value = false
}else{
    timeData.value.doctorId = Number(localStorage.getItem('user_id'))
    disabledSelect.value = true
}

const getAllShifokor = () => {
    axios.get('/user/filter')
    .then(function (res) {
        doctorArray.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const list = ref([])
const begin = ref(0)
const end = ref(0)
const showInfo = () => {
    let send = { ...timeData.value }
    let endOf = new Date(send.datetime2);
    endOf.setHours(23, 59, 59, 999);
    send.datetime2 = endOf.getTime()

    if(send.doctorId){
        axios.post('/report/doctor-sverka', send)
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

const getOneShifokorSverka = () => {
    if(route.query.shifokor_id){
        range.value = JSON.parse(localStorage.getItem('shifokor_range_time'))
        doctorId.value = Number(route.query.shifokor_id)
        let data = {
            datetime: range.value,
            doctorId: route.query.shifokor_id
        }
        axios.post('/report/doctor-sverka', data)
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
    new Date() + "shifokor_sverka.xlsx"
    );
}
const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

onMounted(() => {
    getAllShifokor()
    getOneShifokorSverka()
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
        height: calc(100vh - 230px);
        overflow: hidden;
        overflow: auto;
    }
}

.table {
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