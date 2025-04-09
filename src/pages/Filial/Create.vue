<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('filial') }}</span>
        </div>
        <div class="xodim_body">
            <div class="content">
                <div class="content_image">
                    <n-spin :show="show" v-if="!props.branchId || imageShow">
                        <n-upload :onFinish="onFinish" :action="BaseUrl + '/filial/upload'" v-model:file-list="upload" accept="image/*" :min="1">
                            <n-upload-dragger accept="image/png, image/jpeg">
                                <div style="margin-bottom: 12px">
                                    <n-icon size="48" :depth="3">
                                        <CloudUpload />
                                    </n-icon>
                                </div>
                                <n-text style="font-size: 16px">
                                    {{ $t('upload_image') }}
                                </n-text>
                            </n-upload-dragger>
                        </n-upload>
                    </n-spin>
                    <div v-else class="image_card">
                        <n-image
                            v-if="filial_data.image"
                            width="150"
                            :src="BaseUrl + '/logo/' + filial_data.image"
                        />
                        <n-button strong secondary type="info" @click="updateImage">{{ $t('update_image') }}</n-button>
                    </div>
                </div>
                <n-form class="form" ref="formRef" :model="filial_data" :rules="rules">
                    <n-form-item :label="t('filial')" path="name">
                        <n-input v-model:value="filial_data.name" type="text" :placeholder="t('filial')" clearable />
                    </n-form-item>
                    <n-form-item :label="t('phone_number')" path="phone_number">
                        <n-input v-model:value="filial_data.phone_number" type="text" :placeholder="t('phone_number')" @keyup="formatTelNumber()" maxlength="19" />
                    </n-form-item>
                    <!-- <n-form-item :label="t('use_time_filial')" path="use_time">
                        <n-date-picker v-model:value="filial_data.use_time" type="date" :placeholder="t('use_time_filial')" style="width: 100%;" />
                    </n-form-item> -->
                    <n-form-item>
                        <div class="btn">
                            <!-- <n-button type="error" style="width: 150px;" @click="closePage">{{ $t('cencel_btn') }}</n-button> -->
                            <n-button type="success" style="width: 100%;" @click="save" :loading="loading">{{ $t('save_btn') }}</n-button>
                        </div>
                    </n-form-item>
                </n-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { CloudUpload } from '@vicons/carbon'
import { useRouter, useRoute } from "vue-router";
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const emit = defineEmits(['close'])
const props = defineProps(['branchId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false);
const show = ref(false)
const upload = ref([])
const BaseUrl = import.meta.env.VITE_BASE_URL
const imageShow = ref(false)

const filial_data = ref({
    name: null,
    phone_number: null,
    use_time: new Date(),
    image: null
})

const rules = {
    name: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('filial_name_midd'))
            }
        }
    },
    phone_number: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('kont_phone_midd'))
            }
        }
    }
}

const updateImage = () => {
    imageShow.value = true
}

const onFinish = (options) => {
  const sendImage = new FormData();
  sendImage.append('file', options.file.file);
  axios.post('/filial/upload', sendImage).then((res) => {
    filial_data.value.image = res.data;
  });
};

const save = async () => {    
    try {
        const result = await formRef.value?.validate();
        let data = { ...filial_data.value }
        let phoneNumber = filial_data.value.phone_number.replace(/[^\d]/g, "")
        data['use_time'] = data.use_time / 1000
        data['phone_number'] = '+' + phoneNumber
        loading.value = true;

        let method;
        if (props.branchId) {
            method = axios.patch('/filial/update/' + props.branchId, data)
        } else {
            method = axios.post('/filial/create', data)
        }
        method.then(function (res) {
            if (res.success) {
                loading.value = false;

                notification.success({
                    content: t('success'),
                    meta: t('create_doc'),
                    duration: 1500,
                    keepAliveOnHover: false
                })
                filial_data.value.name = null
                filial_data.value.phone_number = null
                filial_data.value.use_time = new Date()
                filial_data.value.image = null

                emit('close', false)
            }
        }).catch(function (error) {
            console.log(error.message);
        })
    } catch (e) {
    }
}

const getOneFilial = () => {
    if (props.branchId) {
        axios.get('/filial/info/' + props.branchId)
            .then(function (res) {
                if (res.success) {
                    res.data.use_time = res.data.use_time * 1000
                    filial_data.value = res.data
                    formatTelNumber()
                }                
            })
            .catch(function (error) {
                message.error(error.message);
            })
    }
}

onMounted(() => {
    getOneFilial()
})

// Tel number format
const length = ref(0)
const formatTelNumber = () => {
    if (length.value < filial_data.value.phone_number) {
        let numbers = formatNumber(filial_data.value.phone_number)
        filial_data.value.phone_number = numbers
    }
    length.value = filial_data.value.phone_number
}

const formatNumber = (value) => {
    if (!value) return value
    const phoneNumber = value.replace(/[^\d]/g, "")
    const phoneNumberLength = phoneNumber.length
    if (phoneNumberLength < 4) return `+998${phoneNumber}`
    if (phoneNumberLength < 6) {
        return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}`
    }
    if (phoneNumberLength < 8) {
        return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5)}`
    }
    if (phoneNumberLength < 10) {
        return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8)}`
    }
    return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)} ${phoneNumber.slice(10)}`
}
</script>

<style scoped lang="scss">
.xodim {
    margin: 10px;
    position: relative;

    &_head {
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

    &_body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 30px 10px 10px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        height: calc(100vh - 710px);
        min-height: 160px;
        overflow: hidden;
        overflow: auto;
        &_content {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }
    }
}

.content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  border: 1px solid #ECECF2;
  border-radius: 5px;
  padding: 5px;

  &_image {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.form {
    display: flex;
    flex-direction: column;
}

.btn {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 15px;
    width: 100%;
}

.image_card{
    display: flex;
    flex-direction: column;
    gap: 5px;
}
</style>