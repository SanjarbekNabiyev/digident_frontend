<template>
    <div class="card">
        <div class="card_item">
            <n-tabs type="card" animated>
                <n-tab-pane name="katta" :tab="t('big_person')">
                    <div class="wrap">
                        <div class="wrap_item">
                            <div style="display: flex; align-items: center;">
                                <div class="teeth" v-for="(item, index) in teethTopList" :key="index">
                                    <div class="teeth_item">
                                        <n-checkbox v-model:checked="item.check" size="large" class="check" @update:checked="(e) => chooseTooth(e, item)"
                                            style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                            <div style="height: 75px; width: 45px;" v-html="item.name"></div>
                                            <span>{{ item.number }}</span>
                                        </n-checkbox>
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; border-top: 1px dashed #b9b9b9">
                                <div class="teeth" v-for="(item, index) in teethBottomList" :key="index">
                                    <div class="teeth_item">
                                        <n-checkbox v-model:checked="item.check" size="large" class="check" @update:checked="(e) => chooseTooth(e, item)"
                                            style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                            <div style="height: 75px; width: 45px;" v-html="item.name"></div>
                                            <span>{{ item.number }}</span>
                                        </n-checkbox>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </n-tab-pane>
                <n-tab-pane name="bola" :tab="t('children')">
                    <div class="wrap">
                        <div class="wrap_item">
                            <div style="display: flex; align-items: center;">
                                <div class="teeth" v-for="(item, index) in teethChildTopList" :key="index">
                                    <div class="teeth_item">
                                        <n-checkbox size="large" v-model:checked="item.check" class="check" @update:checked="(e) => chooseTooth(e, item)"
                                            style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                            <div style="height: 75px; width: 50px;" v-html="item.name"></div>
                                            <span>{{ item.number }}</span>
                                        </n-checkbox>
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; border-top: 1px dashed #b9b9b9">
                                <div class="teeth" v-for="(item, index) in teethChildBottomList" :key="index">
                                    <div class="teeth_item">
                                        <n-checkbox size="large" v-model:checked="item.check" class="check" @update:checked="(e) => chooseTooth(e, item)"
                                            style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                            <div style="height: 75px; width: 50px;" v-html="item.name"></div>
                                            <span>{{ item.number }}</span>
                                        </n-checkbox>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </n-tab-pane>
            </n-tabs>
        </div>
        <div class="card_item" id="tekshiruvlar">
            <n-tabs type="card" v-model:value="tekShiruvDefaultValue" size="medium" animated>
                <n-tab-pane v-for="(item, index) in tekshiruvList" :key="index" :name="index + 1" :tab="item?.name" >
                    <div class="content">
                        <div class="content_item" v-for="(it, inx) in item.inspections" :key="inx">
                            <div style="display: flex; align-items: center; gap: 5px;">
                                <n-checkbox v-model:checked="it.check" id="check" @update:checked="(e) => chooseTekshiruv(it, e)" :disabled="doctorId ? false : true">
                                    <label for="check">{{ it.name }}</label>
                                </n-checkbox>
                            </div>
                            <span>{{ new Intl.NumberFormat().format(parseFloat(it.summa).toString()) }}</span>
                        </div>
    
                        <div class="empty" v-if="item.inspections == 0">
                            <n-icon size="30px" color="#b4b4b4">
                                <MailInboxDismiss20Filled />
                            </n-icon>
                            <span>Маълумот йўқ</span>
                        </div>
                    </div>
                </n-tab-pane>
            </n-tabs>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { MailInboxDismiss20Filled } from '@vicons/fluent'
import { I18nD, useI18n } from "vue-i18n";

const { t, locale } = useI18n()
const props = defineProps(['bemor_id'])
const emit = defineEmits(['tekshiruv'])
const dialog = useDialog()
const notification = useNotification()
const router = useRouter()
const route = useRoute()
const checked = ref(false)
const teeth_id = ref(null)
const bemor_id = ref(null)
const tekshiruvList = ref([])
const inspectionList = ref([])
const teethArray = ref([])
const doctorId = ref(null)
const doctorName = ref(null)
const doctorFoiz = ref(0)
const doctorArray = ref([])
const getLocalStorageDoctors = () => {
    let data = JSON.parse(localStorage.getItem('doctor'))
    if (data) {  
        doctorArray.value = data
        doctorId.value = doctorArray.value[doctorArray.value.length - 1].id;
        doctorName.value = doctorArray.value[doctorArray.value.length - 1].full_name;
        doctorFoiz.value = doctorArray.value[doctorArray.value.length - 1].foiz;
    } else {
        console.log('doctor');
        axios.get('/user/shifokor/' + Number(localStorage.getItem('filial_id')))
            .then(function (res) {
                if (res.data.length > 0){
                    let data = res.data
                    for (let index = 0; index < data.length; index++) {
                        if(data[index].id == Number(localStorage.getItem('user_id'))){
                            doctorArray.value = res.data
                            doctorId.value = data[index].id;
                            doctorName.value = data[index].full_name;
                            doctorFoiz.value = data[index].foiz;
                        }
                    }
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
    }
}

const chooseTooth = (e, item) => {
    if (props.bemor_id || bemor_id.value) {
        if (e == true) {
            let toothObj = {
                name: item.name,
                number: item.number,
                teeth_id: item.id
            }
            teethArray.value.push(toothObj)
        } else {
            for (let i = 0; i < teethArray.value.length; i++) {
                if (teethArray.value[i].teeth_id == item.id) {
                    teethArray.value.splice(i, 1);
                    break;
                }
            }
        }
    }else {
        notification.error({
            content: t('error'),
            meta: t('choose_bemor'),
            duration: 1500,
            keepAliveOnHover: false
        })
    }
}

// Get all teeth api
const teethTopList = ref([])
const teethBottomList = ref([])
const teethChildTopList = ref([])
const teethChildBottomList = ref([])
const tekShiruvDefaultValue = ref(1)
const getAllTeeth = () => {
    axios.get('/teeth/all')
        .then(function (res) {
            if (res.success) {
                teethTopList.value = res.data.slice(0, 16)
                teethBottomList.value = res.data.slice(16, 32)
                teethChildTopList.value = res.data.slice(32, 42)
                teethChildBottomList.value = res.data.slice(42, 52)
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

// Get all tekshiruv api
const getAllTekshiruv = () => {
    axios.get('/inspection_category/filter')
        .then(function (res) {
            if (res.success) {
                tekshiruvList.value = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const changeDoctor = (e) => {
    axios.get('/user/info/' + e)
        .then(function (res) {
            doctorName.value = res.data.full_name
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const chooseTekshiruv = (item, value) => {
    if (value) {
        let model = teethArray.value
        for (let i = 0; i < model.length; i++) {
            let data = {
                datetime: Math.floor(new Date().getTime() / 1000),
                doctor_id: doctorId.value,
                doctor_name: doctorName.value,
                bemor_id: props.bemor_id,
                teeth_id: model[i].teeth_id,
                inspection_id: item.id,
                key: Math.floor(new Date().getTime() / 1000),
                name: model[i].name,
                number: model[i].number,
                inspection_name: item.name,
                inspection_summa: Number(item.summa),
                pay_summa: 0,
                skidka_summa: 0,
                backlog_summa: Number(item.summa),
                foiz: doctorFoiz.value,
                inspection_type: item.type,
                texnik_summa: null,
            }
            emit('tekshiruv', data)
        }

        teethArray.value = []
        for (let i = 0; i < teethTopList.value.length; i++) {
            if(teethTopList.value[i].check){
                teethTopList.value[i].check = false
            }
        }
        for (let i = 0; i < teethBottomList.value.length; i++) {
            if(teethBottomList.value[i].check){
                teethBottomList.value[i].check = false
            }
        }
        for (let i = 0; i < teethChildTopList.value.length; i++) {
            if(teethChildTopList.value[i].check){
                teethChildTopList.value[i].check = false
            }
        }
        for (let i = 0; i < teethChildBottomList.value.length; i++) {
            if(teethChildBottomList.value[i].check){
                teethChildBottomList.value[i].check = false
            }
        }
        setInterval(() => {
            item.check = false   
        }, 500);
    }
}

// get One Registration
const getOneRegistration = () => {
    if (route.query.id) {
        axios.get('/registration/info/' + route.query.id)
            .then(function (res) {
                bemor_id.value = res.data.bemor_id
                inspectionList.value = res.data.registration_inspections
            })
            .catch(function (error) {
                console.log(error.message);
            })
    }
}

onMounted(() => {
    getAllTeeth()
    getAllTekshiruv()
    getOneRegistration()
    getLocalStorageDoctors()
})
</script>

<style scoped lang="scss">
.card {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    #tekshiruvlar {
        max-width: calc(100% - 5px);
        overflow: auto;
    }
    &_item{
        border-radius: 5px;
        border: 1px solid #007BFF;
        padding: 5px;
        .wrap {
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-height: 300px;
            max-height: 300px;
            overflow: auto;
        
            &_item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px 7px;
        
                .teeth {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 5px;
        
                    &_item {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        background-color: #ffffff;
                        transition: all .1s ease-in;
                        padding: 5px 0 3px;
                        cursor: pointer;
        
                        .check {
                            padding-bottom: 5px;
                        }
        
                        &:hover {
                            transform: scale(1.1);
                            z-index: 999;
                            border-radius: 5px;
                            box-shadow: 0.1em 0.1em .9em #a9a9aa;
                        }
        
                        .box {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                    }
        
                }
            }
        }
        
        .content {
            display: grid;
            align-items: center;
            grid-template-columns: 1.2fr 1fr;
            gap: 10px;
            border: 1px solid #007BFF;
            border-radius: 5px;
            padding: 5px;
            max-height: 300px;
            overflow: auto;
            &_item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                background-color: #ffffff;
                border: 1px solid #0064CF;
                border-radius: 5px;
                padding: 5px;
        
                label,
                span {
                    color: #3F51B4;
                    font-size: 17px;
                    font-weight: 600;
                }
            }
        
            .empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
        
                span {
                    font-weight: 500;
                    color: #b4b4b4;
                }
            }

            &::-webkit-scrollbar {
                display: flex;
                width: 4px;
                height: 6px;
                border-radius: 5px;
            }
            &::-webkit-scrollbar-thumb {
                background: #0073fa;
                border-radius: 5px;
            }
        }
    }
}


.btn {
    display: flex;
    justify-content: end;
}
</style>