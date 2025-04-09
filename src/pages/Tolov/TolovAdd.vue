<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('xodimga_tolov') }}</span>
        </div>
        <div class="xodim_body">
            <n-form class="form" ref="formRef" :model="xodim" :rules="rules">
                <n-form-item :label="t('xodim')" path="user_id">
                    <n-select v-model:value="xodim.user_id" :options="xodimList" @update:value="chooseXodim" value-field="id" label-field="full_name" :placeholder="t('xodim')" filterable clearable/>
                </n-form-item>
                <n-form-item :label="t('salary')">
                    <n-input-number v-model:value="xodim.xaqqi" readonly :show-button="false" :placeholder="t('salary')" style="width: 100%;" :parse="useParsenumber" :format="useFormatnumber"/>
                </n-form-item>
                <n-form-item :label="t('pay_type')" path="paytype">
                    <n-select v-model:value="xodim.paytype" :options="payTypeList" value-field="id" label-field="id" :placeholder="t('pay_type')" clearable/>
                </n-form-item>
                <n-form-item :label="t('summa')">
                    <n-input-number v-model:value="xodim.summa" clearable :show-button="false" :placeholder="t('summa')" style="width: 100%;" :parse="useParsenumber" :format="useFormatnumber"/>
                </n-form-item>
                <n-form-item :label="t('comment')">
                    <n-input v-model:value="xodim.izoh" type="text" :placeholder="t('comment')"/>
                </n-form-item>
                <n-form-item label="">
                    <div class="btn">
                        <n-button type="error" style="width: 150px;" @click="closePage">{{ $t('cencel_btn') }}</n-button>
                        <n-button type="success" style="width: 150px;" @click="saveTolov" :loading="loading">{{ $t('save_btn') }}</n-button>
                    </div>
                </n-form-item>
            </n-form>
        </div>
        
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { PlusCircle } from '@vicons/fa'
import { useRouter } from "vue-router";
import axios from 'axios';
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const emit = defineEmits(['close'])
const props = defineProps(['tolovId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const formRef = ref(null)
const xodimList = ref([])
const loading = ref(false);

const xodim = ref({
    user_id: null,
    paytype: 'Нақд',
    izoh: null,
    summa: 0,
    xaqqi: 0,
    key: Math.floor(new Date().getTime() / 1000),
})

const payTypeList = [
    {
        id: 'Нақд',
        name: 'Нақд'
    },
    {
        id: 'Пластик',
        name: 'Пластик'
    },
    {
        id: 'Kлик',
        name: 'Kлик'
    }
]

const rules = {
    user_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('xodim_name_midd'))
            }
        }
    },
    paytype: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('pay_type_midd'))
            }
        }
    }
}

const chooseXodim = (e) => {
    axios.get('/user/tolov/'+e)
    .then(function (res) {
        if(res.success){
            xodim.value.xaqqi = Number(res.data)
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const saveTolov = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...xodim.value }
        data['filial_id'] = localStorage.getItem('user_filial')
        loading.value = true;

        let method;
        if(props.tolovId){
            method = axios.patch('/payment/update/'+props.tolovId, data)
        }else{
            method = axios.post('/payment/create', data)
        }
        method.then(function (res) {
            if(res.success){
                loading.value = false;

                notification.success({
                    content: t('success'),
                    meta: t('save_doc'),
                    duration: 1500,
                    keepAliveOnHover: false
                })
                xodim.value.user_id = null
                xodim.value.paytype = 'Нақд'
                xodim.value.izoh = null
                xodim.value.summa = 0
    
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

// Get All Xodim api
const getXodim = () => {
    axios.get('/user/filter')
    .then(function (res) {
        if(res.success){
            xodimList.value = res.data
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get One tolov api
const getOneTolov = () => {
    if(props.tolovId){
        axios.get('/payment/info/'+props.tolovId)
        .then(function (res) {
            if(res.success){
                let data = {...res.data}
                data['summa'] = Number(res.data.summa)
    
                chooseXodim(res.data.user_id)
                xodim.value = data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

onMounted(() => {
    getXodim()
    getOneTolov()
})

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
        padding: 30px 10px 0px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        height: calc(100vh - 720px);
        min-height: 260px;
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
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 10px;
}
</style>