<template>
    <div class="wraps">
        <h2>{{ $t('doctor_ins') }}</h2>
        <div class="wraps_head">
            <n-form-item :label="t('start_date')">
                <n-date-picker v-model:value="sendData.datetime1" type="date" size="large" />
            </n-form-item>
            <n-form-item :label="t('end_date')">
                <n-date-picker v-model:value="sendData.datetime2" type="date" size="large" />
            </n-form-item>
            <n-form-item :label="t('doctor')">
                <n-select
                    :disabled="disabledSelect"
                    v-model:value="sendData.doctorId" 
                    :options="doctorList" 
                    value-field="id" 
                    label-field="full_name" 
                    :placeholder="t('doctor')"
                    style="width: 250px"
                    size="large"
                    filterable 
                    clearable
                />
            </n-form-item>
            <!-- <n-form-item :label="t('tek')">
                <n-select
                    v-model:value="sendData.instpectionId" 
                    :options="inspectionList" 
                    value-field="id" 
                    label-field="name" 
                    :placeholder="t('tek')"
                    style="width: 250px"
                    size="large"
                    filterable 
                    clearable
                />
            </n-form-item> -->
            <n-form-item label="">
                <n-button type="info" size="large" style="width: 150px" @click="showInfo">
                  <n-icon size="18"><Eye/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('show_btn') }}</span>
                </n-button>
            </n-form-item>
        </div>
        <div class="wraps_table">
            <table id="table">
                <tbody>
                    <tr
                    class="text-center tbody"
                    style="height: 40px !important; line-height: 40px; position: sticky; top: -15px; z-index: 1;background-color: #E9ECEF; border: 1px solid #000; color: #007bff">
                    <th style="width: 100px !important">№</th>
                    <th>{{ $t('tek') }}</th>
                    <!-- <th>{{ $t('name') }}</th> -->
                    <th>{{ $t('count') }}</th>
                    </tr>
                </tbody>
                <tbody>
                    <tr v-for="(item, index) in korikList" :key="index" class="text-center" style="height: 40px !important; line-height: 40px; text-align: center;" v-if="korikList.length">
                    <td scope="row" style="width: 100px !important">{{ index+1 }}</td>
                    <td>{{ item.inspection_name }}</td>
                    <!-- <td>{{ item.place }}</td> -->
                    <td>{{ item.count }}</td>
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
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { useSummaFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const message = useMessage()
const router = useRouter()
const range = ref(null)
const doctorList = ref([])
const inspectionList = ref([])
const korikList = ref([])
let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
const endOfDay = new Date(currentDate);
endOfDay.setHours(23, 59, 59, 999);

let sendData = ref({
    datetime1: Math.floor(currentDate.getTime()),
    datetime2: Math.floor(endOfDay.getTime()),
    doctorId: null,
    // instpectionId: null
})

const activeUser = Number(localStorage.getItem('user_role_id'))
const disabledSelect = ref(false)
if (activeUser == 1 || activeUser == 2) {
    disabledSelect.value = false
}else{
    sendData.value.doctorId = Number(localStorage.getItem('user_id'))
    disabledSelect.value = true
}

const getAllShifokor = () => {
    axios.get('/user/shifokor')
    .then(function (res) {
        doctorList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}
const getAllIns = () => {
    axios.get('/inspection/all')
    .then(function (res) {
        inspectionList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const showInfo = () => {
    let send = { ...sendData.value }
    let endOf = new Date(send.datetime2);
    endOf.setHours(23, 59, 59, 999);
    send.datetime2 = endOf.getTime()
    
    if(send.doctorId){
        axios.post('/report/korik-soni', send)
        .then(function (res) {
            if(res.data){
                korikList.value = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }else{
        message.error(t('error_message'))
    }
}

onMounted(() => {
    getAllShifokor()
    getAllIns()
})

</script>

<style scoped lang="scss">
.wraps{
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
}
</style>