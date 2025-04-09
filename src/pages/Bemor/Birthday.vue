<template>
    <div class="birthday">
        <n-data-table style="max-height: 700px; min-height: 300px; background: #F4F6FD;" :columns="columns" :data="bemorList" :row-key="rowKey" @update:checked-row-keys="chooseBemor" striped/>
        <div class="btn">
            <n-button type="info" @click="confirmBemor">{{ $t('confir_btn') }}</n-button>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, useDialog } from 'naive-ui'
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { useRouter, useRoute } from "vue-router";
import { I18nD, useI18n } from "vue-i18n";
import { useEventBus } from '../../emitter'
import { useCounterStore } from '../../stores/counter';
const counter = useCounterStore()
const emit = defineEmits(['closeModal'])
const eventBus = useEventBus()
const { t, locale } = useI18n()
const router = useRouter()
const dayJS = inject('dayJS')
const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const bemorList = ref([])
const list = ref([])

const columns = [
    {
        type: "selection",
    },
    {
        title: '№',
        render: (_, index) => {
            return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
        },
    },
    {
        title: t('bemor_fio'),
        key: 'full_name'
    },
    {
        title: t('phone_number'),
        render(row){
            return usePhoneFormat(row.phone_number)
        }
    },
    {
        title: t('data'),
        render(row) {
            return dayJS(row.birthday * 1000).format('YYYY-MM-DD')
        }
    },
    {
        title: t('region'),
        key: 'viloyat_name'
    },
]

const getBemor = () => {
    axios.get('/bemor/birthday')
    .then(function (res) {
      if(res.success){
        bemorList.value = res.data
      }
    })
    .catch(function (error) {
      console.log(error.message);
    })
}

const rowKey = (row) => row.id

const chooseBemor = (e) => {
    list.value = e
}

const confirmBemor = () => {
    if(list.value.length > 0){
        emit('closeModal')
        counter.birthdayData = list.value
        eventBus.$emit('chooseBemorList', list.value)
        router.push({ name: 'SMS_send' })
    }else{
        notification.error({
            content: t('error'),
            meta: t('choose_bemor'),
            duration: 2500,
            keepAliveOnHover: false
        })
    }
}

onMounted(() => {
    getBemor()
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
.birthday{
    display: flex;
    flex-direction: column;
    gap: 10px;
    .btn{
        display: flex;
        align-items: center;
        justify-content: end;
        gap: 10px;
    }
}
</style>