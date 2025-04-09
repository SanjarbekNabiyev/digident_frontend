<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('tek_bolim') }}</span>
        </div>
        <div class="xodim_body">
            <n-form class="form" ref="formRef" :model="inspectionCategoryList" :rules="rules">
                <n-form-item :label="t('bolim_name')" path="name">
                    <n-input v-model:value="inspectionCategoryList.name" type="text" :placeholder="t('bolim_name')" clearable/>
                </n-form-item>
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
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const emit = defineEmits(['close'])
const props = defineProps(['tekshiruBolimId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false);

const inspectionCategoryList = ref({
    name: null,
})

const rules = {
    name: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('ins_category_midd'))
            }
        }
    },
}

const save = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...inspectionCategoryList.value }
        data['filial_id'] = localStorage.getItem('user_filial')
        loading.value = true;
        
        let method;
        if(props.tekshiruBolimId){
            method = axios.patch('/inspection_category/update/'+props.tekshiruBolimId, data)
        }else{
            method = axios.post('/inspection_category/create', data)
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
                inspectionCategoryList.value.name = null
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
const getOneInspectionCategory = () => {
    if(props.tekshiruBolimId){
        axios.get('/inspection_category/info/'+props.tekshiruBolimId)
        .then(function (res) {
            inspectionCategoryList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

onMounted(() => {
    getOneInspectionCategory()
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
        padding: 30px 10px 10px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        height: calc(100vh - 820px);
        min-height: 160px;
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