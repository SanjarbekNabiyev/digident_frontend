<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('kontragent_tolov') }}</span>
        </div>
        <div class="xodim_body">
            <n-form class="form" ref="formRef" :model="xodim" :rules="rules">
                <n-form-item :label="t('kontragent_tolov')" path="kontragent_id">
                    <n-select v-model:value="xodim.kontragent_id" :options="xodimList" @update:value="chooseXodim" value-field="id" label-field="name" :placeholder="t('kontragent_tolov')" filterable clearable/>
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
                    <n-input v-model:value="xodim.comment" type="text" :placeholder="t('comment')"/>
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
const props = defineProps(['kontragentId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const formRef = ref(null)
const xodimList = ref([])
const loading = ref(false);

const xodim = ref({
    kontragent_id: null,
    paytype: 'Нақд',
    comment: null,
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
    kontragent_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('kontragent_name_midd'))
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
    axios.get('/kontragent/tolov/'+e)
    .then(function (res) {
        xodim.value.xaqqi = Number(res.data.price)
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const saveTolov = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...xodim.value }
        data['user_id'] = localStorage.getItem('user_id')
        loading.value = true;

        let method;
        if(props.kontragentId){
            method = axios.patch('/kontragent_pay/update/'+props.kontragentId, data)
        }else{
            method = axios.post('/kontragent_pay/create', data)
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
                xodim.value.kontragent_id = null
                xodim.value.paytype = 'Нақд'
                xodim.value.comment = null
                xodim.value.summa = 0
                xodim.value.xaqqi = 0

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
    axios.get('/kontragent/all')
    .then(function (res) {
        xodimList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get One tolov api
const getOneTolov = () => {
    if(props.kontragentId){
        axios.get('/kontragent_pay/info/'+props.kontragentId)
        .then(function (res) {
            let data = {...res.data}
            data['summa'] = Number(res.data.summa)

            chooseXodim(res.data.user_id)
            xodim.value = data
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