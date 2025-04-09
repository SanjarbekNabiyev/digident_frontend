<template>
    <div class="wrap">
        <h2>{{ $t('reagent_report') }}</h2>
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
                    :options="productArray" 
                    size="large" 
                    :placeholder="t('maxsulot')" 
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
        <div class="wrap_table">
            <table id="table">
                <thead class="thead-light" style="background: #E9ECEF;">
                    <tr style="color: #007fbb;">
                        <th rowspan="2" style="width: 2%;">#</th>
                        <th rowspan="2" style="width: 25%;">{{ $t('data') }}</th>
                        <th colspan="2">{{ $t('start_discount')  }}</th>
                        <th colspan="2">{{ $t("kirim") }}</th>
                        <th colspan="2">{{ $t("chiqim") }}</th>
                        <th colspan="2">{{ $t('end_discount') }}</th>
                    </tr>
                    <tr style="color: #007fbb;">
                        <th>{{ $t("count") }}</th>
                        <th>{{ $t("summa") }}</th>
                        <th>{{ $t("count") }}</th>
                        <th>{{ $t("summa") }}</th>
                        <th>{{ $t("count") }}</th>
                        <th>{{ $t("summa") }}</th>
                        <th>{{ $t("count") }}</th>
                        <th>{{ $t("summa") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="tr_row" v-for="(item, index) in list" :key="index" @click="openSverka(item.product_id)">
                        <td>{{ index+1 }}</td>
                        <td>{{ item.product_name || "Topilmadi"}}</td>
                        <td style="background: #D9E8EA;">{{ useSummaFormat(item.begin_count) || 0 }}</td>
                        <td style="background: #D9E8EA;">{{ useSummaFormat(item.begin_summa) || 0 }}</td>
                        <td>{{ useSummaFormat(item.kirim_count) || 0 }}</td>
                        <td>{{ useSummaFormat(item.kirim_summa) || 0 }}</td>
                        <td>{{ useSummaFormat(item.chiqim_count) || 0 }}</td>
                        <td>{{ useSummaFormat(item.chiqim_summa) || 0 }}</td>
                        <td style="background: #D9E8EA;">{{ useSummaFormat(item.end_count) || 0 }}</td>
                        <td style="background: #D9E8EA;">{{ useSummaFormat(item.end_summa) || 0 }}</td>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import { Eye } from "@vicons/ionicons5"
import { useSummaFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const router = useRouter()
const range = ref(null)
const productId = ref(null)
const productArray = ref([])
const list = ref([])

const getAllProduct = () => {
    axios.get('/product/all')
    .then(function (res) {
        productArray.value = res.data
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
        productId: productId.value,
    }
    if(range.value){
        axios.post('/report/reagent-xisobot', data)
        .then(function (res) {
            list.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }else{
        message.error(t('error_message'))
    }
}

const openSverka = (e) => {
    localStorage.setItem('reagent_range_time', JSON.stringify(range.value))
    const rout = router.resolve({
      path: "/reagent_sverka", query: { reagent_id: e }
    });
    window.open(rout.href, "_blank");
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
    new Date() + "Reagent_xisobot.xlsx"
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
    getAllProduct()
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