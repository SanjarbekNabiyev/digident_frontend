<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('xodim') }}</span>
        </div>
        <div class="xodim_body">
            <n-form class="form" ref="formRef" :model="xodim" :rules="rules">
                <n-form-item :label="t('xodim_fio')" path="full_name">
                    <n-input v-model:value="xodim.full_name" type="text" :placeholder="t('xodim_fio')"/>
                </n-form-item>
                <n-form-item :label="t('password')" path="password">
                    <n-input v-model:value="xodim.password" type="password" show-password-on="mousedown" :placeholder="t('password')" :minlength="6"/>
                </n-form-item>
                <n-form-item :label="t('phone_number')" path="phone_number">
                    <n-input v-model:value="xodim.phone_number" type="text" :placeholder="t('phone_number')" @keyup="formatTelNumber()" maxlength="19"/>
                </n-form-item>
                <n-form-item :label="t('role')" path="role_id">
                    <n-select v-model:value="xodim.role_id" :options="roleList" value-field="id" label-field="name" :placeholder="t('role')" filterable clearable/>
                </n-form-item>
                <n-form-item :label="t('filial')" path="filial_id">
                    <n-select v-model:value="xodim.filial_id" :options="filialList" value-field="id" label-field="name" :placeholder="t('filial')" filterable clearable @update:value="getXona"/>
                </n-form-item>
                <!-- <n-form-item :label="t('xona')">
                    <n-select 
                        v-model:value="xodim.room_id" 
                        :options="xonaList" 
                        value-field="id" 
                        label-field="name" 
                        :placeholder="t('xona')" 
                        filterable 
                        clearable
                        @search="searchXona"
                    >
                        <template #empty>
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <n-empty :description="t('empty')"/>
                                <div style="height: 5px;"></div>
                                <n-button dashed type="primary" @click="showXonaModal" size="small">{{ $t('add_btn') }}</n-button>
                            </div>
                        </template>
                    </n-select>
                </n-form-item> -->
                <!-- <n-form-item label="Тўлов тури">
                    <n-select v-model:value="xodim.paytype" :options="patTypeList" value-field="id" label-field="name" placeholder="Тўлов тури танланг" clearable @update:value="chooseTolovTuri"/>
                </n-form-item> -->
                <!-- <n-form-item label="Кўрик нархи" v-if="xodim.role_id == 3">
                    <n-input-number v-model:value="xodim.korik_summa" type="text" placeholder="Сумма" style="width: 100%;" :show-button="false" :parse="useParsenumber" :format="useFormatnumber"/>
                </n-form-item> -->
                <n-form-item :label="t('salary') +' '+ ('Сумма')" >
                    <n-input-number v-model:value="xodim.summa" clearable :placeholder="t('salary')" :show-button="false" :parse="useParsenumber" :format="useFormatnumber" style="width: 100%;"/>
                </n-form-item>
                <n-form-item :label="t('salary') +' '+ ('%')" >
                    <n-input-number v-model:value="xodim.foiz" :show-button="false" style="width: 100%;"><template #suffix>%</template></n-input-number>
                </n-form-item>
                <!-- <n-form-item :label="t('ins_time')" v-if="xodim.role_id == 3">
                    <n-input-number v-model:value="xodim.korik_vaqti" :show-button="false" :placeholder="t('ins_time')" style="width: 100%;"/>
                </n-form-item>
                <n-form-item :label="t('work_time')" v-if="xodim.role_id == 3">
                    <div class="work_time">
                        <input type="time" v-model="xodim.work_start">
                        <input type="time" v-model="xodim.work_end">
                    </div>
                </n-form-item> -->
                <!-- <n-form-item label="Иш ҳаққи">
                    <n-input-number v-model:value="xodim.summa" clearable placeholder="Иш ҳаққи" :show-button="false" :parse="useParsenumber" :format="useFormatnumber"/>
                </n-form-item> -->
                <n-form-item :label="t('color')" path="color" v-if="xodim.role_id == 3">
                    <n-color-picker v-model:value="xodim.color" :modes="['hex']" />
                </n-form-item>
                <n-form-item :label="t('status')">
                    <n-radio-group v-model:value="xodim.status" name="radiogroup" style="display: flex; align-items: center; gap: 10px;">
                        <n-radio value="Фаол" :label="t('faol')" />
                        <n-radio value="Фаол эмас" :label="t('faolEmas')" />
                    </n-radio-group>
                </n-form-item>
            </n-form>
            <div class="btn">
                <n-button type="error" style="width: 150px;" @click="closePage">{{ $t('cencel_btn') }}</n-button>
                <n-button type="success" style="width: 150px;" @click="saveXodim" :loading="loading">{{ $t('save_btn') }}</n-button>
            </div>
        </div>
    </div>

    <n-modal 
        v-model:show="AddModal" 
        class="custom-card" 
        preset="card"
        style="width: max-content; min-width: 400px; background: #F4F6FD;"
        title="Хона қўшиш"
    >
        <div class="modal">
            <n-input v-model:value="xonaId" type="text" placeholder="" size="large"/>
            <n-button type="primary" @click="addInfo()" :loading="loadBar">Қўшиш</n-button>
        </div>
    </n-modal>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, watch, inject } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { PlusCircle } from '@vicons/fa'
import { useRouter, useRoute } from "vue-router";
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const loading = ref(false);
const loadBar = ref(false);
const dayJS = inject('dayJS')
const emit = defineEmits(['close'])
const props = defineProps(['xodimId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const xonaList = ref([])
const roleList = ref([])
const filialList = ref([])
const AddModal = ref(false)
const xonaId = ref(null)

const xodim = ref({
    full_name: null,
    password: null,
    phone_number: null,
    room_id: null,
    filial_id: null,
    role_id: null,
    korik_summa: 0,
    korik_vaqti: 15,
    work_start: null,
    work_end: null,
    paytype: 2,
    summa: 0,
    foiz: 0,
    status: 'Фаол',
    color: null
})

const patTypeList = [
    {
        id: 1,
        name: 'Фоиз'
    },
    {
        id: 2,
        name: 'Ойлик'
    }
]

const rules = {
    full_name: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('xodim_name_midd'))
            }
        }
    },
    phone_number: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('xodim_phone_midd'))
            }
        }
    },
    password: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('xodim_pass_midd'))
            }
        }
    },
    role_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('xodim_role_midd'))
            }
        }
    },
    filial_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('filial_name_midd'))
            }
        }
    },
}

const chooseTolovTuri = (e) => {
    if(e == 1){
        xodim.value.summa = 0
    }else{
        xodim.value.foiz = 0
    }
}

const showXonaModal = () => {
    AddModal.value = true;
}
const addInfo = () => {
    if(xonaId.value){
        loadBar.value = true;
        let data = { 
            name: xonaId.value,
            filial_id: xodim.value.filial_id
        }

        axios.post('/room/create', data)
        .then(function (res) {
            if(res.success){
                loadBar.value = false;
                AddModal.value = false;
                xodim.value.room_id = res.data.id
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }else{
        message.error('Маълумот киритилмаган')
    }
}
const searchXona = (e) => {
    xonaId.value = e
}

const saveXodim = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...xodim.value }
        let phoneNumber = xodim.value.phone_number.replace(/[^\d]/g,"")
        data['phone_number'] = '+'+phoneNumber
        loading.value = true;

        let method;
        if(props.xodimId){
            method = axios.patch('/user/update/'+props.xodimId, data)
        }else{
            method = axios.post('/user/create', data)
        } 
        method.then(function (res) {
            if(res.success){
                loading.value = false;

                notification.success({
                    content: 'Муаффақиятли!',
                    meta: "Ходим маълумотлари ўзгартирилди",
                    duration: 1500,
                    keepAliveOnHover: false
                })
                xodim.value.full_name = null
                xodim.value.password = null
                xodim.value.phone_number = null
                xodim.value.room_id = null
                xodim.value.role_id = null
                xodim.value.filial_id = null
                xodim.value.korik_summa = null
                xodim.value.paytype = 2
                xodim.value.summa = 0
                xodim.value.foiz = 0
                xodim.value.korik_vaqti = null
                xodim.value.work_start = null
                xodim.value.work_end = null
                xodim.value.color = null
    
                emit('close', false)
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }catch (e) {
    }
}

const closePage = () => {
    emit('close', false)
}

// Get All Roles api
const getRoles = () => {
    axios.get('/role/all')
    .then(function (res) {
        roleList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get All Filial api
const getAllFilial = () => {
    axios.get('/filial/all')
    .then(function (res) {
        if(res.data){
            // xodim.value.filial_id = res.data[0].id
            filialList.value = res.data
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get All Xona api
const getXona = (e) => {   
    xonaList.value = []
    axios.get('/room/filter/'+e)
    .then(function (res) {
        if(res.success){
            xonaList.value = res.data
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Selected One xodim
const getOne = () => {
    if(props.xodimId){
        axios.get('/user/info/' + props.xodimId)
        .then(function (res) {
            let data = { ...res.data }
            data['korik_summa'] = Number(res.data.korik_summa)
            data['summa'] = Number(res.data.summa)
            xodim.value = data
            getXona(res.data.filial_id)
            formatTelNumber()
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

// Korik vaqtini olish
const getKorikTime = () => {
    var work_start = new Date();
    var work_end = new Date();

    work_start.setHours(8);
    work_start.setMinutes(0);
    work_end.setHours(17);
    work_end.setMinutes(0);

    xodim.value.work_start = work_start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    xodim.value.work_end = work_end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
    getRoles()
    getAllFilial()
    getOne()
    getKorikTime()
})

// Tel number format
const length = ref(0)
const formatTelNumber = () => {
  if (length.value < xodim.value.phone_number) {
    let numbers = formatNumber(xodim.value.phone_number)
    xodim.value.phone_number = numbers
  }
  length.value = xodim.value.phone_number
}

const formatNumber =(value)=>{
  if(!value) return value
  const phoneNumber = value.replace(/[^\d]/g,"")
  const phoneNumberLength = phoneNumber.length
  if(phoneNumberLength < 4) return `+998${phoneNumber}`
  if(phoneNumberLength < 6){
    return  `+${phoneNumber.slice(0,3)} (${phoneNumber.slice(3,5)}`
  }
  if(phoneNumberLength < 8){
    return `+${phoneNumber.slice(0,3)} (${phoneNumber.slice(3,5)}) ${phoneNumber.slice(5)}`
  }
  if(phoneNumberLength < 10){
    return `+${phoneNumber.slice(0,3)} (${phoneNumber.slice(3,5)}) ${phoneNumber.slice(5,8)} ${phoneNumber.slice(8)}`
  }
  return `+${phoneNumber.slice(0,3)} (${phoneNumber.slice(3,5)}) ${phoneNumber.slice(5,8)} ${phoneNumber.slice(8,10)} ${phoneNumber.slice(10)}`
}
</script>

<style scoped lang="scss">
.xodim{
    margin: 10px;
    position: relative;
    &_head{
        z-index: 99;
        width: 100%;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: -15px;
        background-color: #007BFF;
        padding: 5px 10px;
        border-radius: 5px;
        span {
            font-size: 18px;
            font-weight: bold;
            color: #fff;
        }
    }
    &_body{
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 30px 10px 15px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        // height: calc(100vh - 520px);
        overflow: hidden;
        overflow: auto;
        .work_time{
            display: flex; 
            align-items: center; 
            gap: 10px;
            input{
                outline: none; 
                padding: 4px 5px;
                width: 50%;
                border: 1px solid #E0E0E6;
                border-radius: 4px;
            }
            input:hover{
                border: 1px solid #007BFF;
            }
            input:focus{
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
            }
        }
    }
}
.form{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 20px;
}
.btn{
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 10px;
    width: 100%;
}
.modal{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>