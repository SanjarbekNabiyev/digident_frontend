<template>
  <div class="container">
      <div class="container_header">
          <div class="header_btn">
            <n-button strong type="info" @click="kassaOrderAdd">
              <n-icon size="18"><PlusCircle/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('add_btn') }}</span>
            </n-button>
            <n-date-picker v-model:value="timeData.datetime1" type="date" style="width: 150px;" />
            <n-date-picker v-model:value="timeData.datetime2" type="date" style="width: 150px;" />
            <n-button type="info" @click="showInfo">
              <n-icon size="18"><Eye/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('show_btn') }}</span>
            </n-button>
          </div>
          <div class="header_search">
            <input class="search" :placeholder="t('search')" v-model="searchText" type="search" @change="searchKassaOrder()"/>
            <span class="eye"><n-icon size="23" color="#cdcdcd"><SearchRound></SearchRound></n-icon></span>
          </div>
      </div>
      <div class="content">
        <n-data-table
          :pagination="paginationReactive"
          :columns="columns"
          :data="bemorList"
          :row-props="rowProps"
          striped 
        />
      </div>
  </div>

  <n-modal
    v-model:show="addedModal"
    class="custom-card"
    preset="card"
    style="width: 1000px;"
    :title="kassaorderId ? t('update') : t('add_btn')"
  >
    <KassaOrderAdd @close="closeModal" :kassaorderId="kassaorderId"/>
  </n-modal>
</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, useDialog } from 'naive-ui'
import { SearchRound } from '@vicons/material'
import { Eye } from "@vicons/ionicons5"
import { PlusCircle, TrashAltRegular } from '@vicons/fa'
import { useRouter } from "vue-router";
import axios from 'axios';
import KassaOrderAdd from '../KassaviyOrder/KassaviyOrderAdd.vue'
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dayJS = inject('dayJS')
const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const router = useRouter()
const searchText = ref(null)
const bemorList = ref([])
const range = ref(null)
const addedModal = ref(false)
const kassaorderId = ref(null)
let currentDate = new Date();
let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
const nowOfDay = new Date();
nowOfDay.setHours(23, 59, 59, 999);

const timeData = ref({
  datetime1: Math.floor(firstDayOfMonth.getTime()), 
  datetime2: Math.floor(nowOfDay.getTime())
})

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
    title: t("xodim_fio"),
    key: 'xodim',
  },
  {
    title: t('cost_type'),
    key: 'type',
  },
  {
    title: t('pay_type'),
    key: 'paytype',
  },
  {
    title: t('summa'),
    render(row){
      return useSummaFormat(row.summa)
    }
  },
  {
    title: t('comment'),
    key: 'coment',
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
                  axios.post('/kassa-order/delete', row)
                  .then((res)=> {
                    getAllKassaOrder()
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

const kassaOrderAdd = () => {
  kassaorderId.value = null;
  addedModal.value = true;
  // router.push({ name: 'Kassa-order-add' })
}

const closeModal = () => {
  addedModal.value = false;
  getAllKassaOrder()
}

const rowProps = (row) => {
  return {
    style: "cursor: pointer;",
    onClick: () => {
      kassaorderId.value = row.id
      addedModal.value = true;
    }
  };
}

const showInfo = () => {
  getAllKassaOrder()
}


const getAllKassaOrder = () => {
  let send = { ...timeData.value}
  let endOf = new Date(currentDate);
  endOf.setHours(23, 59, 59, 999);
  send.datetime2 = endOf.getTime()
  
  axios.post('/kassa-order/search-time', send)
  .then(function (res) {
    bemorList.value = []
    for(let i = 0; i < res.data.length; i++){
      if(res.data[i].type == 1){
        res.data[i].type = 'Кирим'
      }else{
        res.data[i].type = 'Чиқим'
      }
      bemorList.value.push(res.data[i])
    }
  })
  .catch(function (error) {
    console.log(error.message);
  })
}

// Kassa Order qidiruv api
const searchKassaOrder = () => {
  if(searchText.value.length > 0){
    let data = { text: searchText.value}
    axios.post('/kassa-order/search', data)
    .then(function (res) {
      bemorList.value = []
      if(res.success){
        for(let i = 0; i < res.data.length; i++){
          if(res.data[i].type == 1){
            res.data[i].type = 'Кирим'
          }else{
            res.data[i].type = 'Чиқим'
          }
          bemorList.value.push(res.data[i])
        }
      }else{
        message.error('Бундай маълумот йўқ')
      }
    })
    .catch(function (error) {
      bemorList.value = []
    })
  }else{
    getAllKassaOrder()
  }
}

onMounted(() => {
  getAllKassaOrder()
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
.container{
  margin: 10px;
  padding: 10px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  animation: showBox 0.3s ease-in-out forwards alternate;
  height: calc(100vh - 80px);
  overflow: hidden;
  overflow: auto;
}
.container_header{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 10px;
}
.header_btn{
  display: flex;
  align-items: center;
  gap: 5px;
}
.header_search{
  display: flex;
  position: relative;
  width: 35%;
  .search{
    width: 100%;
    border: 1px solid #cdcdcd;
    border-radius: 4px;
    outline: none;
    padding: 6px 10px 6px 30px;
    font-size: 14px;
    &:hover{
      border: 1px solid #007BFF;
    }
    &:focus{
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
  .eye{
    position: absolute;
    top: 50%;
    transform: translateY(-35%);
    left: 5px;
  }
}
</style>