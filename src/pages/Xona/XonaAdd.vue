<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('xona') }}</span>
        </div>
        <div class="xodim_body">
            <n-form class="form" ref="formRef" :model="xona" :rules="rules">
                <n-form-item :label="t('room_number')" path="name">
                    <n-input v-model:value="xona.name" type="text" :placeholder="t('room_number')" clearable/>
                </n-form-item>
                <n-form-item :label="t('filial')" path="filial_id">
                    <n-select :disabled="props.xonaId ? true : false" v-model:value="xona.filial_id" :options="filialList" value-field="id" label-field="name" :placeholder="t('filial')" filterable clearable/>
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
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { PlusCircle } from '@vicons/fa'
import { useRouter, useRoute } from "vue-router";
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const emit = defineEmits(['close'])
const props = defineProps(['xonaId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false);
const filialList = ref([])

const xona = ref({
    name: null,
    filial_id: null
})

const rules = {
    name: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('room_number_midd'))
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

const save = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...xona.value }
        loading.value = true;
        
        let method
        if(props.xonaId){
            method = axios.patch('/room/update/'+props.xonaId, data)
        }else{
            method = axios.post('/room/create', data)
        }
        method.then(function (res) {
            if(res.success){
                loading.value = false;
                
                notification.success({
                    content: 'Муаффақиятли!',
                    meta: "Маълумот ўзгартирилди",
                    duration: 1500,
                    keepAliveOnHover: false
                })
                xona.value.name = null

                emit('close', false)
            }
        })
        .catch(function (error) {
            message.error(error.message);
        })
    }catch (e) {
    }
}

const closePage = () => {
    emit('close', false)
    // router.go(-1)
}

const getOneXona = () => {
    if(props.xonaId){
        axios.get('/room/info/' + props.xonaId)
        .then(function (res) {
            xona.value = res.data
        })
        .catch(function (error){
            message.error(error.message);
        })
    }
}

// Get All Filial api
const getAllFilial = () => {
    axios.get('/filial/all')
    .then(function (res) {
        if(res.data){
            filialList.value = res.data
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

onMounted(() => {
    getOneXona()
    getAllFilial()
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