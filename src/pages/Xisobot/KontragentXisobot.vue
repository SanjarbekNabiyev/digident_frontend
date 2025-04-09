<template>
    <div class="wrap">
        <h2>{{ $t('kontragent_report') }}</h2>
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
                <thead class="thead-light" style="background: #E9ECEF;">
                    <tr style="color: #007fbb;">
                        <th rowspan="2" style="width: 3%;">#</th>
                        <th rowspan="2" style="width: 27%;">{{ $t('name') }}</th>
                        <th rowspan="2" colspan="2">{{ $t('start_discount') }}</th>
                        <th colspan="2">{{ $t('naqd') }}</th>
                        <th colspan="2">{{ $t('plastik') }}</th>
                        <th colspan="2">{{ $t('click') }}</th>
                        <th rowspan="2" colspan="2">{{ $t('end_discount') }}</th>
                    </tr>
                    <tr style="color: #007fbb;">
                        <!-- <th>{{ ("Хаққи") }}</th>
                        <th>{{ ("Қарзи") }}</th> -->
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                        <th>{{ $t("kirim") }}</th>
                        <th>{{ $t("chiqim") }}</th>
                        <!-- <th>{{ ("Хаққи") }}</th>
                        <th>{{ ("Қарзи") }}</th> -->
                    </tr>
                </thead>
                <tbody>
                    <tr class="tr_row" v-for="(item, index) in list" :key="index" @click="openSverka(item.kontragent_id)">
                        <td>{{ index+1 }}</td>
                        <td>{{ item.kontragent_name || "Topilmadi"}}</td>
                        <td colspan="2">{{ useSummaFormat(item.begin) || 0 }}</td>
                        <!-- <td>{{ useSummaFormat(item.begin_xaqqi) || 0 }}</td>
                        <td>{{ useSummaFormat(item.begin_qarz) || 0 }}</td> -->
                        <td>{{ useSummaFormat(item.naqd_xaqqi) || 0 }}</td>
                        <td>{{ useSummaFormat(item.naqd_qarzi) || 0 }}</td>
                        <td>{{ useSummaFormat(item.plastik_xaqqi) || 0 }}</td>
                        <td>{{ useSummaFormat(item.plastik_qarzi) || 0 }}</td>
                        <td>{{ useSummaFormat(item.click_xaqqi) || 0 }}</td>
                        <td>{{ useSummaFormat(item.click_qarzi) || 0 }}</td>
                        <!-- <td>{{ useSummaFormat(item.end_xaqqi) || 0 }}</td>
                        <td>{{ useSummaFormat(item.end_qarzi) || 0 }}</td> -->
                        <td colspan="2">{{ useSummaFormat(item.end) || 0 }}</td>
                    </tr>
                </tbody>
                <tbody style="background: #E9ECEF;position: sticky; bottom: 34px; z-index: 1;color: #007fbb;">
                    <tr>
                        <td>#</td>
                        <td style="width: 27%;">{{ $t('total_summa') }}</td>
                        <td colspan="2">{{ useSummaFormat(end_data.begin_total) || 0 }}</td>
                        <td colspan="2">{{ useSummaFormat(end_data.naqd_total) || 0 }}</td>
                        <td colspan="2">{{ useSummaFormat(end_data.plastik_total) || 0 }}</td>
                        <td colspan="2">{{ useSummaFormat(end_data.klik_total) || 0 }}</td>
                        <td colspan="2">{{ useSummaFormat(end_data.end_total) || 0 }}</td>
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
const list = ref([])
const end_data = ref({
    begin_total: 0,
    naqd_total: 0,
    plastik_total: 0,
    klik_total: 0,
    end_total: 0,
})

const daterange = () => {
    var currentDate = new Date();
    currentDate.setDate(1);
    range.value = [currentDate.getTime(),new Date().getTime()]
}

const showInfo = () => {
    let data = {
        datetime: range.value,
    }
    if(range.value){
        axios.post('/report/kontragent-xisobot', data)
        .then(function (res) {
            if(res.data){
                list.value = res.data
                
                end_data.value.begin_total = 0
                end_data.value.naqd_total = 0
                end_data.value.plastik_total = 0
                end_data.value.klik_total = 0
                end_data.value.end_total = 0
                for (let i = 0; i < res.data.length; i++) {
                    end_data.value.begin_total += Number(res.data[i].begin)
                    end_data.value.naqd_total += Number(res.data[i].naqd_xaqqi - res.data[i].naqd_qarzi)
                    end_data.value.plastik_total += Number(res.data[i].plastik_xaqqi - res.data[i].plastik_qarzi)
                    end_data.value.klik_total += Number(res.data[i].click_xaqqi - res.data[i].click_qarzi)
                    end_data.value.end_total += Number(res.data[i].end)
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

const openSverka = (e) => {
    localStorage.setItem('kontragent_range_time', JSON.stringify(range.value))
    const rout = router.resolve({
      path: "/kontragent_sverka", query: { kontragent_id: e }
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
    new Date() + "Kontragent_xisobot.xlsx"
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