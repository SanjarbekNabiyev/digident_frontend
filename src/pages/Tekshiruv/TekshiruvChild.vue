<template>
  <div class="container">
    <div class="container_header">
      <div class="header_btn">
        <n-button type="info" @click="showInfo">
          <n-icon size="18"><PlusCircle/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('add_btn') }}</span>
        </n-button>
      </div>
      <div class="header_search">
        <input class="search" :placeholder="t('search')" v-model="searchText" type="search" @change="searchTekshiruv()"/>
        <span class="eye"><n-icon size="23" color="#cdcdcd"><SearchRound></SearchRound></n-icon></span>
      </div>
    </div>
    <div class="content">
      <n-data-table
        :pagination="paginationReactive"
        :columns="columns"
        :data="tekshiruvList"
        :row-props="rowProps"
        striped
      />
    </div>
  </div>

  <n-modal
    v-model:show="addedModal"
    class="custom-card"
    preset="card"
    :style="{width: '1000px'}"
    :title="tekshiruvId ? t('update') : t('add_btn')"
  >
    <TekshiruvChildAdd @close="closeModal" :tekshiruvId="tekshiruvId"/>
  </n-modal>
</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, useDialog } from 'naive-ui'
import { SearchRound } from '@vicons/material'
import { PlusCircle, TrashAltRegular } from '@vicons/fa'
import { TrashCan, Pen } from '@vicons/carbon'
import { useRouter } from "vue-router";
import axios from 'axios';
import TekshiruvChildAdd from '../Tekshiruv/TekshiruvChildAdd.vue'
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dialog = useDialog()
const router = useRouter()
const message = useMessage()
const searchText = ref(null)
const tekshiruvList = ref([])
const addedModal = ref(false)
const tekshiruvId = ref(null)

const columns = [
  {
    title: '№',
    render: (_, index) => {
      return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
    },
  },
  {
    title: t('ins_name'),
    key: 'name',
    style: 'width: 250px'
  },
  {
    title: t('ins_category'),
    key: 'inspection_category_name'
  },
  {
    title: t('price'),
    // key: 'summa',
    render(row){
      return useSummaFormat(row.summa)
    }
  },
  // {
  //   title: 'Филиал',
  //   key: 'filial_name',
  // },
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
            style: 'border-radius: 5px;',
            onClick: (e) => {
              e.stopPropagation();
              dialog.info({
                title: t('warning'),
                content: t('delete_info'),
                positiveText: t('delete_btn'),
                negativeText: t('cencel_btn'),
                onPositiveClick: () => {
                  axios.post('/inspection/delete/' + row.id)
                  .then((res)=> {
                    getAllInspection()
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
              size: '20',
              component: TrashCan
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
      tekshiruvId.value = row.id
      addedModal.value = true;
      // router.push({name: "TekshiruvChildAdd", query: {id:row.id}})
    }
  };
}

const showInfo = () => {
  tekshiruvId.value = null;
  addedModal.value = true;
  // router.push({name: "TekshiruvChildAdd"})
}

const closeModal = () => {
  addedModal.value = false;
  getAllInspection()
}

const getAllInspection = () => {
  axios.get('/inspection/all')
  .then((res)=> {
    tekshiruvList.value = [];
    for(let i = 0; i < res.data.length; i++){
        if(res.data[i].summa){
          res.data[i].summa = res.data[i].summa.toLocaleString("en-US")
        }
        tekshiruvList.value.push(res.data[i])
    }
    // tekshiruvList.value = res.data
  })
  .catch(function (error) {
    console.log(error.message);
  })
}

// Tekshiruv bolim qidiruv api
const searchTekshiruv = () => {
  if(searchText.value.length > 0){
    let data = { text: searchText.value}
    axios.post('/inspection/search', data)
    .then(function (res) {
      tekshiruvList.value = []
      if(res.success){
        for(let i = 0; i < res.data.length; i++){
          if(res.data[i].updated_at){
            res.data[i].updated_at = new Date(res.data[i].updated_at * 1000).toLocaleDateString() + ' / ' + new Date(res.data[i].updated_at * 1000).toLocaleTimeString()
          }
          tekshiruvList.value.push(res.data[i])
        }
      }else{
        message.error('Бундай маълумот йўқ')
      }
    })
    .catch(function (error) {
      tekshiruvList.value = []
    })
  }else{
    getAllInspection()
  }
}

onMounted(() => {
  getAllInspection()
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