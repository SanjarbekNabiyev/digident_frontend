<template>
    <div class="prixod">
        <div class="prixod_head">
            <div class="title">{{ $t('prixod') }}</div>
            <div class="exit">
                <n-icon size="40" color="red" @click="exit" style="cursor: pointer">
                    <CloseSquareFilled />
                </n-icon>
            </div>
        </div>
        <div class="prixod_content">
            <n-form
                style="display: grid; grid-template-columns: 0.1fr 0.3fr 0.2fr 0.4fr; align-items: center; gap: 15px;"
                ref="formRef" :model="prixod">
                <n-form-item :label="t('data')">
                    <n-date-picker v-model:value="prixod.datetime" type="date" size="large" disabled />
                </n-form-item>
                <n-form-item :label="t('total_summa')">
                    <n-input-number v-model:value="prixod.summa" type="text" placeholder="0.00" size="large"
                        :show-button="false" style="width: 100%;" readonly :parse="useParsenumber"
                        :format="useFormatnumber" />
                </n-form-item>
                <n-form-item :label="t('pay_type')">
                    <n-select v-model:value="prixod.paytype" :options="payTypeList" size="large" value-field="id"
                        label-field="id" />
                </n-form-item>
                <n-form-item :label="t('comment')">
                    <n-input v-model:value="prixod.izoh" type="text" placeholder="" size="large" />
                </n-form-item>
            </n-form>
        </div>
        <div class="prixod_info">
            <table border="#000" style="width: 100%;">
                <thead>
                    <th style="width: 5%;">№</th>
                    <th style="width: 26%;">{{ $t('product_name') }}</th>
                    <th style="width: 22%;">{{ $t('price') }}</th>
                    <th style="width: 22%;">{{ $t('count') }}</th>
                    <th style="width: 22%;">{{ $t('total_summa') }}</th>
                    <th style="width: 3%;"></th>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in prixod.prixod_table" :key="index">
                        <th>{{ index + 1 }}</th>
                        <td>
                            <n-select v-model:value="item.product_id" :options="productList" filterable
                                label-field="name" value-field="id" :placeholder="t('product_name')" size="large"
                                @search="searchProduct">
                                <template #empty>
                                    <div>
                                        <n-empty :description="t('empty')"></n-empty>
                                        <div style="height: 10px;"></div>
                                        <n-button dashed type="primary"
                                            @click="maxsulotModal(), (showChange = 'maxsulot')">Қўшиш</n-button>
                                    </div>
                                </template>
                            </n-select>
                        </td>
                        <td><n-input-number v-model:value="item.price" size="large" :placeholder="t('price')"
                                :show-button="false" :parse="useParsenumber" :format="useFormatnumber" /></td>
                        <td><n-input-number v-model:value="item.count" size="large" :placeholder="t('count')"
                                @update:value="yigindi(item)" :show-button="false" :parse="useParsenumber"
                                :format="useFormatnumber" /></td>
                        <td><n-input-number v-model:value="item.summa" size="large" :placeholder="t('total_summa')"
                                :show-button="false" readonly :parse="useParsenumber" :format="useFormatnumber" /></td>
                        <th style="width: 50px; padding: 5px;">
                            <div class="delete" @click="deleteRow(item, index)"><n-icon size="25" color="red">
                                    <DeleteFilled />
                                </n-icon></div>
                        </th>
                    </tr>
                </tbody>
            </table>

            <!-- <div class="plus" @click="addRow">
                <n-icon size="35" color="#fff"><PlusOutlined/></n-icon>
            </div> -->
        </div>
        <div class="prixod_btn">
            <div class="button">
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

    <n-modal v-model:show="AddModal" class="custom-card" preset="card"
        style="width: max-content; min-width: 400px; background: #F4F6FD;"
        :title="(showChange == 'pastavshik') ? t('kontragent_add') : t('product_add')">
        <div class="modal">
            <n-input v-model:value="values" type="text" placeholder="" size="large" />
            <n-button type="primary" @click="addInfo(showChange)" :loading="loadBar">{{ t('add_btn') }}</n-button>
        </div>
    </n-modal>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { CloseSquareFilled, PlusOutlined, DeleteFilled } from '@vicons/antd'
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { Close } from '@vicons/ionicons5'
import { SaveAltRound } from '@vicons/material'
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dialog = useDialog()
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const AddModal = ref(false)
const showChange = ref(null)
const poatavshikList = ref([])
const productList = ref([])
const prixodList = ref([])
const loading = ref(false);
const loadBar = ref(false);

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

const prixod = ref({
    datetime: (new Date() * 1000) / 1000,
    summa: null,
    paytype: 'Нақд',
    izoh: null,
    key: Math.floor(new Date().getTime() / 1000),
    prixod_table: []
})

const maxsulotModal = () => {
    AddModal.value = true
}
const searchProduct = (e) => {
    values.value = e
}

const values = ref(null)
const addInfo = (e) => {
    loadBar.value = true;
    let data = {
        name: values.value
    }
    if (values.value) {
        axios.post('/product/create', data)
            .then(function (res) {
                if (res.success) {
                    loadBar.value = false;

                    getAllProduct()
                    message.success('Махсулот яратилди')
                    AddModal.value = false
                    values.value = null
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
    } else {
        message.error('Маълумотлар киритилмаган')
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
    prixod.value.prixod_table.push({
        product_id: null,
        price: null,
        count: null,
        summa: null,
    })
}
const deleteRow = (item, index) => {
    prixod.value.prixod_table.splice(index, 1);
    axios.post('/boshlangichqoldiq/delete-prixod-table/' + item.id)
        .then(function (res) {
        })
        .catch(function (error) {
            console.log(error.message);
        })

    yigindi(item)
}

const clearBack = () => {
    prixod.value.prixod_table = [];
    router.go(-1)
}

const saveDoc = async () => {
    try {
        const result = await formRef.value?.validate();
        let data = { ...prixod.value }
        data['user_id'] = localStorage.getItem('user_id')

        if (prixod.value.prixod_table.length > 0 && prixod.value.prixod_table[0].product_id) {
            loading.value = true;
            let method;
            if (route.query.id) {
                method = axios.patch('/boshlangichqoldiq/update/' + route.query.id, data)
            } else {
                method = axios.post('/boshlangichqoldiq/create', data)
            }
            method.then(function (res) {
                if (res.success) {
                    loading.value = false;

                    message.success('Документ яратилди')
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

const yigindi = (e) => {
    if (e.price) {
        e.summa = (e.price * 1) * (e.count * 1)
        prixod.value.summa = 0
        for (let i = 0; i < prixod.value.prixod_table.length; i++) {
            prixod.value.summa += prixod.value.prixod_table[i].summa
        }
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

// Get One Api 
const getOnePrixod = () => {
    if (route.query.id) {
        axios.get('/boshlangichqoldiq/info/' + route.query.id)
            .then(function (res) {
                prixod.value.datetime = res.data.datetime * 1000
                prixod.value.kontragent_id = res.data.kontragent_id
                prixod.value.summa = Number(res.data.summa)
                prixod.value.izoh = res.data.izoh
                for (let i = 0; i < res.data.boshlangich_qodiq_tables.length; i++) {
                    res.data.boshlangich_qodiq_tables[i].price = Number(res.data.boshlangich_qodiq_tables[i].price)
                    res.data.boshlangich_qodiq_tables[i].count = Number(res.data.boshlangich_qodiq_tables[i].count)
                    res.data.boshlangich_qodiq_tables[i].summa = Number(res.data.boshlangich_qodiq_tables[i].summa)

                    prixod.value.prixod_table.push(res.data.boshlangich_qodiq_tables[i])
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
    }
}

onMounted(() => {
    getAllProduct()
    getOnePrixod()
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