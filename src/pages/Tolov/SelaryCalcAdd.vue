<template>
    <div class="prixod">
        <div class="prixod_head">
            <div class="title">{{ $t('maosh') }}</div>
            <div class="exit">
                <n-icon size="40" color="red" @click="exit">
                    <CloseSquareFilled />
                </n-icon>
            </div>
        </div>
        <div class="prixod_content">
            <n-form
                style="display: grid; grid-template-columns: 0.11fr 0.25fr 0.25fr 0.45fr; align-items: center; gap: 15px;"
                ref="formRef" :model="prixod" :rules="rules">
                <n-form-item :label="t('data')">
                    <n-date-picker v-model:value="prixod.datetime" type="date" size="large" disabled />
                </n-form-item>
                <n-form-item :label="t('xisobchi')" path="user_id">
                    <n-select v-model:value="prixod.user_id" :options="poatavshikList" filterable label-field="full_name" value-field="id" :placeholder="t('xisobchi')" size="large" disabled></n-select>
                </n-form-item>
                <!-- <n-form-item label="Тўлов тури">
                    <n-select v-model:value="prixod.paytype" :options="payTypeList" size="large" value-field="id" label-field="id" />
                </n-form-item> -->
                <n-form-item :label="t('total_summa')">
                    <n-input-number v-model:value="prixod.summa" type="text" placeholder="0.00" size="large" :show-button="false" style="width: 100%;" disabled :parse="useParsenumber" :format="useFormatnumber" />
                </n-form-item>
                <n-form-item :label="t('comment')" path="comment">
                    <n-input v-model:value="prixod.comment" type="text" placeholder="" size="large" />
                </n-form-item>
            </n-form>
        </div>
        <div class="prixod_info">
            <table border="#000" style="width: 100%;">
                <thead>
                    <th style="width: 5%;">№</th>
                    <th style="width: 35%;">{{ $t('1_emp') }}</th>
                    <th style="width: 20%;">{{ $t('amount_paytype') }}</th>
                    <th style="width: 35%;">{{ $t('summa') }}</th>
                    <th style="width: 3%;"></th>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in prixod.prixod_table" :key="index">
                        <th>{{ index + 1 }}</th>
                        <td><n-select v-model:value="item.user_id" :options="productList" @update:value="chooseXodim(item)" filterable label-field="full_name" value-field="id" :placeholder="t('1_emp')" size="large"/></td>
                        <td><n-select v-model:value="item.paytype" :options="payTypeList" size="large" value-field="id" label-field="id" /></td>
                        <td><n-input-number v-model:value="item.summa" size="large" :placeholder="t('summa')" @update:value="yigindi(item)" :show-button="false" :parse="useParsenumber" :format="useFormatnumber" /></td>
                        <th style="width: 50px; padding: 5px;"><div class="delete" @click="deleteRow(item, index)"><n-icon size="25" color="red"><DeleteFilled /></n-icon></div></th>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="prixod_btn">
            <div class="button">
                <n-button type="info" size="large" style="width: 180px;" @click="addRow">
                    <n-icon size="20">
                        <PlusOutlined />
                    </n-icon>
                    {{ $t('add_btn') }}
                </n-button>
                <n-button type="warning" size="large" style="width: 180px;" @click="downloadXodim">
                    <n-icon size="20">
                        <DownloadOutlined/>
                    </n-icon>
                    {{ $t('upload_btn') }}
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
import { CloseSquareFilled, PlusOutlined, DeleteFilled, DownloadOutlined } from '@vicons/antd'
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
const poatavshikList = ref([])
const productList = ref([])
const loading = ref(false);

const rules = {
    user_id: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('xisobchi_midd'))
            }
        }
    },
    comment: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('comment_name_midd'))
            }
        }
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

const prixod = ref({
    datetime: new Date().getTime(),
    user_id: Number(localStorage.getItem('user_id')),
    summa: 0,
    paytype: 'Нақд',
    comment: null,
    key: Math.floor(new Date().getTime() / 1000),
    prixod_table: []
})

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
        user_id: null,
        paytype: 'Нақд',
        summa: null,
    })
}
const deleteRow = (item, index) => {
    prixod.value.prixod_table.splice(index, 1);
    // axios.post('/prixod/delete-prixod-table/' + item.id)
    //     .then(function (res) {
    //     })
    //     .catch(function (error) {
    //         console.log(error.message);
    //     })

    yigindi(item)
}

const clearBack = () => {
    prixod.value.prixod_table = [];
    router.go(-1)
}

const saveDoc = async () => {
    try {
        const result = await formRef.value?.validate();

        if (prixod.value.prixod_table.length > 0 && prixod.value.prixod_table[0].user_id) {
            loading.value = true;
            
            let method;
            if (route.query.id) {
                method = axios.patch('/selary/update/' + route.query.id, prixod.value)
            } else {
                method = axios.post('/selary/create', prixod.value)
            }

            method.then(function (res) {
                if(res.success){
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

const yigindi = (e) => {
    if (e) {
        prixod.value.summa = 0
        for (let i = 0; i < prixod.value.prixod_table.length; i++) {
            prixod.value.summa += prixod.value.prixod_table[i].summa
        }
    }
}

const chooseXodim = (e) => {
    axios.get('/user/info/'+e.user_id)
    .then(function (res) {
        e.summa = Number(res.data.summa)
        yigindi(res.data.summa)
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

// Get All Api
const getAllKontragent = () => {
    axios.get('/user/all')
        .then(function (res) {
            poatavshikList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}
const getAllProduct = () => {
    axios.get('/user/filter')
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
        axios.get('/selary/info/' + route.query.id)
        .then(function (res) {
            prixod.value.datetime = res.data.datetime * 1000
            prixod.value.user_id = res.data.user_id
            prixod.value.summa = Number(res.data.summa)
            prixod.value.comment = res.data.comment

            for (let i = 0; i < res.data.selary_tables.length; i++) {
                res.data.selary_tables[i].summa = Number(res.data.selary_tables[i].summa)

                prixod.value.prixod_table.push(res.data.selary_tables[i])
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }
}

const downloadXodim = () => {
    if(prixod.value.prixod_table.length > 0) {
        dialog.warning({
        title: t('warning'),
        content: t('empty_info'),
        positiveText: t('upload_btn'),
        negativeText: t('cencel_btn'),
        onPositiveClick: () => {
            axios.get('/user/filter')
            .then(function (res) {
                prixod.value.prixod_table = []
                prixod.value.summa = 0
                for (let i = 0; i < res.data.length; i++) {
                    let el = res.data[i]
                    prixod.value.summa += parseFloat(el.summa)
                    prixod.value.prixod_table.push({
                        user_id: el.id,
                        paytype: 'Нақд',
                        summa: parseFloat(el.summa),
                    })
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
        },
        onNegativeClick: () => {
        }
    })
    }else{
        axios.get('/user/filter')
            .then(function (res) {
                prixod.value.prixod_table = []
                for (let i = 0; i < res.data.length; i++) {
                    let el = res.data[i]
                    prixod.value.summa += parseFloat(el.summa)
                    prixod.value.prixod_table.push({
                        user_id: el.id,
                        paytype: 'Нақд',
                        summa: parseFloat(el.summa),
                    })
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
    }
}

onMounted(() => {
    getAllKontragent()
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