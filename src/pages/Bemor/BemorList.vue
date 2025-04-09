<template>
  <div class="container">
    <div class="container_header">
      <div class="header_btn">
        <n-date-picker v-model:value="timeData.datetime1" type="date" style="width: 150px;" />
        <n-date-picker v-model:value="timeData.datetime2" type="date" style="width: 150px;" />
        <n-button type="info" @click="showInfo">
          <n-icon size="18">
            <Eye />
          </n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('show_btn') }}</span>
        </n-button>
      </div>
      <div class="header_search">
        <input class="search" :placeholder="t('search')" v-model="searchText" type="search" @change="searchXodim()" />
        <span class="eye"><n-icon size="23" color="#cdcdcd">
            <SearchRound></SearchRound>
          </n-icon></span>
      </div>
    </div>
    <div class="content">
      <n-data-table :columns="columns" :data="bemorList" :row-props="rowProps" striped :pagination="paginationReactive"/>
    </div>
  </div>
  
  <n-modal
    v-model:show="addedModal"
    class="custom-card"
    preset="card"
    :style="{ width: '1300px' }"
    :title="t('update')"
  >
    <BemorUpdate @close="closeModal" :bemorId="bemorId"/>
  </n-modal>
</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, NTag, useDialog } from 'naive-ui'
import { Eye } from "@vicons/ionicons5"
import { SearchRound } from '@vicons/material'
import { TrashCan, Pen } from '@vicons/carbon'
import { useRouter } from "vue-router";
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import axios from 'axios';
import BemorUpdate from '../Bemor/BemorUpdate.vue'
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const dayJS = inject('dayJS')
const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const searchText = ref(null)
const bemorList = ref([])
const range = ref(null)
const addedModal = ref(false)
const bemorId = ref(null)
const currentRole = ref(localStorage.getItem('role'));

let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
const endOfDay = new Date(currentDate);
endOfDay.setHours(23, 59, 59, 999);

const timeData = ref({
  datetime1: Math.floor(currentDate.setDate(1)), 
  datetime2: Math.floor(endOfDay.getTime())
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
      return dayJS(row.created_at * 1000).format('YYYY-MM-DD') + ' / ' + dayJS(row.created_at * 1000).format("HH:mm")
    }
  },
  {
    title: t('bemor_fio'),
    key: 'full_name',
  },
  {
    title: t('phone_number'),
    render(row) {
      return usePhoneFormat(row.phone_number)
    }
  },
  {
    title: t('region'),
    key: 'viloyat_name',
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
              bemorId.value = row.id
              addedModal.value = true;
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
                  if(currentRole.value == "Dasturchi" || currentRole.value == "Admin" || currentRole.value == "Registrator"){
                    axios.delete('/bemor/delete/' + row.id)
                    .then((res)=> {
                      if(res){
                        getBemor()
                      }
                    })
                    .catch(function (error) {
                      console.log(error.message);
                    })
                  }else{
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

const rowProps = (row) => {
  return {
    style: "cursor: pointer;",
    onClick: () => {
      bemorId.value = row.id
      addedModal.value = true;
    }
  };
}
const closeModal = () => {
  addedModal.value = false;
  getBemor()
}

const showInfo = () => {
  getBemor()
}

// Get all Bemor api
const getBemor = () => {
  let send = { ...timeData.value }
  let endOf = new Date(send.datetime2);
  endOf.setHours(23, 59, 59, 999);
  send.datetime2 = endOf.getTime()
  
  axios.post('/bemor/filter_bemor', send)
  .then(function (res) {
    if(res.success){
      bemorList.value = res.data
    }
  })
  .catch(function (error) {
    console.log(error.message);
  })
}

// Bemor qidiruv
const searchXodim = () => {
  if (searchText.value.length > 0) {
    let data = { text: searchText.value }
    axios.post('/bemor/search', data)
      .then(function (res) {
        if (res.success) {
          bemorList.value = res.data
        } else {
          message.error(t('empty'))
        }
      })
      .catch(function (error) {
        bemorList.value = []
      })
  } else {
    getBemor()
  }
}

onMounted(() => {
  getBemor()
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
    font-size: 15px;

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