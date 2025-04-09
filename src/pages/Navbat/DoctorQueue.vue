<template>
    <div class="container">
        <div class="container_header" v-if="!disabledSelect">
            <div class="header_btn">
                <n-select 
                    v-model:value="userId" 
                    :options="doctorList" 
                    filterable 
                    clearable
                    label-field="full_name" 
                    value-field="id" 
                    :placeholder="t('xodim')"
                    size="medium" 
                    :disabled="disabledSelect"
                    style="width: 250px;"
                />
                <n-button type="primary" style="width: 120px;" size="medium" @click="filterDoc" :disabled="disabledSelect">{{ $t('show_btn') }}</n-button>
            </div>
            <n-button type="error" style="width: 120px;" size="medium" @click="clearDoc">{{ $t('clear_btn') }}</n-button>
        </div>
        <div class="content">
            <n-data-table :pagination="paginationReactive" :columns="columns" :data="queueList" striped />
        </div>
    </div>

</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, useDialog } from 'naive-ui'
import { PlusCircle, TrashAltRegular } from '@vicons/fa'
import { useRouter } from "vue-router";
import axios from 'axios';
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dayJS = inject('dayJS')
const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const router = useRouter()
const queueList = ref([])
const doctorList = ref([])
const userId = ref(null)
const filialId = ref(Number(localStorage.getItem('user_filial')))
const activeUser = Number(localStorage.getItem('user_role_id'))
const disabledSelect = ref(false)
if (activeUser == 1 || activeUser == 2 || activeUser == 4 || activeUser == 5) {
    userId.value = null;
    disabledSelect.value = false
}else{
    userId.value = Number(localStorage.getItem('user_id'))
    disabledSelect.value = true
}

const columns = [
    {
        title: '№',
        render: (_, index) => {
            return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
        },
    },
    {
        title: t('data'),
        width: 350,
        render(row) {
            return dayJS(row.datetime * 1000).format('YYYY-MM-DD') + ' / ' + dayJS(row.datetime * 1000).format("HH:mm")
        }
    },
    {
        title: t("doctor"),
        key: 'username',
    },
    {
        title: t('bemor_fio'),
        key: 'bemor_name',
    },
    {
        title: t('que_chek'),
        key: 'number',
    },
    {
        title: '',
        key: "action",
        width: 50,
        render(row) {
            return [
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'error',
                        onClick: (e) => {
                            if (!disabledSelect.value) {
                                e.stopPropagation();
                                dialog.info({
                                    title: t('warning'),
                                    content: t('delete_info'),
                                    positiveText: t('delete_btn'),
                                    negativeText: t('cencel_btn'),
                                    onPositiveClick: () => {
                                        axios.delete('/queue/delete/'+row.id)
                                            .then((res) => {
                                                if (res.success) {
                                                    getAllQueue()
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
                                message.error(t('not_change'))
                            }
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

const filterDoc = () => {
    getAllQueue()
}

const clearDoc = () => {
    axios.get('/queue/clear/'+userId.value)
        .then(function (res) {
            if(res.success){
                userId.value = null
                getAllQueue()
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const getAllQueue = () => {
    axios.get('/queue/all/'+userId.value)
        .then(function (res) {
            if(res.success){
                queueList.value = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}
const getAllUser = () => {
    axios.get('/user/shifokor/'+filialId.value)
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
    getAllQueue()
    getAllUser()
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

</script>

<style scoped lang="scss">
.container {
    margin: 10px;
    padding: 10px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    animation: showBox 0.3s ease-in-out forwards alternate;
    height: calc(100vh - 80px);
    overflow: hidden;
    overflow: auto;
}

.container_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
}

.header_btn {
    display: flex;
    align-items: center;
    gap: 5px;
}

.header_search {
    display: flex;
    position: relative;
    width: 35%;

    .search {
        width: 100%;
        border: 1px solid #cdcdcd;
        border-radius: 4px;
        outline: none;
        padding: 6px 10px 6px 30px;
        font-size: 14px;

        &:hover {
            border: 1px solid #007BFF;
        }

        &:focus {
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
            border: 1px solid #007BFF;
        }

        &::placeholder {
            color: #cdcdcd;
            font-family: inherit;
            font-weight: 500;
            font-size: 14px;
        }
    }

    .eye {
        position: absolute;
        top: 50%;
        transform: translateY(-35%);
        left: 5px;
    }
}
</style>