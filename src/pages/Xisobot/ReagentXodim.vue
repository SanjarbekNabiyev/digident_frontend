<template>
    <div class="wrap">
        <h2>{{ $t('reagent_xodim') }}</h2>
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
            <n-form-item :label="t('xodim')">
                <n-select 
                    :disabled="disabledSelect"
                    v-model:value="userId" 
                    :options="inspectionList" 
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
                <thead style="color: #007fbb;background: #E9ECEF;">
                    <tr>
                        <th rowspan="2">№</th>
                        <th rowspan="2">{{ $t('name') }}</th>
                        <th rowspan="2">{{ $t('data') }}</th>
                        <th colspan="4" rowspan="2" style="width: 20%;">{{ $t("kirim") }}</th>
                        <th colspan="4" rowspan="2" style="width: 20%;">{{ $t("chiqim") }}</th>
                        <th colspan="4" rowspan="2" style="width: 20%;">{{ $t("qoldiq") }}</th>
                    </tr>
                    <!-- <tr>
                        <th colspan="4" style="width: 10%;">{{ ("Сони") }}</th>
                        <th colspan="2" style="width: 10%;">{{ ("Сумма") }}</th>
                        <th colspan="4" style="width: 10%;">{{ ("Сони") }}</th>
                        <th colspan="2" style="width: 10%;">{{ ("Сумма") }}</th>
                        <th colspan="4" style="width: 10%;">{{ ("Сони") }}</th>
                        <th colspan="2" style="width: 10%;">{{ ("Сумма") }}</th>
                    </tr> -->
                </thead>
                <tbody>
                    <tr v-for="(item, index) in list" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.product_name }}</td>
                        <td>{{ dayJS(item.datetime * 1000).format('YYYY-MM-DD')+' / '+ dayJS(item.datetime * 1000).format("HH:mm") }}</td>
                        <td colspan="4">{{ useSummaFormat(item.kirim_count) || '0,00' }}</td>
                        <!-- <td colspan="2">{{ useSummaFormat(item.kirim_summa) || '0,00' }}</td> -->
                        <td colspan="4">{{ useSummaFormat(item.chiqim_count) || '0,00' }}</td>
                        <!-- <td colspan="2">{{ useSummaFormat(item.chiqim_summa) || '0,00' }}</td> -->
                        <td colspan="4">{{ useSummaFormat(item.end_count) || '0,00' }}</td>
                        <!-- <td colspan="2">{{ useSummaFormat(item.end_summa) || '0,00' }}</td> -->
                    </tr>
                </tbody>
                <tbody style="background: #E9ECEF;color: #007fbb;">
                    <tr style="position: sticky; bottom: 34px; z-index: 1;">
                        <td colspan="3">{{ $t('total_summa') }}</td>
                        <td colspan="4">{{ useSummaFormat(totalInfo.total_kirim_count) || '0,00' }}</td>
                        <!-- <td colspan="2">{{ useSummaFormat(totalInfo.total_kirim_summa) || '0,00' }}</td> -->
                        <td colspan="4">{{ useSummaFormat(totalInfo.total_chiqim_count) || '0,00' }}</td>
                        <!-- <td colspan="2">{{ useSummaFormat(totalInfo.total_chiqim_summa) || '0,00' }}</td> -->
                        <td colspan="4">{{ useSummaFormat(totalInfo.total_end_count) || '0,00' }}</td>
                        <!-- <td colspan="2">{{ useSummaFormat(totalInfo.total_end_summa) || '0,00' }}</td> -->
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
import { useRouter } from "vue-router";
import { Eye } from "@vicons/ionicons5"
import { useSummaFormat } from '../../composible/NumberFormat';
import { useMessage, useNotification, NButton, NIcon, NText, NTag, useDialog } from 'naive-ui'
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const message = useMessage()
const dayJS = inject('dayJS')
const router = useRouter()
const range = ref(null)
const userId = ref(null)
const inspectionList = ref([])
const activeUser = Number(localStorage.getItem('user_role_id'))
const disabledSelect = ref(false)
if (activeUser == 1 || activeUser == 2) {
    disabledSelect.value = false
}else{
    userId.value = Number(localStorage.getItem('user_id'))
    disabledSelect.value = true
}

const getAllShifokor = () => {
    axios.get('/user/all')
    .then(function (res) {
        inspectionList.value = res.data
        // userId.value = res.data[0].id
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

const list = ref([])
const totalInfo = {
    total_kirim_count: 0,
    total_kirim_summa: 0,
    total_chiqim_count: 0,
    total_chiqim_summa: 0,
    total_end_count: 0,
    total_end_summa: 0,
}
const showInfo = () => {
    let data = {
        datetime: range.value,
        userId: userId.value,
    }
    if(range.value && userId){
        axios.post('/report/reagent-xodim', data)
        .then(function (res) {
            if(res.data){
                list.value = res.data

                totalInfo.total_kirim_count = 0
                totalInfo.total_kirim_summa = 0
                totalInfo.total_chiqim_count = 0
                totalInfo.total_chiqim_summa = 0
                totalInfo.total_end_count = 0
                totalInfo.total_end_summa = 0

                for (let el of list.value) {
                    totalInfo.total_kirim_count += Number(el.kirim_count)
                    totalInfo.total_kirim_summa += Number(el.kirim_summa)
                    totalInfo.total_chiqim_count += Number(el.chiqim_count)
                    totalInfo.total_chiqim_summa += Number(el.chiqim_summa)
                    totalInfo.total_end_count += Number(el.end_count)
                    totalInfo.total_end_summa += Number(el.end_summa)
                }
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }else{
        message.error(t('error_message'))
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
    var wscols = [{ width: 5 },{ width: 25 },{ width: 7 },{ width: 11 },{ width: 11 },{ width: 11 }]; 
    wb.Sheets.Sheet1['!cols']=wscols;
    let wbout = XLSX.write(wb, wopts);
    FileSaver.saveAs(
    new Blob([s2ab(wbout)], {
        type: "application/octet-stream;charset=utf-8",
    }),
    new Date() + "Reagent_xodim_xisobot.xlsx"
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
    getAllShifokor()
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