<template>
    <div class="container">
        <div class="container_header">
            <div class="header_btn">
                <n-button type="info" @click="registrationAdd">
                  <n-icon size="18"><PlusCircle/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('add_btn') }}</span>
                </n-button>
            </div>
            <div class="header_search">
              <input class="search" :placeholder="t('search')" v-model="searchText" type="search" @change="searchXodim()"/>
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
      :title="xodimId ? t('update') : t('add_btn')"
    >
      <XodimAdd @close="closeModal" :xodimId="xodimId"/>
    </n-modal>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted, inject, defineProps, reactive, h } from 'vue'
import { useMessage, useNotification, useDialog, NButton, NIcon, NText } from 'naive-ui'
import { SearchRound } from '@vicons/material'
import { PlusCircle } from '@vicons/fa'
import { TrashCan, Pen } from '@vicons/carbon'
import { useRouter } from "vue-router";
import XodimAdd from '../Xodim/XodimAdd.vue'
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dialog = useDialog()
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const searchText = ref(null)
const xodimList = ref([])
const addedModal = ref(false)
const xodimId = ref(null)

const columns = [
  {
    title: '№',
    render: (_, index) => {
      return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
    },
  },
  {
    title: t('xodim_fio'),
    key: 'full_name'
  },
  {
    title: t('role'),
    key: 'role_name',
  },
  {
    title: t('phone_number'),
    // key: 'phone_number',
    render(row) {
      return usePhoneFormat(row.phone_number)
    }
  },
  {
    title: t('filial'),
    key: 'filial_name',
  },
  // {
  //   title: t('room'),
  //   key: 'room_name',
  // },
  {
    title: t('status'),
    key: 'status',
  },
  // {
  //   title: '',
  //   key: "action",
  //   width: 70,
  //   render(row) {
  //     return [
  //       h(
  //         NButton,
  //         {
  //           size: 'small',
  //           type: 'error',
  //           style: 'border-radius: 5px;',
  //           onClick: (e) => {
  //             e.stopPropagation();
  //             dialog.info({
  //               title: t('warning'),
  //               content: t('delete_info'),
  //               positiveText: t('delete_btn'),
  //               negativeText: t('cencel_btn'),
  //               onPositiveClick: () => {
  //                 // if(currentRole.value == "Dasturchi" || currentRole.value == "Admin" || currentRole.value == "Registrator" || currentRole.value == "Kasser"){
  //                 //   axios.delete('/registration/delete/' + row.id)
  //                 //   .then((res)=> {
  //                 //     getRegistration()
  //                 //   })
  //                 //   .catch(function (error) {
  //                 //     console.log(error.message);
  //                 //   })
  //                 // }else{
  //                 //   notification.error({
  //                 //     content: t('error'),
  //                 //     meta: t('not_change'),
  //                 //     duration: 2500,
  //                 //     keepAliveOnHover: false
  //                 //   })
  //                 // }
  //               },
  //               onNegativeClick: () => {
  //               }
  //             })
  //           }
  //         },
  //         {
  //           icon: () =>
  //             h(NIcon, {
  //               size: '20',
  //               component: TrashCan
  //             })
  //         }
  //       ),
  //     ]
  //   }
  // }
]

const rowProps = (row) => {
  return {
    style: "cursor: pointer;",
    onClick: () => {
      addedModal.value = true;
      xodimId.value = row.id
    }
  };
}

const registrationAdd = () => {
  addedModal.value = true;
  xodimId.value = null
}

const closeModal = () => {
  addedModal.value = false;

  getXodim()
}

// Get all xodim api 
const getXodim = () => {
    axios.get('/user/filter')
    .then(function (res) {
      xodimList.value = res.data
    })
    .catch(function (error) {
      console.log(error.message);
    })
}

// Xodim qidiruv
const searchXodim = () => {
  if(searchText.value.length > 0){
    let data = { text: searchText.value}
    axios.post('/user/search', data)
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
    getXodim()
  }
}

onMounted(() => {
  getXodim()
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