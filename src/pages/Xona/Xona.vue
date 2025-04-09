<template>
  <div class="container">
      <div class="container_header">
          <div class="header_btn">
              <n-button type="info" @click="registrationAdd">
                <n-icon size="18"><PlusCircle/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('add_btn') }}</span>
              </n-button>
          </div>
          <div class="header_search">
            <input class="search" :placeholder="t('search')" v-model="searchText" type="search" @change="searchXona()"/>
            <span class="eye"><n-icon size="23" color="#cdcdcd"><SearchRound></SearchRound></n-icon></span>
          </div>
      </div>
      <div class="content">
        <n-data-table
          :pagination="paginationReactive"
          :columns="columns"
          :data="xodimList"
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
    :title="xonaId ? t('update') : t('add_btn')"
  >
    <XonaAdd @close="closeModal" :xonaId="xonaId"/>
  </n-modal>
</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, useDialog } from 'naive-ui'
import { SearchRound } from '@vicons/material'
import { PlusCircle, TrashAltRegular } from '@vicons/fa'
import { useRouter } from "vue-router";
import axios from 'axios';
import XonaAdd from '../Xona/XonaAdd.vue'
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const router = useRouter()
const searchText = ref(null)
const xodimList = ref([])
const addedModal = ref(false)
const xonaId = ref(null)

const columns = [
  {
    title: '№',
    render: (_, index) => {
      return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
    },
  },
  {
    title: t('room'),
    key: 'name'
  },
  {
    title: t('filial'),
    key: 'filial_name'
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
                axios.post('/room/delete', row)
                .then((res)=> {
                  if (res.success === false) {
                    notification.error({
                      content: t('error'),
                      meta: t('not_delete_room'),
                      duration: 2500,
                      keepAliveOnHover: false
                    })
                  }else{
                    getXona()
                  }
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
      xonaId.value = row.id;
      addedModal.value = true;
      // router.push({name: "XonaAdd", query: {id: row.id}})
    }
  };
}

const registrationAdd = () => {
  xonaId.value = null;
  addedModal.value = true;
  // router.push({ name: "XonaAdd"});
}

const closeModal = () => {
  addedModal.value = false;
  getXona()
}

// Get all xodim api 
const getXona = () => {
  xodimList.value = []
  axios.get('/room/all')
  .then(function (res) {
    xodimList.value = res.data
  })
  .catch(function (error) {
    console.log(error.message);
  })
}

// Xona qidiruv
const searchXona = () => {
  if(searchText.value.length > 0){
    let data = { text: searchText.value}
    axios.post('/room/search', data)
    .then(function (res) {
      xodimList.value = []
      if(res.success){
        xodimList.value = res.data
      }else{
        message.error('Бундай маълумот йўқ')
      }
    })
    .catch(function (error) {
      xodimList.value = []
    })
  }else{
    getXona()
  }
}

onMounted(() => {
  getXona()
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