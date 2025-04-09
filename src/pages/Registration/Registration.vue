<template>
  <div class="container">
    <div class="container_header">
      <div class="header_btn">
        <n-button type="info" @click="registrationAdd" v-if="currentRole != 'Shifokor'">
          <n-icon size="18">
            <PlusCircle />
          </n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('add_btn') }}</span>
        </n-button>
        <n-date-picker v-model:value="timeData.datetime1" type="date" style="width: 150px;" />
        <n-date-picker v-model:value="timeData.datetime2" type="date" style="width: 150px;" />
        <n-button type="info" @click="refreshInfo">
          <n-icon size="22">
            <RefreshCircle/>
          </n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('ref_btn') }}</span>
        </n-button>
      </div>
      <div style="display: flex; align-items: center; gap: 15px;">
        <!-- <div class="bemorId">
          <n-input-number v-model:value="bemorIdSearchText" style="width: 130px;" :placeholder="t('bemor_id')" :show-button="false" @keyup="onPress"/>
          <n-button type="info" @click="searchBemorId">{{ $t('search') }}</n-button>
        </div> -->
        <div class="header_search">
          <input class="search" :placeholder="t('search')" v-model="searchText" type="search" @change="searchBemor()" />
          <span class="eye"><n-icon size="23" color="#cdcdcd">
              <SearchRound></SearchRound>
            </n-icon></span>
        </div>
      </div>
    </div>
    <div class="content">
      <n-data-table :pagination="paginationReactive" :columns="columns" :data="bemorList" :row-props="rowProps"
        :max-height="750" :row-class-name="rowClassName" striped />
    </div>
  </div>

</template>

<script setup>
import { h, ref, reactive, onMounted, inject } from 'vue'
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
const activUser = localStorage.getItem('role')
const message = useMessage()
const notification = useNotification()
const dialog = useDialog()
const searchText = ref(null)
const bemorIdSearchText = ref(null)
const currentRole = ref(localStorage.getItem('role'));
let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
const endOfDay = new Date(currentDate);
endOfDay.setHours(23, 59, 59, 999);

const timeData = ref({
  datetime1: Math.floor(currentDate.getTime()), 
  datetime2: Math.floor(endOfDay.getTime())
})

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
                  if(currentRole.value == "Dasturchi" || currentRole.value == "Admin" || currentRole.value == "Registrator" || currentRole.value == "Kasser"){
                    axios.delete('/registration/delete/' + row.id)
                    .then((res)=> {
                      getRegistration()
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

// Bemor ID filter
const searchBemorId = () => {
  if (bemorIdSearchText.value) {
    let data = { 
      text: bemorIdSearchText.value,
      type: 'bemorId'
    }
    axios.post('/registration/search', data)
      .then(function (res) {
        if (res.data) {
          bemorList.value = res.data
        } else {
          message.error('Бундай маълумот йўқ')
        }
      })
      .catch(function (error) {
        bemorList.value = []
      })
  } else {
    getRegistration()
  }
}

const onPress = (e) => {
    if (e.key === "Enter") {
      searchBemorId()
    }
}

// Bemor qidiruv
const searchBemor = () => {
  if (searchText.value.length > 0) {
    let data = { text: searchText.value }
    axios.post('/registration/search', data)
      .then(function (res) {
        if (res.data) {
          bemorList.value = res.data
        } else {
          message.error('Бундай маълумот йўқ')
        }
      })
      .catch(function (error) {
        bemorList.value = []
      })
  } else {
    getRegistration()
  }
}

// Get all registration api
const bemorList = ref([])
const getRegistration = () => {
  let send = { ...timeData.value}
  let endOf = new Date(send.datetime2);
  endOf.setHours(23, 59, 59, 999);
  send.datetime2 = endOf.getTime()
  
  axios.post('/registration/getall', send)
  .then(function (res) {
    if (res.data) {
      bemorList.value = res.data
    }
  })
  .catch(function (error) {
    console.log(error.message);
  })
}

onMounted(() => {
  getRegistration()
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

const registrationAdd = () => {
  router.push({ name: "RegistrationAdd" })
}

const refreshInfo = () => {
  getRegistration()
}
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
  width: 600px;

  .search {
    width: 100%;
    border: 1px solid #cdcdcd;
    border-radius: 4px;
    outline: none;
    padding: 7px 10px 6px 30px;
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
.bemorId{
  display: flex;
  align-items: center;
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