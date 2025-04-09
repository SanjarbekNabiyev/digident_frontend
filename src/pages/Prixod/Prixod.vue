<template>
  <div class="container">
    <div class="container_header">
      <div class="header_btn">
        <n-button type="info" @click="registrationAdd">
          <n-icon size="18">
            <PlusCircle />
          </n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('add_btn') }}</span>
        </n-button>
        <n-date-picker v-model:value="timeData.datetime1" type="date" style="width: 150px;" />
        <n-date-picker v-model:value="timeData.datetime2" type="date" style="width: 150px;" />
        <n-button type="info" @click="showInfo">
          <n-icon size="18"><Eye/></n-icon><span style="padding-left: 5px; font-size: 16px; font-weight: 500;">{{ $t('show_btn') }}</span>
        </n-button>
      </div>
      <div class="header_search">
        <input class="search" :placeholder="t('search')" v-model="searchText" type="search" @change="searchPrixod()" />
        <span class="eye"><n-icon size="23" color="#cdcdcd">
            <SearchRound></SearchRound>
          </n-icon></span>
      </div>
    </div>
    <div class="content">
      <n-data-table :pagination="paginationReactive" :columns="columns" :data="prixodList" :row-props="rowProps"
        :max-height="750" striped />
    </div>
  </div>
</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, useDialog } from 'naive-ui'
import { PlusCircle, TrashAltRegular } from '@vicons/fa'
import { SearchRound } from '@vicons/material'
import { Eye } from "@vicons/ionicons5"
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
const searchText = ref(null)
const prixodList = ref([])
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
    title: t('kontragent'),
    key: 'kontragent_name'
  },
  {
    title: t('summa'),
    render(row) {
      return useSummaFormat(row.summa)
    }
  },
  {
    title: t('comment'),
    key: 'izoh',
  },
  {
    title: '',
    key: "action",
    width: 60,
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
                  axios.post('/prixod/delete', row)
                    .then((res) => {
                      getPrixod()
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
      router.push({ name: "PrixodAdd", query: { id: row.id } })
    }
  };
}

const registrationAdd = () => {
  router.push({ name: "PrixodAdd" });
}

const showInfo = () => {
  getPrixod()
}

// Get all prixod api 
const getPrixod = () => {
  let send = { ...timeData.value}
  let endOf = new Date(currentDate);
  endOf.setHours(23, 59, 59, 999);
  send.datetime2 = endOf.getTime()

  axios.post('/prixod/all', send)
    .then(function (res) {
      if (res.data) {
        prixodList.value = res.data
      }
    })
    .catch(function (error) {
      console.log(error.message);
    })
}

// Prixod qidiruv
const searchPrixod = () => {
  if (searchText.value.length > 0) {
    let data = { text: searchText.value }
    axios.post('/prixod/search_prixod', data)
      .then(function (res) {
        prixodList.value = []
        if (res.data) {
          prixodList.value = res.data
        } else {
          message.error('Бундай маълумот йўқ')
        }
      })
      .catch(function (error) {
        prixodList.value = []
      })
  } else {
    getPrixod()
  }
}

onMounted(() => {
  getPrixod()
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