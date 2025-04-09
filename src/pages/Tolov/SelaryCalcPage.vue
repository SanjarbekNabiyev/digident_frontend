<template>
    <div class="container">
        <div class="container_header">
            <div class="header_btn">
                <n-button type="info" @click="registrationAdd">
                    <n-icon size="18">
                        <PlusCircle />
                    </n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('add_btn') }}</span>
                </n-button>
                <!-- <n-button type="success" @click="salaryCalc">
                    <n-icon size="18">
                        <MoneyHand24Filled />
                    </n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">Ойлик хисоблаш</span>
                </n-button> -->
            </div>
            <div class="header_search">
                <input class="search" :placeholder="t('search')" v-model="searchText" type="search"
                    @change="searchXodim()" />
                <span class="eye"><n-icon size="23" color="#cdcdcd">
                        <SearchRound></SearchRound>
                    </n-icon></span>
            </div>
        </div>
        <div class="content">
            <n-data-table :pagination="paginationReactive" :columns="columns" :data="tolovList" :row-props="rowProps"
                striped />
        </div>
    </div>

    <!-- <n-modal v-model:show="addedModal" class="custom-card" preset="card" :style="{ width: '1200px' }"
        :title="tolovId ? `Ўзгартириш` : `Қўшиш`">
        <SelaryCalcAdd @close="closeModal"/>
    </n-modal> -->
</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, useDialog } from 'naive-ui'
import { PlusCircle, TrashAltRegular } from '@vicons/fa'
import { MoneyHand24Filled } from '@vicons/fluent'
import { SearchRound } from '@vicons/material'
import { useRouter } from "vue-router";
import axios from 'axios';
import TolovAdd from '../Tolov/TolovAdd.vue';
import SelaryCalcAdd from '../Tolov/SelaryCalcAdd.vue';
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dayJS = inject('dayJS')
const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const router = useRouter()
const searchText = ref(null)
const tolovList = ref([])
const addedModal = ref(false)
const selaryModal = ref(false)
const tolovId = ref(null)

const columns = [
    {
        title: '№',
        render: (_, index) => {
            return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
        },
    },
    {
        title: t('data'),
        render(row) {
            return dayJS(row.datetime * 1000).format('YYYY-MM-DD') + ' / ' + dayJS(row.datetime * 1000).format("HH:mm")
        }
    },
    {
        title: t('xodim_fio'),
        key: 'xodim'
    },
    {
        title: t('summa'),
        render(row) {
            return useSummaFormat(row.summa)
        }
    },
    {
        title: t('comment'),
        key: 'comment',
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
                        e.stopPropagation();
                        dialog.info({
                            title: t('warning'),
                            content: t('delete_info'),
                            positiveText: t('delete_btn'),
                            negativeText: t('cencel_btn'),
                            onPositiveClick: () => {
                            axios.post('/selary/delete', row)
                            .then((res)=> {
                                getTolov()
                            })
                            .catch(function (error) {
                                console.log(error.message);
                            })
                            },
                            onNegativeClick: () => {
                            }
                        })
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

const rowProps = (row) => {
    return {
        style: "cursor: pointer;",
        onClick: () => {
            router.push({ path: 'selary_add', query: { id: row.id }})
        }
    };
}

const registrationAdd = () => {
    router.push({ path: 'selary_add'})
    // tolovId.value = null;
    // addedModal.value = true;
}
const closeModal = () => {
    addedModal.value = false;
    getTolov()
}

// Get all Tolov api
const getTolov = () => {
    axios.get('/selary/all')
        .then(function (res) {
            tolovList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

// Search tolov api
const searchXodim = () => {
    if (searchText.value.length > 0) {
        let data = { text: searchText.value }
        axios.post('/selary/search', data)
            .then(function (res) {
                tolovList.value = res.data
            })
            .catch(function (error) {
                console.log(error.message);
            })
    } else {
        getTolov()
    }
}

onMounted(() => {
    getTolov()
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
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 10px;
}

.header_btn {
    display: flex;
    align-items: center;
    gap: 15px;
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