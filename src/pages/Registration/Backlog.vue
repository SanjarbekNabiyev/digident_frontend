<template>
    <div class="box">
        <div class="content">
            <n-select
                v-model:value="datas.doctorId" 
                :options="doctorList" 
                value-field="id" 
                label-field="full_name" 
                :placeholder="t('xodim_fio')"
                style="width: 250px;"
                filterable 
                clearable
            />
            <n-select
                v-model:value="datas.status" 
                :options="type" 
                value-field="label" 
                label-field="label" 
                :placeholder="t('cost_type')"
                style="width: 250px;"
                filterable 
                clearable
            />
            <n-button @click="getALLType" type="info" style="width: 150px;">{{ $t('show_btn') }}</n-button>
        </div>
        <n-data-table :pagination="paginationReactive" :columns="columns" :data="backlogList" :row-props="rowProps" :max-height="750" :row-class-name="rowClassName" striped />
    </div>
</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, NTag, useDialog } from 'naive-ui'
import { PlusCircle } from '@vicons/fa'
import { TrashCan, Pen } from '@vicons/carbon'
import { RefreshCircle } from "@vicons/ionicons5"
import { SearchRound } from '@vicons/material'
import { useRouter } from "vue-router";
import axios from 'axios';
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dayJS = inject('dayJS')
const router = useRouter()
const message = useMessage()
const notification = useNotification()
const dialog = useDialog()
const currentRole = ref(localStorage.getItem('role'));
const filialId = ref(Number(localStorage.getItem('user_filial')))
const datas = ref({
    doctorId: null,
    status: null 
})

const type = [
    {
        id: 1,
        label: 'Қарздор'
    },
    {
        id: 2,
        label: 'Тўламаган'
    },
]

const columns = [
    {
        title: '№',
        width: 80,
        render: (_, index) => {
            return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
        },
    },
    {
        title: t("data"),
        render(row) {
            return dayJS(row.created_at * 1000).format('YYYY-MM-DD') + ' / ' + dayJS(row.created_at * 1000).format("HH:mm")
        }
    },
    {
        title: t("bemor_id"),
        key: 'bemor_id',
    },
    {
        title: t('bemor_fio'),
        key: 'bemor_name',
    },
    {
        title: t('phone_number'),
        render(row) {
            return usePhoneFormat(row.bemor_phone)
        }
    },
    {
        title: t('xodim_fio'),
        key: 'xodim',
    },
    {
        title: t('total_debt'),
        render(row) {
            return useSummaFormat(row.qarzdorlik_summa)
        }
    },
    {
        title: t('filial'),
        key: 'filial_name',
    },
    {
        title: '',
        key: "action",
        width: 110,
        render(row) {
            return [
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'warning',
                        style: 'border-radius: 5px;',
                        onClick: (e) => {
                            e.stopPropagation();
                            router.push({ name: "RegistrationAdd", query: { id: row.id } })
                        }
                    },
                    {
                        icon: () =>
                            h(NIcon, {
                                size: '20',
                                component: Pen
                            })
                    }
                ),
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'error',
                        style: 'border-radius: 5px;',
                        onClick: (e) => {
                            e.stopPropagation();
                            dialog.info({
                                title: t('warning'),
                                content: t('delete_info'),
                                positiveText: t('delete_btn'),
                                negativeText: t('cencel_btn'),
                                onPositiveClick: () => {
                                    if (currentRole.value == "Dasturchi" || currentRole.value == "Admin" || currentRole.value == "Registrator") {
                                        axios.delete('/registration/delete/' + row.id)
                                            .then((res) => {
                                                getRegistration()
                                            })
                                            .catch(function (error) {
                                                console.log(error.message);
                                            })
                                    } else {
                                        notification.error({
                                            content: t('error'),
                                            meta: t('not_change'),
                                            duration: 2500,
                                            keepAliveOnHover: false
                                        })
                                    }
                                },
                                onNegativeClick: () => {
                                }
                            })
                        }
                    },
                    {
                        icon: () =>
                            h(NIcon, {
                                size: '20',
                                component: TrashCan
                            })
                    }
                ),
            ]
        }
    }
]

const rowClassName = (row) => {
    if (row.qarzdorlik_summa == 0) {
        return "success";
    } if (row.pay_summa == 0) {
        return "danger";
    } if (row.summa != row.pay_summa && row.qarzdorlik_summa > 0) {
        return "warning";
    }
    return "";
}

const getALLType = () => {
    getRegistration()
}

// Get all registration api
const backlogList = ref([])
const getRegistration = () => {
    axios.post('/registration/getall_backlog', datas.value)
        .then(function (res) {
            if (res.data) {
                backlogList.value = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

// Get all bemor api
const doctorList = ref([])
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

onMounted(() => {
    getRegistration("qarz")
    getSHifokor()
})

const paginationReactive = reactive({
    page: 1,
    pageSize: 50,
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

const rowProps = (row) => {
    return {
        style: "cursor: pointer;",
        onClick: () => {
            router.push({ name: "RegistrationAdd", query: { id: row.id } })
        }
    };
}
</script>

<style scoped lang="scss">
.box {
    margin: 10px;
    padding: 10px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    animation: showBox 0.3s ease-in-out forwards alternate;
    height: calc(100vh - 80px);
    overflow: hidden;
    overflow: auto;
    position: relative;
}
.content{
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
}

:deep(.danger td) {
    color: #5c5c5c;
    background-color: #F5C6CB !important;
    font-weight: 600;
}

:deep(.success td) {
    color: #5c5c5c;
    background-color: #b8f7c6 !important;
    font-weight: 600;
}

:deep(.warning td) {
    color: #5c5c5c;
    background-color: #f7d490 !important;
    font-weight: 600;
}
</style>