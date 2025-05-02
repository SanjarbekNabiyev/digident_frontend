<template>
    <div class="container">
        <div class="container_header">
            <n-form ref="formRef" :model="datas" :rules="rules" style="display: grid; grid-template-columns: 0.1fr repeat(3, 0.3fr); align-items: center; gap: 30px;">
                <n-form-item :label="t('data')">
                    <n-date-picker v-model:value="datas.datetime" type="date" size="large" />
                </n-form-item>
                <n-form-item :label="t('bemor_fio')" path="bemor_id">
                    <n-select
                        v-model:value="datas.bemor_id" 
                        :options="bemorList" 
                        value-field="id" 
                        label-field="full_name" 
                        :placeholder="t('bemor_fio')" 
                        filterable 
                        clearable
                        size="large"
                    />
                </n-form-item>
                <n-form-item :label="t('doctor')" path="user_id">
                    <n-select
                        v-model:value="datas.user_id" 
                        :options="doctorList" 
                        value-field="id" 
                        label-field="full_name" 
                        :placeholder="t('doctor')"
                        filterable 
                        clearable
                        size="large"
                    />
                </n-form-item>
                <n-form-item :label="t('texnik')" path="texnik_id">
                    <n-select
                        v-model:value="datas.texnik_id" 
                        :options="texnikList" 
                        value-field="id" 
                        label-field="fullname" 
                        :placeholder="t('texnik')"
                        filterable 
                        clearable
                        size="large"
                    />
                </n-form-item>
            </n-form>
        </div>
        <div class="container_body">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="teeth" v-for="(item, index) in teethTopList" :key="index">
                    <div class="teeth_item">
                        <n-checkbox v-model:checked="item.check" size="large" class="check" @update:checked="(e) => chooseTooth(e, item)" style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px;">
                            <div style="height: 75px; width: 45px;" v-html="item.name"></div>
                            <span>{{ item.number }}</span>
                        </n-checkbox>
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="teeth" v-for="(item, index) in teethBottomList" :key="index">
                    <div class="teeth_item">
                        <n-checkbox v-model:checked="item.check" size="large" class="check" @update:checked="(e) => chooseTooth(e, item)" style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px;">
                            <div style="height: 75px; width: 45px;" v-html="item.name"></div>
                            <span>{{ item.number }}</span>
                        </n-checkbox>
                    </div>
                </div>
            </div>
        </div>
        <div class="container_table">
            <n-data-table :pagination="paginationReactive" :columns="columns" :data="datas.labaratory_tables" striped  :max-height="290" />
        </div>
        <div class="container_footer">
            <n-input type="text" v-model:value="datas.comment" :placeholder="t('comment')" clearable/>
            <div class="btn">
                <n-button type="warning" style="width: 150px;" @click="printBtn">{{ $t('print') }}</n-button>
                <n-button type="error" style="width: 150px;" @click="closePage">{{ $t('cencel_btn') }}</n-button>
                <n-button type="success" style="width: 150px;" @click="saveLabaratoriya" :loading="loading">{{ $t('save_btn') }}</n-button>
            </div>
        </div>
    </div>

    <n-modal v-model:show="infoModal" class="custom-card" preset="card" :style="{ width: '1000px' }" :title="t('malumot')">
        <div class="xodim">
            <div class="content" v-for="(it, ind) in texnikXizmatList" :key="ind">
                <div class="card">
                    <n-checkbox id="check" @update:checked="(e) => chooseTexnikXizmat(it, e)">
                        <span style="font-size: 16px; font-weight: 600;">{{ it.name }}</span>
                    </n-checkbox>
                </div>
            </div>
        </div>
    </n-modal>

    <n-modal v-model:show="colorPicker" class="custom-card" preset="card" :style="{ width: '400px' }" :title="t('color')">
        <div class="color">
            <n-button v-for="(it, ind) in colorList" :key="ind" @click="getColor(it)" :style="{ backgroundColor: it.color, padding: '25px' }">{{ it.id }}</n-button>
        </div>
    </n-modal>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, h, watch, computed } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useMessage, useNotification, useDialog, NButton, NIcon, } from 'naive-ui'
import { TrashAltRegular } from '@vicons/fa'
import { I18nD, useI18n } from "vue-i18n";
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
const formRef = ref(null)
const { t, locale } = useI18n()
const props = defineProps(['bemor_id'])
const emit = defineEmits(['tekshiruv'])
const dialog = useDialog()
const notification = useNotification()
const router = useRouter()
const route = useRoute()
const checked = ref(false)
const teeth_id = ref(null)
const bemorList = ref([])
const doctorList = ref([])
const texnikList = ref([])
const texnikXizmatList = ref([])
const filialId = ref(Number(localStorage.getItem('user_filial')))
const infoModal = ref(false)
const colorPicker = ref(false)
const loading = ref(false);
const teethArray = ref([])

const colorList = ref([
    { id: 'A1', color: '#E1DCBF' },
    { id: 'A2', color: '#D8CEAA' },
    { id: 'A3', color: '#D6C99D' },
    { id: 'A3.5', color: '#D2C08E' },
    { id: 'A4', color: '#C3B27C' },
    { id: 'B1', color: '#DEDAC1' },
    { id: 'B2', color: '#DDD3B0' },
    { id: 'B3', color: '#D6C89B' },
    { id: 'B4', color: '#D3C390' },
    { id: 'C1', color: '#D5CFAF' },
    { id: 'C2', color: '#CFC29F' },
    { id: 'C3', color: '#D1C4A1' },
    { id: 'C4', color: '#BFAF7C' },
    { id: 'D2', color: '#D3CDAB' },
    { id: 'D3', color: '#D1C4A1' },
    { id: 'D4', color: '#D1C59D' },
])

const datas = ref({
    datetime: new Date().getTime(),
    bemor_id: null,
    user_id: null,
    texnik_id: null,
    comment: null,
    labaratory_tables: []
})

const rules = {
    bemor_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('choose_bemor'))
            }
        }
    },
    user_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('select_doctor'))
            }
        }
    },
    texnik_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('texnik_name_midd'))
            }
        }
    },
}

const columns = [
    {
        title: '№',
        render: (_, index) => {
            return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
        },
    },
    {
        title: t('teeth_number'),
        key: 'teeth_number'
    },
    {
        title: t('texnik_xizmat'),
        key: 'texnik_xizmat_name'
    },
    {
        title: t('color'),
        key: 'color_id'
    },
    {
        title: '',
        key: "action",
        width: 80,
        render(row) {
            return [
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'error',
                        onClick: (e) => {
                            e.stopPropagation();
                            datas.value.labaratory_tables = datas.value.labaratory_tables.filter(
                                (tooth) => tooth.teeth_number !== row.teeth_number
                            );
                            
                        }
                    },
                    {
                        icon: () =>
                            h(NIcon, {
                                component: TrashAltRegular
                            })
                    }
                ),
            ]
        }
    }
]

let teethData = ref(null)
const chooseTooth = (e, item) => {
    if (e) {
        infoModal.value = true
        teethData.value = {
            teeth_name: item.name,
            teeth_number: item.number,
            teeth_id: item.id
        }
    }else{
        datas.value.labaratory_tables = datas.value.labaratory_tables.filter(
            (tooth) => tooth.teeth_number !== item.number
        );
    }
}

const chooseTexnikXizmat = (item, e) => {
    if(e) {
        colorPicker.value = true
        teethData.value.texnik_xizmat_id = item.id
        teethData.value.texnik_xizmat_name = item.name

        for (let i = 0; i < teethTopList.value.length; i++) {
            if(teethTopList.value[i].check){
                teethTopList.value[i].check = false
            }
        }
        for (let i = 0; i < teethBottomList.value.length; i++) {
            if(teethBottomList.value[i].check){
                teethBottomList.value[i].check = false
            }
        }
    }
}

const getColor = (colorItem) => {
    teethData.value.color_id = colorItem.id
    teethData.value.color = colorItem.color
    datas.value.labaratory_tables.push(teethData.value)

    infoModal.value = false;
    colorPicker.value = false;
};

const printBtn = async () => {
    try {
        const result = await formRef.value?.validate();
        if (datas.value.labaratory_tables.length > 0) {
    
            localStorage.setItem('labaratoryData', JSON.stringify(datas.value));
            const rout = router.resolve({
              path: "/labaratory_print"
            });
            window.open(rout.href, "_blank");
            saveLabaratoriya()
        }
    } catch (error) {
        console.log(error);
    }
}

const closePage = () => {
    datas.value.bemor_id = null,
    datas.value.user_id = null,
    datas.value.texnik_id = null,
    datas.value.comment = null,
    datas.value.labaratory_tables = []
    router.go(-1)
}

const saveLabaratoriya = async () => {
    try {
        const result = await formRef.value?.validate();
        let method;
        if (route.query.id) {
            method = axios.patch('/labaratory/update/' + route.query.id, datas.value)
        }else{
            method = axios.post('/labaratory/create', datas.value)
        }
        method.then(function (res) {
            if(res.success){
                closePage()
                notification.success({
                    content: t('success'),
                    meta: t('save_doc'),
                    duration: 1500,
                    keepAliveOnHover: false
                })
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }catch (error) {
        console.log(error);
    }
}

// Get all teeth api
const teethTopList = ref([])
const teethBottomList = ref([])
const getAllTeeth = () => {
    axios.get('/teeth/all')
        .then(function (res) {
            if (res.success) {
                teethTopList.value = res.data.slice(0, 16)
                teethBottomList.value = res.data.slice(16, 32)
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

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

// Get all shifokor api
const getSHifokor = () => {
    axios.get('/user/shifokor/' + filialId.value)
    .then(function (res) {
        if(res.success){
            doctorList.value = res.data
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get all texnik api
const getTexnik = () => {
    axios.get('/texnik/all')
        .then(function (res) {            
            texnikList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

// Get all texnik api
const getTexnikXizmat = () => {
    axios.get('/texnik_xizmat/all')
        .then(function (res) {
            texnikXizmatList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const getOneLabaratory = () => {
    if (route.query.id) {
        axios.get('/labaratory/info/' + route.query.id)
            .then(function (res) {            
                datas.value = res.data
            })
            .catch(function (error) {
                console.log(error.message);
            })
    }
}

onMounted(() => {
    getAllTeeth()
    getBemor()
    getSHifokor()
    getTexnik()
    getTexnikXizmat()

    getOneLabaratory()
})

const bemorMap = computed(() => {
    const map = new Map()
    bemorList.value.forEach(bemor => {
        map.set(bemor.id, bemor)
    })
    return map
})
watch(() => datas.value.bemor_id, (newVal) => {
    const selectedBemor = bemorMap.value.get(newVal)
    if (selectedBemor) {
        datas.value.bemor_name = selectedBemor.full_name
    } else {
        datas.value.bemor_name = null
    }
})

const doctorMap = computed(() => {
    const map = new Map()
    doctorList.value.forEach(doctor => {
        map.set(doctor.id, doctor)
    })
    return map
})
watch(() => datas.value.user_id, (newVal) => {
    const selectedBemor = doctorMap.value.get(newVal)
    if (selectedBemor) {
        datas.value.doctor_name = selectedBemor.full_name
    } else {
        datas.value.doctor_name = null
    }
})

const texnikMap = computed(() => {
    const map = new Map()
    texnikList.value.forEach(texnik => {
        map.set(texnik.id, texnik)
    })
    return map
})
watch(() => datas.value.texnik_id, (newVal) => {
    const selectedBemor = texnikMap.value.get(newVal)
    if (selectedBemor) {
        datas.value.texnik_name = selectedBemor.fullname
    } else {
        datas.value.texnik_name = null
    }
})

const paginationReactive = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 50, 100],
    onChange: (page) => {
        paginationReactive.page = page;
    },
    onUpdatePageSize: (pageSize) => {
        paginationReactive.pageSize = pageSize;
        paginationReactive.page = 1;
    }
});
</script>

<style scoped lang="scss">
.container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 10px;
    padding: 10px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    animation: showBox 0.3s ease-in-out forwards alternate;
    height: calc(100vh - 80px);
    overflow: hidden;
    overflow: auto;
    &_header{
        background-color: rgb(255, 255, 255);
        border: 1px solid #F0F0F0;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        animation: showBox 0.3s ease-in-out forwards alternate;
        border-radius: 5px;
        padding: 8px 10px;
    }
    &_body {
        display: flex;
        flex-direction: column;
        gap: 20px;
        background-color: #fff;
        border: 1px solid #F0F0F0;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        animation: showBox 0.3s ease-in-out forwards alternate;
        border-radius: 5px;
        padding: 20px;
        .teeth {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 5px;
            &_item {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                transition: all .1s ease-in;
                padding: 5px 0 3px;
                cursor: pointer;

                .check {
                    padding-bottom: 5px;
                }

                &:hover {
                    transform: scale(1.1);
                    z-index: 999;
                    border-radius: 5px;
                    box-shadow: 0.1em 0.1em .9em #a9a9aa;
                }
            }
        }
    }
    &_table{
        min-height: 350px;
    }
    &_footer{
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        .btn{
            display: flex;
            align-items: center;
            gap: 10px;
        }
    }
}
.xodim{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    position: relative;
    border: 2px solid #0064CF;
    border-radius: 5px;
    padding: 7px;
    .card{
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #d0e5f5;
        border: 1px solid #0064CF;
        border-radius: 5px;
        padding: 5px;
        margin-bottom: 5px;
        label, span{
            color: #3F51B4;
            font-size: 17px;
            font-weight: 600;
        }
    }
}
.color{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
}
</style>