<template>
    <div class="prixod">
        <div class="prixod_head">
            <div class="title">{{ $t('get_product') }}</div>
            <div class="exit">
                <n-icon size="40" color="red" @click="exit" style="cursor: pointer">
                    <CloseSquareFilled />
                </n-icon>
            </div>
        </div>
        <div class="prixod_content">
            <n-form
                style="display: grid; grid-template-columns: 0.1fr 0.25fr 0.25fr 0.45fr; align-items: center; gap: 15px;"
                ref="formRef" :model="prixod" :rules="rules">
                <n-form-item :label="t('data')">
                    <n-date-picker v-model:value="prixod.datetime" type="date" size="large" disabled />
                </n-form-item>
                <n-form-item :label="t('oluvchi')" path="user_id">
                    <n-select v-model:value="prixod.user_id" :options="postavshikList" filterable label-field="full_name" value-field="id" :placeholder="t('xodim')" size="large"></n-select>
                </n-form-item>
                <!-- <n-form-item :label="t('total_summa')">
                    <n-input-number v-model:value="prixod.summa" type="text" placeholder="0.00" size="large" :show-button="false" style="width: 100%;" readonly :parse="useParsenumber" :format="useFormatnumber"/>
                </n-form-item> -->
                <!-- <n-form-item label="Текширув" path="inspection_id">
                    <n-select v-model:value="prixod.inspection_id" :options="inspectionList" size="large" value-field="id" label-field="name" />
                </n-form-item> -->
            </n-form>
        </div>
        <div class="prixod_info">
            <table border="#000" style="width: 100%;">
                <thead>
                    <tr>
                        <th style="width: 5%;">№</th>
                        <th style="width: 22%;">{{ $t('tek_bolim') }}</th>
                        <th style="width: 22%;">{{ $t('product_name') }}</th>
                        <th style="width: 22%;">{{ $t('count') }}</th>
                        <!-- <th style="width: 15%;">{{ $t('summa') }}</th> -->
                        <th style="width: 22%;">{{ $t('qoldiq') }}</th>
                        <th style="width: 5%;"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in prixod.reagent_prixod_tables" :key="index">
                        <th>{{ index + 1 }}</th>
                        <td><n-select v-model:value="item.inspection_category_id" :options="isnpectionCategoryList" @update:value="chooseTekBolim(item)" filterable label-field="name" value-field="id" :placeholder="t('tek_bolim')" size="large"/></td>
                        <td><n-select v-model:value="item.product_id" :options="item.productList" @update:value="chooseProduct(item)" filterable label-field="name" value-field="id" :placeholder="t('product_name')" size="large"/></td>
                        <td><n-input-number v-model:value="item.count" @update:value="editProductCount(item)" :status="item.count > item.qoldiq ? 'error': 'info'" size="large" :show-button="false"/></td>
                        <!-- <td><n-input-number v-model:value="item.price" disabled :status="item.price > item.price ? 'error': 'info'" size="large" :show-button="false" :parse="useParsenumber" :format="useFormatnumber"/></td> -->
                        <td><n-input-number v-model:value="item.qoldiq" size="large" :show-button="false" :status="item.qoldiq <= 0 ? 'error': 'info'" readonly/></td>
                        <td style="width: 50px; padding: 5px;"><div class="delete" @click="deleteRow(item, index)"><n-icon size="25" color="red"><DeleteFilled /></n-icon></div></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="prixod_btn">
            <div class="button">
                <n-button type="warning" size="large" style="width: 180px;" @click="printBtn">
                    <n-icon size="20">
                        <PrinterOutlined />
                    </n-icon>
                    {{ $t('print') }}
                </n-button>
                <n-button type="info" size="large" style="width: 180px;" @click="addRow">
                    <n-icon size="20">
                        <PlusOutlined />
                    </n-icon>
                    {{ $t('add_btn') }}
                </n-button>
                <n-button type="error" size="large" style="width: 180px;" @click="clearBack">
                    <n-icon size="20">
                        <Close />
                    </n-icon>
                    {{ $t('cencel_btn') }}
                </n-button>
                <n-button type="success" size="large" style="width: 205px;" @click="saveDoc" :loading="loading">
                    <n-icon size="20">
                        <SaveAltRound />
                    </n-icon>
                    {{ $t('save_btn') }}
                </n-button>
            </div>
        </div>
    </div>

</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { CloseSquareFilled, PlusOutlined, DeleteFilled, PrinterOutlined } from '@vicons/antd'
import { Close } from '@vicons/ionicons5'
import { SaveAltRound } from '@vicons/material'
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dialog = useDialog()
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const postavshikList = ref([])
const productList = ref([])
const loading = ref(false);

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
    // inspection_id: {
    //     required: true,
    //     trigger: 'blur',
    //     validator: (rule, value) => {
    //         if (value == null || value == '') {
    //             return new Error("Текширув танлан мажбурий")
    //         }
    //     }
    // },
}

const prixod = ref({
    datetime: new Date().getTime(),
    user_id: null,
    summa: 0,
    reagent_prixod_tables: []
})

const printBtn = async () => {
    try {
        const result = await formRef.value?.validate();
        if (prixod.value.reagent_prixod_tables.length > 0) {
            const selectedPostavshik = postavshikList.value.find(
                (item) => item.id === prixod.value.user_id
            );
    
            if (selectedPostavshik) {
                prixod.value.postavchik_name = selectedPostavshik.full_name;
            }
    
            prixod.value.reagent_prixod_tables.forEach((item) => {
                const foundProduct = productList.value.find((product) => product.id === item.product_id);
                if (foundProduct) {
                    item.product_name = foundProduct.name;
                }
            });
    
            localStorage.setItem('reagentPrixod', JSON.stringify(prixod.value));
            const rout = router.resolve({
              path: "/reagent_prixod_print"
            });
            window.open(rout.href, "_blank");
            saveDoc()
        }
    } catch (error) {
        console.log(error);
    }
}

const exit = () => {
    dialog.info({
        title: t('warning'),
        content: t('exit_window'),
        positiveText: t('exit_btn'),
        negativeText: t('cencel_btn'),
        onPositiveClick: () => {
            router.go(-1)
        },
        onNegativeClick: () => {
        }
    })
}

const addRow = () => {
    prixod.value.reagent_prixod_tables.push({
        inspection_category_id: null,
        product_id: null,
        count: 0,
        qoldiq: 0,
        price: 0,
        summa: 0,
        productList: []
    })
}
const deleteRow = (item, index) => {
    prixod.value.summa -= item.price
    prixod.value.reagent_prixod_tables.splice(index, 1);
}

const clearBack = () => {
    prixod.value.prixod_table = [];
    router.go(-1)
}

const saveDoc = async () => {
    try {
        const result = await formRef.value?.validate();
        if (prixod.value.reagent_prixod_tables[0].product_id) {
            loading.value = true;
            let method;
            if (route.query.id) {
                method = axios.patch('/reagent_prixod/update/' + route.query.id, prixod.value)
            } else {
                method = axios.post('/reagent_prixod/create', prixod.value)
            }

            method.then(function (res) {
                if (res.success) {
                    loading.value = false;

                    message.success(t('create_doc'))
                    router.go(-1)
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
        } else {
            notification.error({
                content: t('error'),
                meta: t('forced_product'),
                duration: 1500,
                keepAliveOnHover: false
            })
        }
    } catch (e) {
    }
}

const chooseTekBolim = (e) => {
    if(e.inspection_category_id){
        axios.get('/product/filter_tekbolim_product/' + e.inspection_category_id)
        .then(function (res) {
            if (res.success) {
                e.productList = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })        
    }
}

const chooseProduct = (e) => {
    e.count = 0;
    e.price = 0;
    e.qoldiq = 0;
    axios.get('/reagent_prixod/choose/'+e.product_id)
    .then(function (res) {
        if (res.success) {
            e.summa = Number(res.data.price)
            e.qoldiq = Number(res.data.soni || 0)
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

const editProductCount = (e) => {
    if(e.count > e.qoldiq){
        e.count = e.qoldiq
    }
    e.price = (e.summa*1) * (e.count*1)
    prixod.value.summa = 0
    for (let i = 0; i < prixod.value.reagent_prixod_tables.length; i++) {
        prixod.value.summa += prixod.value.reagent_prixod_tables[i].price
    }
}

// Get All Api
const filialId = ref(Number(localStorage.getItem('user_filial')));
const getAllKontragent = () => {
    axios.get('/user/shifokor/' + filialId.value)
        .then(function (res) {
            postavshikList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const isnpectionCategoryList = ref([])
const getInspectionCategory = () => {
    axios.get('/inspection_category/all')
    .then(function (res) {
        isnpectionCategoryList.value = res.data
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get One Api 
const getOnePrixod = () => {
    if (route.query.id) {
        axios.get('/reagent_prixod/info/' + route.query.id)
        .then(function (res) {
            if(res.success){
                prixod.value.datetime = res.data.datetime * 1000
                prixod.value.user_id = res.data.user_id
                prixod.value.summa = Number(res.data.summa)
                for (let i = 0; i < res.data.reagent_prixod_tables.length; i++) {
                    res.data.reagent_prixod_tables[i].count = Number(res.data.reagent_prixod_tables[i].count)
                    res.data.reagent_prixod_tables[i].price = Number(res.data.reagent_prixod_tables[i].price)
                    res.data.reagent_prixod_tables[i].qoldiq = Number(res.data.reagent_prixod_tables[i].qoldiq)
                    res.data.reagent_prixod_tables[i].productList = res.data.reagent_prixod_tables[i].inspection_category.product
    
                    prixod.value.reagent_prixod_tables.push(res.data.reagent_prixod_tables[i])
                }
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

onMounted(() => {
    getAllKontragent()
    getOnePrixod()
    getInspectionCategory()
})

</script>

<style scoped lang="scss">
.prixod {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #D3E4E7 !important;
    height: 100vh;
    width: 100vw;
    padding: 0 10px;

    &_head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #F0F0F0;
        padding: 5px;
        border-bottom: 1px solid #007BFF;
        border-left: 1px solid #007BFF;
        border-right: 1px solid #007BFF;
        border-radius: 0 0 10px 10px;

        .title {
            font-size: 20px;
            font-weight: 600;
        }
    }

    &_content {
        background-color: #F0F0F0;
        border: 1px solid #007BFF;
        border-radius: 10px;
        padding: 5px;
    }

    &_info {
        background-color: #F0F0F0;
        border: 1px solid #007BFF;
        border-radius: 10px;
        padding: 5px;
        min-height: calc(100vh - 240px);
        max-height: calc(100vh - 240px);
        overflow: auto;
        position: relative;

        table,
        th,
        td {
            border: 2px solid #007BFF;
            border-collapse: collapse;
        }

        thead {
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
                padding: 5px;
            }
        }

        .plus {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            position: sticky;
            // bottom: 50px;
            // right: 60px;
            top: 80%;
            background-color: #007BFF;
            width: 40px;
            height: 40px;
            cursor: pointer;

            &:hover {
                background-color: #3582d4;
            }
        }

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

    &_btn {
        display: flex;
        align-items: center;
        justify-content: end;

        .button {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    }
}

.modal {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>