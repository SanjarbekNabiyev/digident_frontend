<template>
    <div class="xodim">
        <div class="xodim_head">
            <span>{{ $t('tek') }}</span>
        </div>
        <div class="xodim_body">
            <n-form class="form" ref="formRef" :model="xodim" :rules="rules">
                <n-form-item :label="t('ins_name')" path="name">
                    <n-input v-model:value="xodim.name" type="text" :placeholder="t('ins_name')" clearable/>
                </n-form-item>
                <n-form-item :label="t('ins_category')" path="inspection_category_id">
                    <n-select v-model:value="xodim.inspection_category_id" :options="isnpectionCategoryList" value-field="id" label-field="name" :placeholder="t('ins_category')" clearable/>
                </n-form-item>
                <n-form-item :label="t('price')">
                    <n-input-number v-model:value="xodim.summa" clearable :placeholder="t('price')" style="width: 100%;" :show-button="false" :parse="useParsenumber" :format="useFormatnumber"/>
                </n-form-item>
                <n-form-item :label="t('texnik')">
                    <n-switch v-model:value="xodim.type" size="medium"/>
                </n-form-item>
            </n-form>
            <!-- <div class="reagent">
                <table border="#000" style="width: 100%;">
                    <thead>
                        <th style="width: 5%;">№</th>
                        <th style="width: 45%;">{{ $t('product_name') }}</th>
                        <th style="width: 45%;">{{ $t('count') }}</th>
                        <th style="width: 5%;"></th>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in xodim.reagent_calcs" :key="index">
                            <th>{{ index + 1 }}</th>
                            <td><n-select v-model:value="item.product_id" :options="productList" filterable label-field="name" :placeholder="t('product_name')" value-field="id" size="large" @update:value="chooseProduct(item)"/></td>
                            <td><n-input-number v-model:value="item.count" size="large" :show-button="false" /></td>
                            <th style="width: 50px; padding: 5px;"><div class="delete" @click="deleteRow(item, index)"><n-icon size="25" color="red"><DeleteFilled /></n-icon></div></th>
                        </tr>
                    </tbody>
                </table>
            </div> -->
            <div class="btn">
                <!-- <n-button type="info" style="width: 150px;" @click="addRow">{{ $t('add_btn') }}</n-button> -->
                <n-button type="error" style="width: 150px;" @click="closePage">{{ $t('cencel_btn') }}</n-button>
                <n-button type="success" style="width: 150px;" @click="saveDoc" :loading="loading">{{ $t('save_btn') }}</n-button>
            </div>
        </div>
        
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { DeleteFilled } from '@vicons/antd'
import { useRouter, useRoute } from "vue-router";
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const emit = defineEmits(['close'])
const props = defineProps(['tekshiruvId'])
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const isnpectionCategoryList = ref([])
const xodimList = ref([])
const productList = ref([])
const loading = ref(false);

const xodim = ref({
    name: null,
    inspection_category_id: null,
    summa: 0,
    type: false,
    reagent_calcs: []
})

const rules = {
    name: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('ins_name_midd'))
            }
        }
    },
    inspection_category_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('ins_change_cat_midd'))
            }
        }
    },
}

const addRow = () => {
    xodim.value.reagent_calcs.push({
        product_id: null,
        count: 0,
        price: 0
    })
}
const deleteRow = (item, index) => {
    xodim.value.reagent_calcs.splice(index, 1);
    // axios.post('/prixod/delete-prixod-table/' + item.id)
    //     .then(function (res) {
    //     })
    //     .catch(function (error) {
    //         console.log(error.message);
    //     })
}

const closePage = () => {
    emit('close', false)
    // router.go(-1)
}

const saveDoc = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...xodim.value }
        data['filial_id'] = localStorage.getItem('user_filial')
        loading.value = true;

        let method;
        if (props.tekshiruvId) {
            method = axios.patch('/inspection/update/'+props.tekshiruvId, data)
        }else{
            method = axios.post('/inspection/create', data)
        }
        method.then(function (res) {
            if(res.success) {
                loading.value = false;

                notification.success({
                    content: t('success'),
                    meta: t('create_doc'),
                    duration: 1500,
                    keepAliveOnHover: false
                })
                xodim.value.name = null
                xodim.value.inspection_category_id = null
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

// Get All Lobarant api
const getXodim = () => {
    axios.get('/user/lobarant')
    .then(function (res) {
        xodimList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get All Inspection Category api
const getInspectionCategory = () => {
    axios.get('/inspection_category/all')
    .then(function (res) {
        isnpectionCategoryList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get One Inspection Update
const getOneinspection = () => {
    if(props.tekshiruvId){
        axios.get('/inspection/info/'+props.tekshiruvId)
        .then(function (res) {
            for (let index = 0; index < res.data.reagent_calcs.length; index++) {
                res.data.reagent_calcs[index].count = Number(res.data.reagent_calcs[index].count)
            }
            let data = {...res.data}
            data['summa'] = Number(res.data.summa)
            xodim.value = data
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

const getAllProduct = () => {
    axios.get('/product/all')
    .then(function (res) {
        productList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const chooseProduct = (e) => {
    axios.get('/reagent_prixod/choose/'+e.product_id)
    .then(function (res) {
        e.price = Number(res.data.price)
    })
    .catch(function (error) {
        console.log(error.message);
    })
}


onMounted(() => {
    getXodim()
    getInspectionCategory()
    getOneinspection()
    getAllProduct()
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
        min-height: calc(100vh - 750px);
        overflow: hidden;
        overflow: auto;
        .reagent{
            min-height: 100px;
            // border: 1px solid #007BFF;
            border-radius: 5px;
            .delete {
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid red;
                border-radius: 5px;
                width: 35px;
                height: 35px;
                cursor: pointer;

                &:hover {
                    background-color: rgb(255, 178, 178);
                    color: #fff;
                }
            }
        }
    }
    table,
    th,
    td {
        border: 2px solid #007BFF;
        border-collapse: collapse;
    }
    
    thead {
        border-radius: 5px;
        background-color: #007BFF;
        color: #fff;

        th {
            padding: 5px 0;
            border-right: 2px solid #fff;

            &:last-child {
                border-right: 2px solid #007BFF;
            }
        }
    }

    tbody {
        td {
            border: 2px solid #007BFF;
            padding: 3px;
        }
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