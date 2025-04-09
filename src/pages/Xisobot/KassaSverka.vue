<template>
    <div class="wrap">
        <h2>{{ $t('kassa_sverka') }}</h2>
        <div class="wrap_head">
            <n-form-item :label="t('start_date')">
                <n-date-picker v-model:value="timeData.datetime1" type="date" size="large" />
            </n-form-item>
            <n-form-item :label="t('end_date')">
                <n-date-picker v-model:value="timeData.datetime2" type="date" size="large" />
            </n-form-item>
            <n-form-item :label="t('filial')">
                <n-select 
                    v-model:value="timeData.filial_id" 
                    :options="filialList" 
                    size="large" 
                    :placeholder="t('filial')" 
                    style="width: 250px;"
                    label-field="name"
                    value-field="id"
                    clearable
                />
            </n-form-item>
            <n-form-item label="">
                <n-button type="info" size="large" @click="showInfo">
                    <n-icon size="18">
                        <Eye />
                    </n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('show_btn') }}</span>
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
                <thead style="position: sticky; top: -15px; z-index: 1;background-color: #E9ECEF; border: 1px solid #000; color: #007bff">
                    <tr>
                        <th rowspan="2">#</th>
                        <th rowspan="2" colspan="3">{{ $t('name') }}</th>
                        <th rowspan="2" colspan="3">{{ $t('data') }}</th>
                        <th rowspan="2" colspan="3">{{ $t('comment') }}</th>
                        <th colspan="2">{{ $t('naqd') }}</th>
                        <th colspan="2">{{ $t('plastik') }}</th>
                        <th colspan="2">{{ $t('click') }}</th>
                    </tr>
                    <tr>
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
                        <td colspan="10">{{ $t('start_discount') }}</td>
                        <td colspan="2"><span>{{ useSummaFormat(begin.begin_total_naqt) || '0,00' }}</span></td>
                        <td colspan="2"><span>{{ useSummaFormat(begin.begin_total_plastik) || '0,00' }}</span></td>
                        <td colspan="2"><span>{{ useSummaFormat(begin.begin_total_clik) || '0,00'}}</span></td>
                    </tr>
                    <tr v-for="(item, index) in list" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td colspan="3">{{ item.type }} - {{ item.place }}</td>
                        <td colspan="3">{{ dayJS(item.datetime * 1000).format('YYYY-MM-DD')+' / '+ dayJS(item.datetime * 1000).format("HH:mm") }}</td>
                        <td colspan="3">{{ item.comment }}</td>
                        <td>{{ useSummaFormat(item.kirim_naqt) }}</td>
                        <td>{{ useSummaFormat(item.Chiqim_naqt) }}</td>
                        <td>{{ useSummaFormat(item.kirim_plastik) }}</td>
                        <td>{{ useSummaFormat(item.Chiqim_plastik) }}</td>
                        <td>{{ useSummaFormat(item.kirim_klik) }}</td>
                        <td>{{ useSummaFormat(item.Chiqim_click) }}</td>
                    </tr>
                </tbody>
                <tbody style="position: sticky; bottom: -10px; z-index: 1;background-color: #E9ECEF; border: 1px solid #000;">
                    <tr>
                        <td colspan="10">{{ $t('total_summa') }}</td>
                        <td ><span>{{ useSummaFormat(Jami.naqt_kirim) || '0,00' }}</span></td>
                        <td ><span>{{ useSummaFormat(Jami.naqt_chiqim) || '0,00' }}</span></td>
                        <td ><span>{{ useSummaFormat(Jami.plas_kirim) || '0,00' }}</span></td>
                        <td ><span>{{ useSummaFormat(Jami.plas_chiqim) || '0,00' }}</span></td>
                        <td ><span>{{ useSummaFormat(Jami.click_kirim) || '0,00' }}</span></td>
                        <td ><span>{{ useSummaFormat(Jami.click_chiqim) || '0,00' }}</span></td>
                    </tr>
                    <tr v-if="thisDay" style="color: #007bff">
                        <td colspan="10">{{ $t('this_day') }}</td>
                        <td colspan="6"><span>{{ useSummaFormat(Number(thisDay.day_total)) || '0,00' }}</span></td>
                    </tr>
                    <tr v-if="end" style="color: #007bff">
                        <td colspan="10">{{ $t('end_discount') }}</td>
                        <td colspan="2"><span>{{ useSummaFormat(Number(end.end_total_naqt)) || '0,00' }}</span></td>
                        <td colspan="2"><span>{{ useSummaFormat(Number(end.end_total_plastik)) || '0,00' }}</span></td>
                        <td colspan="2"><span>{{ useSummaFormat(Number(end.end_total_clik)) || '0,00' }}</span></td>
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
const filialList = ref([])

let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
const endOfDay = new Date(currentDate);
endOfDay.setHours(23, 59, 59, 999);

const timeData = ref({
    datetime1: Math.floor(currentDate.getTime()),
    datetime2: Math.floor(endOfDay.getTime()),
    filial_id: null
})

const getAllFilial = () => {
    axios.get('/filial/all')
    .then(function (res) {
        filialList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const list = ref([])
const begin = ref(null)
const end = ref(null)
const thisDay = ref(null)
const Jami = ref({
    naqt_kirim: 0,
    naqt_chiqim: 0,
    plas_kirim: 0,
    plas_chiqim: 0,
    click_kirim: 0,
    click_chiqim: 0,
});
const showInfo = () => {
    let send = { ...timeData.value }
    let endOf = new Date(send.datetime2);
    endOf.setHours(23, 59, 59, 999);
    send.datetime2 = endOf.getTime()
    
    axios.post('/report/kassa-sverka', send)
    .then(function (res) {
        begin.value = res.data.begin
        list.value = res.data.items
        end.value = res.data.end
        thisDay.value = res.data.thisDay

        Jami.value.naqt_kirim = 0
        Jami.value.naqt_chiqim = 0
        Jami.value.plas_kirim = 0
        Jami.value.plas_chiqim = 0
        Jami.value.click_kirim = 0
        Jami.value.click_chiqim = 0
        res.data.items.forEach(el => {
            Jami.value.naqt_kirim += Number(el.kirim_naqt);
            Jami.value.naqt_chiqim += Number(el.Chiqim_naqt);
            Jami.value.plas_kirim += Number(el.kirim_plastik);
            Jami.value.plas_chiqim += Number(el.Chiqim_plastik);
            Jami.value.click_kirim += Number(el.kirim_klik);
            Jami.value.click_chiqim += Number(el.Chiqim_click);
        });
    })
    .catch(function (error) {
        console.log(error.message);
    })
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
    new Date() + "Kassa_sverka.xlsx"
    );
}
const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

onMounted(() => {
    getAllFilial()
})

</script>

<style scoped lang="scss">
.wrap {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background-color: #F4F9FC;
    height: 100vh;
    &_head {
        display: flex;
        align-items: center;
        gap: 30px;
    }

    &_table {
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
    padding: 5px;
}
</style>