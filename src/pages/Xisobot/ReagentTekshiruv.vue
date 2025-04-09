<template>
    <div class="wrap">
        <h2>{{ $t('tek') }}</h2>
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
            <n-form-item :label="t('tek')">
                <n-select 
                    v-model:value="inspectionId" 
                    :options="inspectionList" 
                    size="large" 
                    :placeholder="t('tek')" 
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
        </div>
        <div class="wrap_table">
            <table class="table">
                <thead style="color: #007fbb; background: #E9ECEF;">
                    <tr style="height: 40px !important; line-height: 40px">
                        <th style="width: 100px !important">№</th>
                        <th>{{ $t('ins_name') }}</th>
                        <th>{{ $t('name') }}</th>
                        <th>{{ $t('count') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in list" :key="index">
                        <td style="width: 100px !important">{{ index + 1 }}</td>
                        <td>{{ item.inspection_name }}</td>
                        <td>{{ item.place }}</td>
                        <td>{{ item.count }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
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
const inspectionId = ref(null)
const inspectionList = ref([])

const getAllShifokor = () => {
    axios.get('/inspection/all')
    .then(function (res) {
        inspectionList.value = res.data
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
const showInfo = () => {
    let data = {
        datetime: range.value,
        inspectionId: inspectionId.value,
    }
    if(range.value){
        axios.post('/report/reagent-tekshiruv', data)
        .then(function (res) {
            if(res.data){
                list.value = res.data
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