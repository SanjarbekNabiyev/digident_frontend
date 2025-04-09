<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('kassa_order') }}</span>
        </div>
        <div class="xodim_body">
            <n-form class="form" ref="formRef" :model="xodim" :rules="rules">
                <n-form-item :label="t('costType')" path="costTypes_id">
                    <n-select 
                        v-model:value="xodim.costTypes_id" 
                        :options="xarajatList" 
                        value-field="id" 
                        label-field="name" 
                        :placeholder="t('costType')" 
                        clearable
                        filterable
                        @search="searchCostTypes"
                    >
                        <template #empty>
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <n-empty :description="t('empty')"></n-empty>
                            <n-button dashed type="primary" @click="costTypesModal()" size="small">{{ $t('add_btn') }}</n-button>
                        </div>
                        </template>
                    </n-select>
                </n-form-item>
                <n-form-item :label="t('amount')" path="summa">
                    <n-input-number v-model:value="xodim.summa" clearable :show-button="false" :placeholder="t('amount')" style="width: 100%;" :parse="useParsenumber" :format="useFormatnumber"/>
                </n-form-item>
                <n-form-item :label="t('amount_paytype')" path="paytype">
                    <n-select v-model:value="xodim.paytype" :options="payTypeList" value-field="id" label-field="id" :placeholder="t('amount_paytype')" clearable/>
                </n-form-item>
                <n-form-item :label="t('cost_type')" path="user_id">
                    <n-select v-model:value="xodim.type" :options="turList" value-field="id" label-field="name" :placeholder="t('cost_type')"/>
                </n-form-item>
                <n-form-item :label="t('comment')">
                    <n-input v-model:value="xodim.coment" type="text" :placeholder="t('comment')"/>
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

    <n-modal 
        v-model:show="AddModal" 
        class="custom-card" 
        preset="card"
        style="width: max-content; min-width: 400px; background: #F4F6FD;"
        :title="t('costType')"
    >
        <div class="modal">
            <n-input v-model:value="xarajatId" type="text" placeholder="" size="large"/>
            <n-button type="primary" @click="addInfo()" :loading="loadBar">{{ $t('add_btn') }}</n-button>
        </div>
    </n-modal>
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
const props = defineProps(['kassaorderId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const formRef = ref(null)
const AddModal = ref(false)
const xarajatId = ref(null)
const loading = ref(false);
const loadBar = ref(false);

const xodim = ref({
    type: 0,
    costTypes_id: null,
    paytype: 'Нақд',
    coment: null,
    summa: 0,
    key: Math.floor(new Date().getTime() / 1000),
})

const searchCostTypes = (e) => {
    xarajatId.value = e
}

const costTypesModal = () => {
    AddModal.value = true
}
const addInfo = () => {
    loadBar.value = true;
    let data = {
        name: xarajatId.value
    }
    if(xarajatId.value){
        axios.post('/cost_type/create', data)
        .then(function (res) {
            if(res.success){
                loadBar.value = false;

                xodim.value.costTypes_id = res.data.id
                AddModal.value = false
                getAllCostTypes()
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }else{
        message.error('Маълумотлар тўлиқ киритилмаган')
    }
}

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
const turList = [
    {
        id: 1,
        name: 'Кирим'
    },
    {
        id: 0,
        name: 'Чиқим'
    },
]

const rules = {
    costTypes_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('cost_type_midd'))
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
    },
    summa: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('amount_midd'))
            }
        }
    }
}

const saveTolov = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...xodim.value }
        data['user_id'] = localStorage.getItem('user_id')
        loading.value = true;

        let method;
        if(props.kassaorderId){
            method = axios.patch('/kassa-order/update/'+props.kassaorderId, data)
        }else{
            method = axios.post('/kassa-order/create', data)
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
                xodim.value.type = 1
                xodim.value.paytype = 'Нақд'
                xodim.value.coment = null
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

// Get One Kassa Order api
const getOneKassaOrder = () => {
    if(props.kassaorderId){
        axios.get('/kassa-order/info/'+props.kassaorderId)
        .then(function (res) {
            let data = {...res.data}
            data.summa = Number(res.data.summa)
            xodim.value = data
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

// Get all Cost Types api
const xarajatList = ref([])
const getAllCostTypes = () => {
    axios.get('/cost_type/all')
    .then(function (res) {
        xarajatList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

onMounted(() => {
    getOneKassaOrder()
    getAllCostTypes()
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
.modal{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>