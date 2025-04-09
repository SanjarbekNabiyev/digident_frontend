<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('texnik') }}</span>
        </div>
        <div class="xodim_body">
            <n-form class="form" ref="formRef" :model="texnikList" :rules="rules">
                <n-form-item :label="t('name')" path="fullname">
                    <n-input v-model:value="texnikList.fullname" type="text" :placeholder="t('name')" clearable/>
                </n-form-item>
                <n-form-item :label="t('phone_number')" path="phone_number">
                    <n-input v-model:value="texnikList.phone_number" type="text" :placeholder="t('phone_number')" @keyup="formatTelNumber()" maxlength="19"/>
                </n-form-item>
                <!-- <n-form-item :label="t('summa')">
                    <n-input-number v-model:value="texnikList.summa" type="text" :placeholder="t('summa')" :show-button="false" :parse="useParsenumber" :format="useFormatnumber" style="width: 100%;"/>
                </n-form-item> -->
                </n-form>
                <div class="btn">
                    <n-button type="error" style="width: 150px;" @click="closePage">{{ $t('cencel_btn') }}</n-button>
                    <n-button type="success" style="width: 150px;" @click="save" :loading="loading">{{ $t('save_btn') }}</n-button>
                </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { PlusCircle } from '@vicons/fa'
import { useRouter, useRoute } from "vue-router";
import axios from 'axios';
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const emit = defineEmits(['close'])
const props = defineProps(['texnikId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false);

const texnikList = ref({
    fullname: null,
    phone_number: null,
    summa: 0,
})

const rules = {
    fullname: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('texnik_name_midd'))
            }
        }
    },
}

const save = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...texnikList.value }
        let phoneNumber = texnikList.value.phone_number.replace(/[^\d]/g,"")
        data['phone_number'] = '+'+phoneNumber
        loading.value = true;
        
        let method;
        if(props.texnikId){
            method = axios.patch('/texnik/update/'+props.texnikId, data)
        }else{
            method = axios.post('/texnik/create', data)
        }
        method.then(function (res) {
            if(res.success){
                loading.value = false;

                notification.success({
                    content: t('success'),
                    meta: t('create_doc'),
                    duration: 1500,
                    keepAliveOnHover: false
                })
                texnikList.value.name = null
                texnikList.value.phone_number = null
                texnikList.value.summa = 0
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

// Get one api
const getOneTexnik = () => {
    if(props.texnikId){
        axios.get('/texnik/info/'+props.texnikId)
        .then(function (res) {
            if(res.success){
                let data = { ...res.data }
                data['summa'] = Number(res.data.summa)
                texnikList.value = data
                formatTelNumber()
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

onMounted(() => {
    getOneTexnik()
})

// Tel number format
const length = ref(0)
const formatTelNumber = () => {
  if (length.value < texnikList.value.phone_number) {
    let numbers = formatNumber(texnikList.value.phone_number)
    texnikList.value.phone_number = numbers
  }
  length.value = texnikList.value.phone_number
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
        padding: 30px 10px 10px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        height: calc(100vh - 990px);
        min-height: 200px;
        overflow: hidden;
        overflow: auto;
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
}
</style>