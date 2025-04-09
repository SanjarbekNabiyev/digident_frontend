<template>
    <div class="wrap">
        <h2>{{ $t('texnik_report') }}</h2>
        <div class="wrap_head">
            <n-form-item :label="t('start_date')">
                <n-date-picker v-model:value="timeData.datetime1" type="date" size="large" />
            </n-form-item>
            <n-form-item :label="t('end_date')">
                <n-date-picker v-model:value="timeData.datetime2" type="date" size="large" />
            </n-form-item>
            <n-form-item :label="t('texnik')">
                <n-select 
                    :disabled="disabledSelect"
                    v-model:value="timeData.texnikId" 
                    :options="doctorArray" 
                    size="large" 
                    :placeholder="t('texnik')" 
                    style="width: 250px;"
                    label-field="fullname"
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
            <table id="table">
                <thead class="thead-light" style="background: #E9ECEF;">
                    <tr style="color: #007fbb;">
                        <th rowspan="2" style="width: 2%;">#</th>
                        <th rowspan="2" style="width: 25%;">{{ $t('name') }}</th>
                        <th colspan="2" rowspan="2">{{ $t('start_discount') }}</th>
                        <th colspan="2">{{ $t('naqd') }}</th>
                        <th colspan="2">{{ $t('plastik') }}</th>
                        <th colspan="2">{{ $t('click') }}</th>
                        <th colspan="2" rowspan="2">{{ $t('end_discount') }}</th>
                    </tr>
                    <tr style="color: #007fbb;">
                        <!-- <th style="background: #9c9c9c9c;">Хаққи</th>
                        <th style="background: #9c9c9c9c;">Қарзи</th> -->
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                        <!-- <th style="background: #9c9c9c9c;">Хаққи</th>
                        <th style="background: #9c9c9c9c;">Қарзи</th> -->
                    </tr>
                </thead>
                <!-- <tbody>
                    <tr
                    class="text-center tbody"
                    style="height: 30px !important; line-height: 40px; color: #007fbb;"
                    >
                    <th style="width: 3% !important">№</th>
                    <th style="width: 37%;">{{ ("Номи") }}</th>
                    <th style="width: 13%;">{{ ("Бошланғич сумма") }}</th>
                    <th style="width: 17%;">{{ ("Kирим") }}</th>
                    <th style="width: 17%;">{{ ("Чиқим") }}</th>
                    <th style="width: 13%;">{{ ("Якуний сумма") }}</th>
                    </tr>
                </tbody> -->
                <tbody>
                    <tr class="tr_row" v-for="(item, index) in list" :key="index" @click="openSverka(item.doctor_id)">
                        <td>{{ index+1 }}</td>
                        <td>{{ item.doctor_name || "Topilmadi"}}</td>
                        <td colspan="2" style="background: #D9E8EA;">{{ useSummaFormat(item.begin_total) || 0 }}</td>
                        <td>{{ useSummaFormat(item.kirim_naqd) || 0 }}</td>
                        <td>{{ useSummaFormat(item.chiqim_naqd) || 0 }}</td>
                        <td>{{ useSummaFormat(item.kirim_plastik) || 0 }}</td>
                        <td>{{ useSummaFormat(item.chiqim_plastik) || 0 }}</td>
                        <td>{{ useSummaFormat(item.kirim_click) || 0 }}</td>
                        <td>{{ useSummaFormat(item.chiqim_click) || 0 }}</td>
                        <td colspan="2" style="background: #D9E8EA;">{{ useSummaFormat(item.end_total) || 0 }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import { Eye } from "@vicons/ionicons5"
import { Download } from '@vicons/fa'
import { useSummaFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const router = useRouter()
const doctorArray = ref([])
const list = ref([])
const activeUser = Number(localStorage.getItem('user_role_id'))

let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
const endOfDay = new Date(currentDate);
endOfDay.setHours(23, 59, 59, 999);

const timeData = ref({
    datetime1: Math.floor(currentDate.setDate(1)),
    datetime2: Math.floor(endOfDay.getTime()),
    texnikId: null,
})

const disabledSelect = ref(false)
if (activeUser == 1 || activeUser == 2 || activeUser == 4) {
    disabledSelect.value = false
}else{
    timeData.value.texnikId = Number(localStorage.getItem('user_id'))
    disabledSelect.value = true
}

const getAllShifokor = () => {
    axios.get('/texnik/all')
    .then(function (res) {
        doctorArray.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const showInfo = () => {
    let send = { ...timeData.value }
    let endOf = new Date(send.datetime2);
    endOf.setHours(23, 59, 59, 999);
    send.datetime2 = endOf.getTime()

    axios.post('/report/texnik-xisobot', send)
    .then(function (res) {
        console.log(res.data);
        
        list.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
    // if(range.value){
    // }else{
    //     message.error(t('error_message'))
    // }
}

const openSverka = (e) => {
    // localStorage.setItem('shifokor_range_time', JSON.stringify(range.value))
    // const rout = router.resolve({
    //   path: "/shifokor_sverka", query: { shifokor_id: e }
    // });
    // window.open(rout.href, "_blank");
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
    new Date() + "sTexnik_xisobot.xlsx"
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
        gap: 20px;
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
.tr_row{
    cursor: pointer;
    transition: all 0.1s;
    &:hover{
        background-color: #c9c9c9;
    }
}
</style>