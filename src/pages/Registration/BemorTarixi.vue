<template>
    <vue-easy-lightbox
        :visible="visibleRef"
        :imgs="imgsRef"
        :index="indexRef"
        @hide="onHide"
    >
        <template #close-btn>
            <div @click="onHide" style="position: absolute; z-index: 100; right: 10px; top: 20px">
                <n-button strong secondary color="#fff">
                    <template #icon>
                        <CloseOutlined></CloseOutlined>
                    </template>
                </n-button>
            </div>
        </template>
    </vue-easy-lightbox>

    <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="contents">
            <div class="contents_body">
                <n-form>
                    <n-form-item label="">
                        <div class="image">
                            <div class="image_card" v-if="!bemor.image_name">
                                <span>{{ $t('image') }}</span>
                            </div>
                                <n-image
                                    v-else 
                                    preview-disabled
                                    style="width: 30%; height: 103px;"
                                    @click="imageClick(bemor.image_name, $event)"
                                    :src="BASE_URL+bemor.image_name"
                                />
                        </div>
                    </n-form-item>
                    <n-form-item>
                        <n-button type="info" @click="openCameraModal" style="width: 100%;">Kamera</n-button>
                    </n-form-item>
                </n-form>
                <n-form ref="formRef" :model="bemor" :rules="rules">
                    <n-form-item :label="t('bemor_fio')" path="full_name">
                        <n-input v-model:value="bemor.full_name" type="text" :placeholder="t('bemor_fio')"  clearable/>
                    </n-form-item>
                    <n-form-item :label="t('phone_number')">
                        <input class="phone_number" type="text" required v-model="bemor.phone_number" @keyup="formatTelNumber()" maxlength="19" placeholder="+998...">
                    </n-form-item>
                    <n-form-item :label="t('birthday')">
                        <input class="phone_number" type="date" v-model="bemor.birthday" />
                        <!-- <n-date-picker v-model:value="bemor.birthday" type="date" :placeholder="t('year_month_day')" style="width: 100%;"  clearable/> -->
                    </n-form-item>
                </n-form>
                <n-form>
                    <n-form-item :label="t('region')">
                        <n-select v-model:value="bemor.viloyat_id" :options="viloyatList" :onUpdate:value="filterTuman" value-field="id" label-field="name" :placeholder="t('region')" filterable clearable/>
                    </n-form-item>
                    <n-form-item :label="t('tuman')">
                        <n-select v-model:value="bemor.tuman_id" :options="tumanList" value-field="id" label-field="name" :placeholder="t('tuman')" filterable clearable/>
                    </n-form-item>
                    <n-form-item :label="t('gender')">
                        <div style="width: 100%;display: flex; align-items: center; justify-content: space-between; gap: 50px;">
                            <n-radio-group v-model:value="bemor.gender" name="radiogroup" style="display: flex; align-items: center; gap: 10px;">
                                <n-radio value="erkak" :label="t('man')" />
                                <n-radio value="ayol" :label="t('woman')" />
                            </n-radio-group>
                        </div>
                    </n-form-item>
                </n-form>
                <n-form>
                    <n-form-item :label="t('pasport')">
                        <n-input v-model:value="bemor.pasport" type="text" placeholder="AB1234567" clearable/>
                    </n-form-item>
                    <n-form-item :label="t('imtiyos')">
                        <n-select v-model:value="bemor.imtiyoz" :options="imtiyozList" value-field="key" label-field="label" :placeholder="t('imtiyos')" clearable/>
                    </n-form-item>
                    <n-form-item>
                        <n-button @click="saveBemor" type="success" style="font-size: 16px; width: 40%;" size="medium">{{ $t('save_btn') }}</n-button>
                    </n-form-item>
                </n-form>
            </div>
        </div>
    </div>
    <n-modal
        v-model:show="addedModal"
        class="custom-card"
        preset="card"
        style="width: 650px;"
        :title="t('pictures')"
    >
        <Photo @imageName="bemorImage"/>
    </n-modal>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { CloseOutlined } from '@vicons/material'
import axios from 'axios';
import { I18nD, useI18n } from "vue-i18n";
import Photo from '../../components/Registration/Photo.vue';
const { t, locale } = useI18n()
const emit = defineEmits(['bemorEmit'])
const notification = useNotification()
const route = useRoute()
const formRef = ref(null)
const bemorId = ref(null)
const bemorName = ref(null)
const summa = ref(null)
const xodim = localStorage.getItem('user_name');
const filialId = ref(Number(localStorage.getItem('user_filial')))
const activUser = localStorage.getItem('role')
const passivBtn = ref(false) 
const props = defineProps(['data'])
const BASE_URL = import.meta.env.VITE_BASE_URL + '/uploads/'
const addedModal = ref(false)

const bemor = ref({
    full_name: null,
    phone_number: null,
    birthday: formatBirthday(Math.floor(new Date().getTime() / 1000)),
    viloyat_id: 5,
    tuman_id: null,
    gender: 'erkak',
    pasport: null,
    imtiyoz: null,
    image_name: null,
})

const bemorImage = (e) => {
    bemor.value.image_name = e
    addedModal.value = false
}

const openCameraModal = () => {
    addedModal.value = true
}

const rules = {
    full_name: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('bemor_name_midd'))
            }
        }
    },
    phone_number: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('bemor_phone_midd'))
            }
        }
    }
}

const viloyatList = ref([])
const tumanList = ref([])
const imtiyozList = [
    {
        key: 1,
        label: 'Imtiyozli'
    },
    {
        key: 2,
        label: 'Imtiyozsiz'
    },
]

// Get One Registration api
// const getOneRegistration = () => {
//     if(route.query.id){
//         axios.get('/registration/info/' + route.query.id)
//         .then(function (res) {
//             if(res.data){
//                 bemorId.value = res.data.bemor.id
//                 let data = { ...res.data.bemor };
//                 data.birthday = res.data.bemor.birthday == null ? null : formatBirthday(res.data.bemor.birthday);
//                 bemor.value = data;
//                 filterTuman()
//                 formatTelNumber()
//             }
//         })
//         .catch(function (error) {
//             console.log(error.message);
//         })
//     }
// }

function formatBirthday(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get All viloyatlar api
const getViloyatlar = () => {
    axios.get('/viloyat/all')
    .then(function (response) {
        viloyatList.value = response.data
        filterTuman()
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get all filter tuman api
const filterTuman = () => {
    tumanList.value = []
    let id = bemor.value.viloyat_id
    axios.get('/tuman/filter/' + id)
    .then(function (response) {
        tumanList.value = response.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Bemor save api
const saveBemor = async () => {
    try {
        let time = Math.floor(new Date().getTime() / 1000);
        const result = await formRef.value?.validate();
        let data = { ...bemor.value };
        let phoneNumber = bemor.value.phone_number.replace(/[^\d]/g,"")
        data['phone_number'] = '+'+phoneNumber;
        data['user_id'] = parseInt(localStorage.getItem('user_id'));
        data['filial_id'] = parseInt(localStorage.getItem('user_filial'));
        data['birthday'] = bemor.value.birthday == 0 ? null : new Date(bemor.value.birthday).getTime() / 1000;
        data['created_at'] = time;
        data['updated_at'] = time

        let method;
        if(route.query.id){
            method = axios.patch('/bemor/update/'+bemorId.value, data)
        }else{
            method = axios.post('/bemor/create', data)
        }
        
        method.then(function (response) {
            if(response.success){
                notification.success({
                    content: 'Муаффақиятли!',
                    meta: "Бемор маълумотлари сақланди",
                    duration: 1500,
                    keepAliveOnHover: false
                })
            }
        })
        .catch(function (error) {
            console.log(error.message);
        });
    }catch (e) {
    }
}

// Tel number format
const length = ref(0)
const formatTelNumber = () => {
  if (length.value < bemor.value.phone_number.length) {
    let numbers = formatNumber(bemor.value.phone_number)
    bemor.value.phone_number = numbers
  }
  length.value = bemor.value.phone_number.length
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

if(props.data) {
    let data = { ...props.data };
    data.birthday = data.birthday == null ? null : formatBirthday(data.birthday);
    bemorId.value = data.id
    bemor.value = data;
    filterTuman()
    formatTelNumber()
}

onMounted(() => {
    getViloyatlar()
})

const visibleRef = ref(false)
const indexRef = ref(0)
const imgsRef = ref([])
const onShow = () => {
    visibleRef.value = true
}

const imageClick = (imgName, e) => {
    if(imgName != null && imgName != "") {
        const url = BASE_URL + imgName;
        imgsRef.value = [url]
    } else {
        const url = BASE_URL;
        imgsRef.value = [url]
    }
    indexRef.value = 0 // index of imgList
    onShow()
    e.stopPropagation();
}
const onHide = () => (visibleRef.value = false)

</script>

<style scoped>
.head{
    background-color: #F0F0F0;
    border: 1px solid #007BFF;
    border-radius: 5px;
    padding: 8px 15px 0;
}
.contents{
    background-color: #F0F0F0;
    border: 1px solid #007BFF;
    border-radius: 5px;
    padding: 15px;
}
.contents_body{
    display: grid;
    /* align-items: center; */
    grid-template-columns: 300px repeat(3, 1fr);
    gap: 20px ;
}
.phone_number{
    width: 100%;
    padding: 5px 12px;
    border: 1px solid #DFDFE5;
    border-radius: 4px;
    outline: none;
}
.phone_number:hover{
    border: 1px solid #007BFF;
}
.phone_number:focus{
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}
.gender{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}
.image{
    width: 100%;
}
.image_card{
    border: 1px dashed #9999;
    height: 108px;
    width: 100%;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.image_card span{
    color: #999;
}
</style>