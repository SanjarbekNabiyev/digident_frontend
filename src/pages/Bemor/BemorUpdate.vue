<template>
    <div class="contents">
        <div class="contents_head">
            <span>{{ $t('bemor') }}</span>
        </div>
        <div class="contents_body">
            <n-form ref="formRef" :model="bemor" :rules="rules">
                <n-form-item :label="t('bemor_fio')" path="full_name">
                    <n-input v-model:value="bemor.full_name" type="text" :placeholder="t('bemor_fio')" clearable />
                </n-form-item>
                <n-form-item :label="t('phone_number')">
                    <input class="phone_number" type="text" required v-model="bemor.phone_number"
                        @keyup="formatTelNumber()" maxlength="19" placeholder="+998...">
                </n-form-item>
                <n-form-item :label="t('birthday')">
                    <input class="phone_number" type="date" v-model="bemor.birthday" />
                </n-form-item>
            </n-form>
            <n-form>
                <n-form-item :label="t('region')">
                    <n-select v-model:value="bemor.viloyat_id" :options="viloyatList" :onUpdate:value="filterTuman"
                        value-field="id" label-field="name" :placeholder="t('region')" filterable clearable />
                </n-form-item>
                <n-form-item :label="t('tuman')">
                    <n-select v-model:value="bemor.tuman_id" :options="tumanList" value-field="id" label-field="name"
                        :placeholder="t('tuman')" filterable clearable />
                </n-form-item>
                <n-form-item :label="t('home_address')">
                    <n-input v-model:value="bemor.pasport" type="text" :placeholder="t('home_address')" clearable />
                </n-form-item>
            </n-form>
            <n-form>
                <n-form-item :label="t('imtiyos')">
                    <n-select v-model:value="bemor.imtiyoz" :options="imtiyozList" value-field="key" label-field="label"
                        :placeholder="t('imtiyos')" clearable />
                </n-form-item>
                <n-form-item :label="t('gender')">
                    <div style="width: 100%;display: flex; align-items: center; justify-content: space-between; gap: 50px;">
                        <n-radio-group v-model:value="bemor.gender" name="radiogroup"
                            style="display: flex; align-items: center; gap: 10px;">
                            <n-radio value="erkak" :label="t('man')" />
                            <n-radio value="ayol" :label="t('woman')" />
                        </n-radio-group>
                        <!-- <n-button type="default" @click="openImageModal" style="width: 150px;">{{ $t('image') }}</n-button> -->
                    </div>
                </n-form-item>
                <n-form-item>
                    <div class="btn">
                        <n-button @click="closePage" style="width: 150px;" type="error" size="medium">{{ $t('cencel_btn') }}</n-button>
                        <n-button @click="saveBemor" style="width: 150px;" type="success" size="medium" :loading="loading">{{ $t('save_btn') }}</n-button>
                    </div>
                </n-form-item>
            </n-form>
        </div>
    </div>

    <n-modal
        v-model:show="imgModal"
        class="custom-card"
        preset="card"
        style="width: max-content;"
    >
        <div class="image">
            <img :src="BASE_URL+bemor.image_name" style=" max-width: 500px; height: 350px;">
        </div>
    </n-modal>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import axios from 'axios';
import { I18nD, useI18n } from "vue-i18n";
const BASE_URL = import.meta.env.VITE_BASE_URL + '/uploads/'
const { t, locale } = useI18n()
const emit = defineEmits(['close'])
const props = defineProps(['bemorId'])
const notification = useNotification()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false);

const bemor = ref({
    full_name: null,
    phone_number: null,
    birthday: formatBirthday(Math.floor(new Date().getTime() / 1000)),
    viloyat_id: 2,
    tuman_id: 16,
    gender: 'erkak',
    pasport: null,
    imtiyoz: null,
    image_name: null,
})

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
const imgModal = ref(false)
const openImageModal = () => {
    imgModal.value = true
}
const bemorList = ref([])
// Get all bemor api
const getBemor = () => {
    axios.get('/bemor/all')
        .then(function (res) {
            bemorList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

// Get One bemor api
const getOneBemor = () => {
    if (props.bemorId) {
        axios.get('/bemor/info/' + props.bemorId)
            .then(function (res) {
                if (res.data) {
                    let data = { ...res.data };
                    data.birthday = res.data.birthday == null ? null : formatBirthday(res.data.birthday);
                    bemor.value = data;
                    
                    filterTuman()
                    formatTelNumber()
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
    }
}

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

const closePage = () => {
    emit('close', false)
}

// Bemor save api
const saveBemor = async () => {
    try {
        let time = Math.floor(new Date().getTime() / 1000);
        const result = await formRef.value?.validate();
        let data = { ...bemor.value };
        if(bemor.value.phone_number){
            let phoneNumber = bemor.value.phone_number.replace(/[^\d]/g, "")
            data['phone_number'] = '+' + phoneNumber;
        }
        data['user_id'] = parseInt(localStorage.getItem('user_id'));
        data['filial_id'] = parseInt(localStorage.getItem('user_filial'));
        data['birthday'] = bemor.value.birthday == null ? null :  new Date(bemor.value.birthday).getTime() / 1000;
        data['created_at'] = time;
        data['updated_at'] = time
        loading.value = true;

        axios.patch('/bemor/update/'+props.bemorId, data)
            .then(function (response) {
                if (response.success) {
                    loading.value = false;
                    emit('close', false)

                    notification.success({
                        content: 'Муаффақиятли!',
                        meta: "Бемор маълумотлари ўзгартирилди",
                        duration: 1500,
                        keepAliveOnHover: false
                    })
                }
            })
            .catch(function (error) {
                console.log(error.message);
            });
    } catch (e) {
    }
}

// Tel number format
const length = ref(0)
const formatTelNumber = () => {
    if (length.value < bemor.value.phone_number) {
        let numbers = formatNumber(bemor.value.phone_number)
        bemor.value.phone_number = numbers
    }
    length.value = bemor.value.phone_number
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

onMounted(() => {
    getViloyatlar()
    getOneBemor()
    getBemor()
})

</script>

<style scoped lang="scss">
.contents {
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
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        padding: 30px 10px 0px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        min-height: calc(100vh - 720px);
        overflow: hidden;
        overflow: auto;
    }
}

.phone_number {
    width: 100%;
    padding: 5px 12px;
    border: 1px solid #DFDFE5;
    border-radius: 4px;
    outline: none;
}

.phone_number:hover {
    border: 1px solid #007BFF;
}

.phone_number:focus {
    /* border: 1px solid #007BFF; */
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.gender {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}
.btn{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 10px;
}
</style>