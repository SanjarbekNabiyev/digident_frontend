<template>
    <div class="wrap">
        <h2>{{ $t('reagent_sverka') }}</h2>
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
            <n-form-item :label="t('maxsulot')">
                <n-select 
                    v-model:value="productId" 
                    :options="productList" 
                    size="large" 
                    :placeholder="t('maxsulot')"
                    style="width: 250px;"
                    label-field="name"
                    value-field="id"
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
                        <th colspan="2" style="width: 18%;">{{ $t("kirim") }}</th>
                        <th colspan="2" style="width: 18%;">{{ $t("chiqim") }}</th>
                    </tr>
                    <tr>
                        <th style="width: 9%;">{{ $t("count") }}</th>
                        <th style="width: 9%;">{{ $t("summa") }}</th>
                        <th style="width: 9%;">{{ $t("count") }}</th>
                        <th style="width: 9%;">{{ $t("summa") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- <tr>
                        <td colspan="3">{{ ("Бошланғич қолдиқ") }}</td>
                        <td colspan="2">{{ useSummaFormat(begin.begin_count) || '0,00' }}</td>
                        <td colspan="2">{{ useSummaFormat(begin.begin_summa) || '0,00' }}</td>
                    </tr> -->
                    <tr v-for="(item, index) in list" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.doc_type }}</td>
                        <td>{{ dayJS(item.datetime * 1000).format('YYYY-MM-DD')+' / '+ dayJS(item.datetime * 1000).format("HH:mm") }}</td>
                        <td>{{ useSummaFormat(item.kirim_count) || '0,00' }}</td>
                        <td>{{ useSummaFormat(item.kirim_summa) || '0,00' }}</td>
                        <td>{{ useSummaFormat(item.chiqim_count) || '0,00' }}</td>
                        <td>{{ useSummaFormat(item.chiqim_summa) || '0,00' }}</td>
                    </tr>
                </tbody>
                <tbody style="background: #E9ECEF;color: #007fbb;">
                    <tr style="position: sticky; bottom: 34px; z-index: 1;">
                        <td colspan="3">{{ $t('total_summa') }}</td>
                        <td>{{ useSummaFormat(totalInfo.total_kirim_count) || '0,00' }}</td>
                        <td>{{ useSummaFormat(totalInfo.total_kirim_summa) || '0,00' }}</td>
                        <td>{{ useSummaFormat(totalInfo.total_chiqim_count) || '0,00' }}</td>
                        <td>{{ useSummaFormat(totalInfo.total_chiqim_summa) || '0,00' }}</td>
                    </tr>
                    <tr style="position: sticky; bottom: 1px; z-index: 1;color: #007fbb;">
                        <td colspan="3">{{ $t('end_discount') }}</td>
                        <td colspan="2">{{ $t("count") }} = {{ useSummaFormat(end.end_count) || '0,00' }}</td>
                        <td colspan="2">{{ $t("summa") }} = {{ useSummaFormat(end.end_summa) || '0,00' }}</td>
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
import { useRouter, useRoute } from "vue-router";
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
const productId = ref(null)
const productList = ref([])

const getAllShifokor = () => {
    axios.get('/product/all')
    .then(function (res) {
        productList.value = res.data
        
        if(!route.query.reagent_id){
            productId.value = res.data[0].id
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

const list = ref([])
const begin = ref(0)
const end = ref(0)
const totalInfo = {
    total_kirim_count: 0,
    total_kirim_summa: 0,
    total_chiqim_count: 0,
    total_chiqim_summa: 0,
}
const showInfo = () => {
    let data = {
        datetime: range.value,
        productId: productId.value,
    }
    if(range.value && productId.value){
        axios.post('/report/reagent-sverka', data)
        .then(function (res) {
            if(res.data){
                begin.value = res.data.begin
                list.value = res.data.items
                end.value = res.data.end

                totalInfo.total_kirim_count = 0
                totalInfo.total_kirim_summa = 0
                totalInfo.total_chiqim_count = 0
                totalInfo.total_chiqim_summa = 0

                for (let el of list.value) {
                    totalInfo.total_kirim_count += Number(el.kirim_count)
                    totalInfo.total_kirim_summa += Number(el.kirim_summa)
                    totalInfo.total_chiqim_count += Number(el.chiqim_count)
                    totalInfo.total_chiqim_summa += Number(el.chiqim_summa)
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

const getOneReagentSverka = () => {
    if(route.query.reagent_id){
        range.value = JSON.parse(localStorage.getItem('reagent_range_time'))
        productId.value = Number(route.query.reagent_id)
        let data = {
            datetime: range.value,
            productId: productId.value
        }
        axios.post('/report/reagent-sverka', data)
        .then(function (res) {
            if(res.data){
                begin.value = res.data.begin
                list.value = res.data.items
                end.value = res.data.end

                totalInfo.total_kirim_count = 0
                totalInfo.total_kirim_summa = 0
                totalInfo.total_chiqim_count = 0
                totalInfo.total_chiqim_summa = 0

                for (let el of list.value) {
                    totalInfo.total_kirim_count += Number(el.kirim_count)
                    totalInfo.total_kirim_summa += Number(el.kirim_summa)
                    totalInfo.total_chiqim_count += Number(el.chiqim_count)
                    totalInfo.total_chiqim_summa += Number(el.chiqim_summa)
                }
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
    new Date() + "Reagent_sverka.xlsx"
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
    getOneReagentSverka()
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