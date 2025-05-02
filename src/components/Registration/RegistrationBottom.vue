<template>
  <div class="wrapper">
    <n-tabs v-model:value="tekShiruvDefaultValue" type="card" size="medium" animated @before-leave="handleBeforeLeave">      <!--:default-value="currentRole == 'Shifokor' ? 'Текширувлар' : 'Навбат олиш'" -->
      <n-tab-pane name="Навбат олиш" :tab="t('doctor')" style="display: flex; flex-direction: column;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- <n-button type="info" size="large" style="width: 150px"
            @click="shifokorModalShow(), (showChange = 'Шифокор қабул вақтлари')">{{ $t('doctor') }}</n-button> -->
        </div>
        <div class="wrapper_item">
          <div class="wrapper_item_card">
            <ShifokorlarModalVue @shifokor="shifokorEmit" :bemor_id="props.bemor_id_prop"
              :shifokorTekshiruvProps="props?.data?.doctor_inspections" />
          </div>
          <div class="wrapper_item_card">
            <n-tabs type="card" size="medium" animated v-if="props?.data?.doctor_inspections.find(el => el.name != null)">
              <n-tab-pane v-for="(item, index) in props?.data?.doctor_inspections" :key="index" :name="index + 1" :tab="item?.name">
                <n-data-table :single-line="false" :columns="shifokorColumns" :data="item.child ? item.child : []" />
              </n-tab-pane>
            </n-tabs>
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="Текширувлар" :tab="t('tek')"
        style="display: flex; align-items: start; flex-direction: column; gap: 10px;">

        <div class="wrapper_tek">
          <TekshiruvlarModalVue @tekshiruv="tekshiruvEmit" :bemor_id="props.bemor_id_prop" />
          <div class="wrapper_tek_card" v-if="props?.data?.registration_inspections.length > 0">
            <n-data-table :single-line="false" :columns="tekshiruvColumns"
              :data="props?.data?.registration_inspections ? props?.data?.registration_inspections : []" />
          </div>
        </div>
      </n-tab-pane>

      <n-tab-pane name="Тўлов" :tab="t('payment')" v-if="currentRole != 'Shifokor'">
        <div class="wrapper_pay">
          <div class="wrapper_pay_item">
            <div class="table">
              <n-data-table :single-line="false" :columns="tolovColumns"
                :data="props?.data?.registration_pays ? props?.data?.registration_pays : []" :min-height="280" :max-height="280"/>
            </div>

            <n-form
              style="display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; gap: 10px; padding: 0 5px; border-top: 1px solid #007Bff;">
              <n-form-item :label="t('total_pay')">
                <n-input-number size="large" placeholder="0.00" v-model:value="totalSum" :show-button="false"
                  :parse="useParsenumber" :format="useFormatnumber" style="width: 100%;" readonly />
              </n-form-item>
              <n-form-item :label="t('total_keshback')">
                <n-input-number size="large" placeholder="0.00" v-model:value="totalSkidka"
                  :status="totalSkidka > 0 ? `warning` : `info`" :show-button="false" :parse="useParsenumber"
                  :format="useFormatnumber" style="width: 100%;" readonly />
              </n-form-item>
              <n-form-item :label="t('total_debt')">
                <n-input-number size="large" placeholder="0.00" v-model:value="totalQarz"
                  :status="totalQarz != 0 ? `error` : `info`" :show-button="false" :parse="useParsenumber"
                  :format="useFormatnumber" readonly style="width: 100%;" />
              </n-form-item>
            </n-form>
          </div>
          <div class="wrapper_pay_button">
            <div class="table">
              <n-data-table :single-line="false" :columns="ordersColumn" :key="dataRefreshKey"
                :data="props?.data?.registration_inspections ? props?.data?.registration_inspections : []"
                :row-class-name="rowClassNameColumn" :row-key="rowKey" @update:checked-row-keys="chooseBemor"
                :min-height="280" :max-height="280" />
            </div>
            <div class="btn">
              <button class="print" @click="printChek()"><n-icon size="30">
                  <Print16Regular />
                </n-icon> <span>{{ $t('chek') }}</span></button>
              <button class="print" @click="printDoctorChek()"><n-icon size="30">
                  <PeopleQueue24Filled />
                </n-icon> <span>{{ $t('que_chek') }}</span></button>
              <!-- <button class="vazvrat"><n-icon size="30">
                  <ArrowReply16Filled />
                </n-icon> <span>{{ $t('vozvrat') }}</span></button> -->
              <button class="success" @click="openPaymeModalShow()"><n-icon size="30">
                  <Money16Regular />
                </n-icon> <span>{{ $t('payment') }}</span></button>
            </div>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- <n-button v-if="tekShiruvDefaultValue == 'Текширувлар'" type="info" size="large" @click="openTekPage" class="printDoctor">{{$t('narxlar')}}</n-button>
    <n-button v-if="tekShiruvDefaultValue == 'Навбат олиш'" type="info" size="large" @click="printDoctorChek" class="printDoctor">{{$t('doctor_chek')}}</n-button> -->
  </div>

  <!-- SHifokor and Tekshiruv -->
  <n-modal v-model:show="shifokorModal" class="custom-card" preset="card"
    :style="showChange == 'Шифокор қабул вақтлари' ? `width: 1100px; height: max-content; background: #F4F6FD; min-height: 300px;` : `width: max-content; height: max-content; background: #F4F6FD; min-height: 300px;`"
    :title="(showChange == 'Шифокор қабул вақтлари') ? t('doctor_time') : t('tooth')">
    <div v-if="showChange == 'Шифокор қабул вақтлари'">
      <ShifokorlarModalVue @shifokor="shifokorEmit" :bemor_id="props.bemor_id_prop"
        :shifokorTekshiruvProps="props?.data?.doctor_inspections" />
    </div>
    <div v-if="showChange == 'Тишлар'">
      <TekshiruvlarModalVue @tekshiruv="tekshiruvEmit" :bemor_id="props.bemor_id_prop" />
    </div>
  </n-modal>
  <!-- SHifokor and Tekshiruv -->

  <!-- Texnik qoshish -->
  <n-modal v-model:show="texnikModal" class="custom-card" preset="card" style="width: 1100px; background-color: #fff;"
    :title="t('texnik')">
    <TexnikModalVue @texnik="texnikEmit" :tekshiruvIndex="tekshiruvIndex" />
  </n-modal>
  <!-- Texnik qoshish -->

  <!-- Texnik Tekshiruv -->
  <n-modal v-model:show="texnikListModal" class="custom-card" preset="card" style="width: 1100px; background-color: #fff;" :title="t('texnik')">
    <TexnikTekshiruvModal :texnikTekshiruv="texnikListIndex" />
  </n-modal>
  <!-- Texnik Tekshiruv -->

  <!-- Upload Modal -->
  <n-modal v-model:show="uploadModal" class="custom-card" preset="card" style="width: 600px; background: #fff" :title="t('download')">
    <n-spin :show="show">
      <n-upload :onFinish="onFinish" :action="BaseUrl+'/inspection/upload'" v-model:file-list="upload" accept="image/*" :max="1">
        <n-upload-dragger accept="image/png, image/jpeg">
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <CloudUpload />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">
            Fayl yuklash uchun bosing
          </n-text>
        </n-upload-dragger>
      </n-upload>
    </n-spin>
    <div style="display: flex; justify-content: flex-end">
      <n-button type="primary" @click="closeUploadModal">{{ $t('close_btn') }}</n-button>
    </div>
  </n-modal>
  <!-- Upload Modal -->

  <!-- Tekshiruv Page Tekshiruv -->
  <n-modal v-model:show="tekPage" class="custom-card" preset="card" style="width: 1200px; background-color: #fff;" :title="t('tek')">
    <TekshiruvlarPage />
  </n-modal>
  <!-- Tekshiruv Page Tekshiruv -->

  <!-- Update Tekshiruv summa -->
  <n-modal v-model:show="updateTekSummaModal" class="custom-card" preset="card" style="width: 400px; background-color: #fff;" :title="t('summa')">
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <n-input-number v-model:value="tekSumma.summa" :show-button="false" :parse="useParsenumber" :format="useFormatnumber" size="large" style="font-weight: 600;"/>
      <n-button type="primary" @click="updateTekSumma" size="large">{{ $t('save_btn') }}</n-button>
    </div>
  </n-modal>
  <!-- Update Tekshiruv summa -->

  <n-modal v-model:show="confirmPayModal" class="custom-card" preset="card" style="width: 80%; background-color: #fff;"
    :title="t('payment')" :max-height="750">
    <div class="orders">
      <div class="table">
        <n-data-table :single-line="false" :columns="ordersTable" :data="orderList" :min-height="280" :max-height="320"/>
      </div>
      <div class="info">
        <n-form style="display: flex; flex-direction: column; gap: 10px;">
          <n-form-item :label="t('amount_pay')">
            <n-input-number v-model:value="payData.pay_summa" size="large" placeholder="0.00" :onUpdate:value="paySumma"
              :show-button="false" :parse="useParsenumber" :format="useFormatnumber" style="width: 100%;"
              :disabled="orderList.length !== 1" />
          </n-form-item>
          <div style="display: flex; align-items: center; gap: 5px;">
            <n-form-item :label="t('amount_kesh')">
              <n-input-number v-model:value="payData.skidka_summa" size="large" placeholder="0.00"
                @update:value="skidkaSumma" :show-button="false" :parse="useParsenumber" :format="useFormatnumber"
                style="width: 100%;" :disabled="orderList.length !== 1" />
            </n-form-item>
            <n-form-item :label="t('amount_kesh') + ' ' + ('(%)')">
              <n-input-number v-model:value="payData.skidka_foiz" :show-button="false" style="width: 100%;"
                @update:value="skidkaFoiz" placeholder="" size="large" :disabled="orderList.length !== 1">
                <template #suffix>%</template>
              </n-input-number>
            </n-form-item>
          </div>
          <n-form-item :label="t('amount_paytype')">
            <n-select v-model:value="payData.paytype" :options="paytypeList" value-field="name" label-field="name"
              :placeholder="t('amount_paytype')" size="large" />
          </n-form-item>
          <button class="success" @click="paymeModalShow()"><n-icon size="30">
              <Money16Regular />
            </n-icon> <span>{{ $t('confir_btn') }}</span></button>
        </n-form>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import axios from 'axios';
import { useEventBus } from '../../emitter'
import { h, ref, onMounted, defineEmits, watch, inject, computed } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useMessage, useNotification, NButton, NIcon, NText, useDialog, NImage, NInput, NSpace, NDatePicker } from 'naive-ui'
import ShifokorlarModalVue from "../Shifokorlar/ShifokorlarModal.vue";
import TekshiruvlarModalVue from '../Tekshiruvlar/TekshiruvlarModal.vue'
import TexnikModalVue from "../../pages/Texnik/Modal.vue";
import TexnikTekshiruvModal from '../../pages/Texnik/TexnikTekshiruvModal.vue';
import TekshiruvlarPage from '../Tekshiruvlar/TekshiruvlarPage.vue';
import { useSummaFormat, useParsenumber, useFormatnumber } from '../../composible/NumberFormat';
import { Money16Regular, Print16Regular, PeopleQueue24Filled, ArrowReply16Filled, Delete24Filled } from '@vicons/fluent';
import { PlusFilled, RemoveRedEyeFilled } from '@vicons/material'
import { DownloadOutlined } from '@vicons/antd'
import { CloudUpload, Pen } from '@vicons/carbon'
import { I18nD, useI18n } from "vue-i18n";
const BaseUrl = import.meta.env.VITE_BASE_URL
const { t, locale } = useI18n()
const emit = defineEmits(['shifokor', 'tekshiruv', 'texnik', 'printChek', 'pay', 'tekImage', 'updateTekSumma', 'updateShifokorTime'])
const props = defineProps(['bemor_id_prop', 'data'])
const dayJS = inject('dayJS')
const filialId = ref(Number(localStorage.getItem('user_filial')))
const currentRole = ref(localStorage.getItem('role'));
const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const router = useRouter()
const route = useRoute()
const showChange = ref(null)
const shifokorModal = ref(false)
const texnikModal = ref(false)
const uploadModal = ref(false)
const upload = ref([])
const show = ref(false)
const texnikListModal = ref(false)
const tekPage = ref(false)
const qarzdorlik = inject('summa')
const eventBus = useEventBus()
const tekshiruvIndex = ref(null)
const texnikListIndex = ref(null)
const dataRefreshKey = ref(0);
const orderList = ref([])
const confirmPayModal = ref(false)
const tekShiruvDefaultValue = ref('Навбат олиш')
// const tekShiruvDefaultValue = ref(currentRole.value == 'Shifokor' ? 'Текширувлар' : 'Навбат олиш')

const refreshTable = () => {
  dataRefreshKey.value++;
};

const tekSumma = ref({
  index: null,
  summa: null
})
const updateTekSummaModal = ref(false)

const shifokorColumns = [
  {
    title: "#",
    width: 50,
    render(row, index) {
      return index + 1
    }
  },
  {
    title: t('doctor'),
    key: "xodim",
  },
  {
    title: t("data"),
    width: 200,
    render(row, index) {
      return h("div", { style: "display: flex; align-items: center; gap: 10px;" }, [
        h(NDatePicker, {
          type: "datetime",
          value: row.inspection_time * 1000,
          format: "yyyy-MM-dd HH:mm",
          onUpdateValue: (newValue) => {
            let data = {
              time: newValue,
              index: index
            }
            emit('updateShifokorTime', data)
          }
        }),
      ]);
    }
  },
  {
    title: t('room'),
    key: "room_name",
  },
  {
    title: "",
    key: "actions",
    width: 50,
    render(row, index) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: (e) => {
              if (currentRole.value == "Dasturchi" || currentRole.value == "Admin" || currentRole.value == "Registrator" || currentRole.value == "Kasser") {
                deleteShifokor(row, index)
              } else {
                notification.error({
                  content: t('error'),
                  meta: t('not_change'),
                  duration: 2500,
                  keepAliveOnHover: false
                })
              }
            }
          },
          {
            icon: () =>
              h(NIcon, {
                component: Delete24Filled
              })
          }
        ),
      ]
    }
  }
];

const tekshiruvColumns = [
  {
    title: "#",
    key: "name",
    width: 50,
    render(row, index) {
      return index + 1
    }
  },
  {
    title: t('teeth_number'),
    render(row) {
      return [
        h(
          'div',
          {
            innerText: row.number
          },
          []
        ),
      ]
    }
  },
  {
    title: t('ins_name'),
    key: 'inspection_name'
  },
  {
    title: t('doctor'),
    key: "doctor_name"
  },
  {
    title: "Нархи",
    width: 300,
    render(row, index) {
      return h (
        NSpace, {},
        [
          h(
            'input',
            {
              style: 'border: none; outline: none; background-color: inherit;font-size: 16px;',
              disabled: true,
              value: useSummaFormat(row.inspection_summa)
            },
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              onClick: (e) => {
                updateTekSummaModal.value = true
                tekSumma.value.index = index
                tekSumma.value.summa = Number(row.inspection_summa)
              }
            },
            {
              icon: () =>
                h(NIcon, {
                  component: Pen
                })
            }
          )
        ]
      )
    }
  },
  {
    title: t('status'),
    render(row) {
      return [
        row.image ? 
        h(
          NImage,
          {
            src: `${BaseUrl}/uploads/${row.image}`,
            width: 50,
            height: 30
          }
        ) : null
      ]
    }
  },
  {
    title: "",
    key: "actions",
    width: 120,
    render(row, index) {
      return [
        row.inspection_type ?
          h(
            NButton,
            {
              size: 'small',
              type: 'warning',
              style: 'display:flex; align-items:center; justify-content: center',
              onClick: (e) => {
                texnikListIndex.value = {
                  model: row.registration_texniks,
                  index: index
                }
                texnikListModal.value = true
              }
            },
            {
              icon: () =>
                h(NIcon, {
                  component: RemoveRedEyeFilled
                })
            }
          ) : null,
        row.inspection_type ?
          h(
            NButton,
            {
              size: 'small',
              type: 'success',
              style: 'display:flex; align-items:center; justify-content: center',
              onClick: (e) => {
                tekshiruvIndex.value = index;
                texnikModal.value = true;
              }
            },
            {
              icon: () =>
                h(NIcon, {
                  component: PlusFilled
                })
            }
          ) : null,
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              style: 'display:flex; align-items:center; justify-content: center',
              onClick: (e) => {
                tekshiruvIndex.value = index;
                uploadModal.value = true;
              }
            },
            {
              icon: () =>
                h(NIcon, {
                  component: DownloadOutlined
                })
            }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              style: 'display:flex; align-items:center; justify-content: center',
              onClick: (e) => {
                deleteTekshiruv(row, index)
                // if (currentRole.value == "Dasturchi" || currentRole.value == "Admin" || currentRole.value == "Registrator" || currentRole.value == "Kasser") {
                // } else {
                //   notification.error({
                //     content: t('error'),
                //     meta: t('not_change'),
                //     duration: 2500,
                //     keepAliveOnHover: false
                //   })
                // }
              }
            },
            {
              icon: () =>
                h(NIcon, {
                  component: Delete24Filled
                })
            }
          ),
      ]
    }
  }
]

const tolovColumns = [
  {
    title: "#",
    key: "name",
    width: 50,
    render(row, index) {
      return index + 1
    }
  },
  {
    title: t('total_pay'),
    render(row) {
      return useSummaFormat(row.pay_summa)
    }
  },
  {
    title: t('total_keshback'),
    render(row) {
      return useSummaFormat(row.skidka_summa || 0)
    }
  },
  {
    title: t('amount_paytype'),
    key: "paytype"
  },
  {
    title: t('data'),
    render(row) {
      return dayJS(row.datetime * 1000).format('DD.MM') + ' / ' + dayJS(row.datetime * 1000).format("HH:mm")
    }
  },
  {
    title: t('comment'),
    key: "izoh"
  },
  {
    title: "",
    key: "actions",
    width: 55,
    render(row, index) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: (e) => {
              if (currentRole.value == "Dasturchi" || currentRole.value == "Admin" || currentRole.value == "Registrator" || currentRole.value == "Kasser") {
                deletePay(row, index)
              } else {
                notification.error({
                  content: t('error'),
                  meta: t('not_change'),
                  duration: 2500,
                  keepAliveOnHover: false
                })
              }
            }
          },
          {
            icon: () =>
              h(NIcon, {
                component: Delete24Filled
              })
          }
        ),
      ]
    }
  }
]

const ordersColumn = [
  {
    type: "selection",
    disabled(row) {
      return Number(row.backlog_summa) <= 0;
    }
  },
  {
    title: t('teeth_number'),
    key: 'number',
    width: 120
  },
  {
    title: t('name'),
    key: 'inspection_name'
  },
  {
    title: t('total_pay'),
    width: 150,
    render(row) {
      return useSummaFormat(row.pay_summa) || 0
    }
  },
  {
    title: t('total_keshback'),
    width: 140,
    render(row) {
      return useSummaFormat(row.skidka_summa || 0)
    }
  },
  {
    title: t('total_debt'),
    width: 140,
    render(row) {
      return useSummaFormat(row.backlog_summa || 0)
    }
  },
]

const ordersTable = [
  {
    title: "#",
    key: "name",
    width: 50,
    render(row, index) {
      return index + 1
    }
  },
  {
    title: t('teeth_number'),
    key: 'number',
    width: 120
  },
  {
    title: t('name'),
    key: 'inspection_name'
  },
  {
    title: t('total_pay'),
    width: 150,
    render(row) {
      return useSummaFormat(row.pay_summa || 0)
    }
  },
  {
    title: t('total_keshback'),
    width: 140,
    render(row) {
      return useSummaFormat(row.skidka_summa || 0)
    }
  },
  {
    title: t('total_debt'),
    width: 140,
    render(row) {
      return useSummaFormat(row.backlog_summa || 0)
    }
  },
]

const paytypeList = [
  {
    name: 'Нақд'
  },
  {
    name: 'Пластик'
  },
  {
    name: 'Kлик'
  }
]

const updateTekSumma = () => {
  if(tekSumma.value.summa) {
    emit('updateTekSumma', {
      index: tekSumma.value.index,
      summa: Number(tekSumma.value.summa)
    });
    updateTekSummaModal.value = false;
  }
}

const bemorId = ref(null)
eventBus.$on('bemorId', (id) => {
  bemorId.value = id
})

// Get all shifokor api
const shifokorList = ref([])
const getAllShifokor = () => {
  axios.get('/user/shifokor/' + filialId.value)
    .then(function (res) {
      shifokorList.value = res.data
    })
    .catch(function (error) {
      console.log(error.message);
    })
}

const shifokorEmit = (data) => {
  if (data) {
    let datas = {
      xodim: data.xodim,
      time: data.time,
      bemor_id: data.bemor_id,
      doctor_id: data.doctor_id,
      inspection_time: data.inspection_time,
      between_time: data.between_time,
      comment: data.comment,
      summa: data.korik_summa,
      foiz: data.foiz,
      korik_summa: data.korik_summa,
      room_id: data.room_id,
      room_name: data.room_name,
      key: data.key,
      color: data.color
    }
    emit('shifokor', datas);
  }
}

const tekshiruvEmit = (data) => {
  if (data) {
    let datas = {
      datetime: data.datetime,
      doctor_id: data.doctor_id,
      bemor_id: data.bemor_id,
      teeth_id: data.teeth_id,
      name: data.name,
      number: data.number,
      inspection_name: data.inspection_name,
      summa: data.inspection_summa,
      pay_summa: Number(data.pay_summa) || 0,
      skidka_summa: Number(data.skidka_summa) || 0,
      backlog_summa: Number(data.backlog_summa) || 0,
      foiz: data.foiz,
      inspection_summa: data.inspection_summa,
      inspection_id: data.inspection_id,
      doctor_name: data.doctor_name,
      key: data.key,
      inspection_type: data.inspection_type,
      texnik_summa: data.texnik_summa,
      registration_texniks: []
    }
    emit('tekshiruv', datas);
  }
}

const texnikEmit = (data) => {
  if (data) {
    emit('texnik', data)
  }
}

const payData = ref({
  summa: qarzdorlik.value,
  pay_summa: 0,
  skidka_summa: 0,
  skidka_foiz: 0,
  qarzdorlik_summa: 0,
  paytype: 'Нақд',
  izoh: null,
  number: 0
})

const rowKey = (row) => `${row.key}_${row.number}`;

const chooseBemor = (e) => {
  // Duplikatlarni olib tashlash
  const selectedKeys = Array.from(new Set(e.map(item => item.split('_').join('_'))))
    .map(item => {
      const [key, number] = item.split('_');
      return { key, number };
    });

  // Barcha tanlangan bemorlarni topish
  orderList.value = props.data.registration_inspections
  .filter(item => {
    return selectedKeys.some(sel => 
      Number(sel.key) == Number(item.key) && 
      Number(sel.number) == Number(item.number) &&
      Number(item.backlog_summa) > 0
    );
  })
  .map(item => ({
    ...item,
    initial_backlog: Number(item.backlog_summa) || 0,
    pay_summa: Number(item.backlog_summa) || 0,
    skidka_summa: 0
  }));

  // Umumiy qarzdorlikni hisoblash
  const totalSelectedDebt = orderList.value.reduce((sum, item) => 
    sum + (Number(item.backlog_summa) || 0), 0
  );

  // To‘lov ma'lumotlarini yangilash
  payData.value = {
    ...payData.value,
    pay_summa: totalSelectedDebt,
    skidka_summa: 0,
    skidka_foiz: 0
  };

  // Har bir buyurtmada to‘lov va chegirma qiymatlarini boshlang‘ichga tenglab chiqish
  orderList.value.forEach(item => {
    item.pay_summa = Number(item.backlog_summa) || 0;
    item.skidka_summa = 0;
  });
};

const skidkaSumma = (e) => {
  if (orderList.value.length === 1) {
    const selected = orderList.value[0];
    const initialPaySumma = selected.initial_backlog;
    const newDiscount = Math.min(e, initialPaySumma);

    selected.skidka_summa = newDiscount;
    selected.pay_summa = initialPaySumma - newDiscount;
    selected.backlog_summa = initialPaySumma - selected.pay_summa - selected.skidka_summa;

    // Update percentage
    payData.value.skidka_foiz = (newDiscount / initialPaySumma) * 100;

    // Handle invalid inputs
    if (newDiscount < 0) {
      selected.skidka_summa = 0;
      selected.pay_summa = initialPaySumma;
      selected.backlog_summa = initialPaySumma - selected.pay_summa;
      payData.value.skidka_foiz = 0;
    }
  }
};

const paySumma = (e) => {
  if (orderList.value.length === 1) {
    const selected = orderList.value[0];
    const maxAllowed = selected.backlog_summa;

    // Ensure pay_summa doesn't exceed backlog
    const newPay = Math.min(e, maxAllowed);

    // Update single row values
    selected.pay_summa = newPay;
    selected.skidka_summa = 0;
    selected.backlog_summa = selected.inspection_summa - newPay - selected.skidka_summa;
    if (newPay < 0) {
      selected.pay_summa = 0;
      selected.backlog_summa = selected.inspection_summa - selected.skidka_summa;
    }

    payData.value.pay_summa = selected.pay_summa;
  }
};

const skidkaFoiz = (e) => {
  if (orderList.value.length === 1) {
    const selected = orderList.value[0];
    const initialPaySumma = selected.initial_backlog;
    const maxPercentage = 100;
    const validPercentage = Math.min(e, maxPercentage);

    const newDiscount = (validPercentage / 100) * initialPaySumma;
    selected.skidka_summa = newDiscount;
    selected.pay_summa = initialPaySumma - newDiscount;
    selected.backlog_summa = initialPaySumma - selected.pay_summa - selected.skidka_summa;

    // Update payData
    payData.value.skidka_summa = newDiscount;
    payData.value.pay_summa = selected.pay_summa;
    payData.value.skidka_foiz = validPercentage;

    // Ensure non-negative values
    if (newDiscount < 0) {
      selected.skidka_summa = 0;
      selected.pay_summa = initialPaySumma;
      selected.backlog_summa = initialPaySumma - selected.pay_summa;
      payData.value.skidka_foiz = 0;
    }
  }
};

const openPaymeModalShow = () => {
  if (orderList.value.length > 0) {
    confirmPayModal.value = true
  } else {
    notification.error({
      content: t('warning'),
      meta: t('input_summa'),
      duration: 1500,
      keepAliveOnHover: true
    })
  }
}

const paymeModalShow = async () => {
  try {
    const paymentDate = Math.floor(Date.now() / 1000);
    const newPayments = orderList.value.map(item => ({
      pay_summa: Number(item.pay_summa),
      skidka_summa: Number(item.skidka_summa),
      paytype: payData.value.paytype,
      datetime: paymentDate,
      inspection_key: item.key,
      inspection_id: item.inspection_id,
      doctor_id: item.doctor_id,
      foiz: item.foiz,
      texnik_summa: item.texnik_summa,
      teeth_number: item.number
    }));

    orderList.value.forEach(item => {
      const inspection = props.data.registration_inspections.find(
        insp => Number(insp.key) == Number(item.key)
      );

      if (inspection) {

        inspection.pay_summa += Number(item.pay_summa);
        inspection.skidka_summa += Number(item.skidka_summa);
        inspection.backlog_summa = Number(inspection.inspection_summa)
          - inspection.pay_summa
          - inspection.skidka_summa;
      }
    });

    props.data.registration_pays.push(...newPayments);


    orderList.value = [];
    confirmPayModal.value = false;
    refreshTable();
    calculateTotalQarz();

  } catch (error) {
    notification.error({
      content: t('error'),
      meta: error.message,
      duration: 3000
    });
  }
}

const payList = ref([])
const totalSum = computed(() =>
  props.data?.registration_pays?.reduce((sum, pay) => sum + Number(pay.pay_summa), 0) || 0
);
const totalSkidka = computed(() =>
  props.data?.registration_pays?.reduce((sum, pay) => sum + Number(pay.skidka_summa), 0) || 0
);
const totalQarz = computed(() =>
  props.data?.registration_inspections?.reduce((sum, item) => sum + Number(item.backlog_summa), 0) || 0
);

if (route.query.id) {
  if (props.data) {
    payList.value = props.data.registration_pays

    totalQarz.value += Number(props.data.qarzdorlik_summa)
    for (let i = 0; i < payList.value.length; i++) {
      totalSum.value += Number(payList.value[i].pay_summa)
      totalSkidka.value += Number(payList.value[i].skidka_summa)
    }
  }
}

const deleteShifokor = (item, index) => {
  let data = {
    doctor_id: item.doctor_id,
    index: index
  }
  eventBus.$emit('deleteShifokorIndex', data)
}

const deleteTekshiruv = (item, index) => {
  eventBus.$emit('deleteTekshiruvIndex', index)
}

const deletePay = (item, index) => {
  const payment = props.data.registration_pays.splice(index, 1)[0];
  
  // ✅ Key bo'yicha qidirish
  const inspection = props.data.registration_inspections.find(
    insp => Number(insp.key) == Number(payment.inspection_key) && Number(insp.number) == Number(payment.teeth_number)
  );

  if (inspection) {
    const relatedPayments = props.data.registration_pays.filter(
      p => Number(p.inspection_key) == Number(inspection.key) && Number(p.teeth_number) == Number(inspection.number)
    );

    inspection.pay_summa = relatedPayments.reduce((sum, p) => sum + Number(p.pay_summa), 0);
    inspection.skidka_summa = relatedPayments.reduce((sum, p) => sum + Number(p.skidka_summa), 0);
    inspection.backlog_summa = Math.max(Number(inspection.inspection_summa) - inspection.pay_summa - inspection.skidka_summa, 0);
  }

  refreshTable();
  calculateTotalQarz();
};

const printChek = () => {
  if (props.data?.registration_pays.length > 0) {
    localStorage.setItem('inspection_Chek', JSON.stringify(props.data?.registration_inspections));
    localStorage.setItem('chek', JSON.stringify(props.data?.registration_pays));
    emit('printChek')
    const rout = router.resolve({
      path: "/chek_print"
    });
    window.open(rout.href, "_blank");
  } else {
    notification.error({
      content: t('error'),
      meta: t('not_pay'),
      duration: 1500,
      keepAliveOnHover: false
    })
  }
}

const calculateTotalQarz = () => {
  totalQarz.value = props.data.registration_inspections.reduce(
    (sum, item) => sum + Number(item.backlog_summa), 0
  );
};

const printDoctorChek = () => {
  if (props.data?.doctor_inspections.length > 0) {
    props.data.totalSum = 0
    props.data.paySum = 0
    props.data.qarzSum = 0
    for (let i = 0; i < props.data.doctor_inspections.length; i++) {
      for (let j = 0; j < props.data.doctor_inspections[i].child.length; j++) {
        props.data.totalSum += Number(props.data.doctor_inspections[i].child[j].korik_summa);
        props.data.qarzSum += Number(props.data.doctor_inspections[i].child[j].korik_summa);
      }
    }
    props.data.registration_inspections.forEach((item) => {
      props.data.totalSum += Number(item.inspection_summa);
      props.data.qarzSum += Number(item.inspection_summa);
    })
    props.data.registration_pays.forEach((item) => {
      props.data.paySum += Number(item.pay_summa)
      props.data.paySum += Number(item.skidka_summa)
    })
    // console.log(props.data)
    let method;
    if (route.query.id) {
      method = axios.patch('/registration/update/' + route.query.id, props.data)
    } else {
      method = axios.post('/registration/create', props.data)
    }
    method.then(function (response) {
      if (response.success) {
        localStorage.setItem('DoctorChek', JSON.stringify(response.data.doctor_inspections));
        const rout = router.resolve({
          path: "/doctor_chek_print"
        });
        window.open(rout.href, "_blank");
        router.push({ name: 'Registration' });
      }
    }).catch(function (error) {
      notification.error({
        content: 'Хатолик!',
        meta: `${error.message}`,
        duration: 1500,
        keepAliveOnHover: true
      })
    });
  } else {
    notification.error({
      content: t('error'),
      meta: t('select_doctor'),
      duration: 1500,
      keepAliveOnHover: false
    })
  }
}

const closeUploadModal = () => {
  uploadModal.value = false;
}

onMounted(() => {
  getAllShifokor()
})

watch(props.data?.doctor_inspections, (val) => {
  totalQarz.value = 0
  val.forEach((item) => {
    for (let i = 0; i < item.child.length; i++) {
      totalQarz.value += Number(item.child[i].summa);
    }
  })
})

watch(() => props.data?.registration_inspections, (newInspections) => {
  orderList.value = orderList.value.filter(item =>
    newInspections.some(insp =>
      Number(insp.key) == Number(item.key) && Number(insp.number) == Number(item.number) && Number(insp.backlog_summa) > 0
    )
  );
}, { deep: true });

watch(() => props.data?.registration_pays, () => {
  if (!props.data?.registration_inspections) return;

  props.data.registration_inspections.forEach(inspection => {
    const relatedPayments = props.data.registration_pays?.filter(p =>
      Number(p.inspection_key) == Number(inspection.key) && Number(p.teeth_number) == Number(inspection.number)
    ) || [];

    inspection.pay_summa = relatedPayments.reduce((sum, p) => sum + Number(p.pay_summa || 0), 0);
    inspection.skidka_summa = relatedPayments.reduce((sum, p) => sum + Number(p.skidka_summa || 0), 0);
    inspection.backlog_summa = Number(inspection.inspection_summa || 0)
      - inspection.pay_summa
      - inspection.skidka_summa;
  });

  calculateTotalQarz();
}, { deep: true });


const showBtn = ref(true)
const handleBeforeLeave = (tabName) => {
  switch (tabName) {
    case "Навбат олиш":
      showBtn.value = true
      return true;
    case "Текширувлар":
      showBtn.value = false
      return true;
    case "Тўлов":
      showBtn.value = false
    default:
      return true;
  }
}

const onFinish = (options) => {
  let res = JSON.parse(options.event.target.response)
  let datas = {
    image: res.data,
    index: tekshiruvIndex.value
  }
  emit('tekImage', datas)
}


// Update row class calculation
const rowClassNameColumn = (row) => {
  const isSelected = orderList.value.some(item => Number(item.key) === Number(row.key) && Number(row.number) == Number(item.number)); // ✅ Key bo'yicha tekshirish
  const total = Number(row.inspection_summa) || 0;
  const paid = Number(row.pay_summa) || 0;
  const skidka = Number(row.skidka_summa) || 0;
  const backlog = total - paid - skidka;

  if (isSelected && backlog > 0) return "selected";
  if (backlog == 0) return "success";
  if (paid == 0 && skidka == 0) return "danger";
  return "warning";
};


</script>

<style scoped lang="scss">
:deep(.n-input--disabled .n-input__input) {
  cursor: not-allowed;
  background-color: #f8f9fa;
}

:deep(.selected td) {
  background-color: #ffa500 !important;
  color: #5c5c5c;
  font-weight: 600;
}

.wrapper {
  position: relative;
  display: flex;
  background-color: #ffffff;
  border: 1px solid #007BFF;
  border-radius: 5px;
  padding: 10px 15px;
  // min-height: calc(100vh - 530px);
  // height: max-content;

  &_item {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 5px;
    width: inherit;
    border-radius: 5px;
    border: 1px solid #007BFF;
    padding: 5px;
    background-color: #ffffff;
    overflow: auto;
    &_card {
      min-height: 350px;
      max-height: 400px;
      overflow: auto;
      border-radius: 5px;
      border: 1px solid #007BFF;
      padding: 5px;
    }
  }
  &_tek {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: inherit;
    border-radius: 5px;
    border: 1px solid #007BFF;
    padding: 5px;
    background-color: #ffffff;
    overflow: auto;
    &_card {
      min-height: 410px;
      max-height: 410px;
      overflow: auto;
      border-radius: 5px;
      border: 1px solid #007BFF;
      padding: 5px;
    }
  }

  &_pay {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: inherit;
    border-radius: 5px;
    border: 1px solid #007BFF;
    padding: 5px;
    gap: 10px;
    background-color: #ffffff;


    &_item {
      border: 1px solid #007BFF;
      border-radius: 5px;
    }

    &_button {
      border: 1px solid #007BFF;
      border-radius: 5px;

      .info {
        padding: 8px;
        border: 1px solid #007BFF;
        border-radius: 5px;
        background-color: #ffffff;
      }

      .btn {
        display: flex;
        justify-content: space-between;

        padding: 8px;
        border-top: 1px solid #007BFF;

        background-color: #ffffff;

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-width: 25%;
          border: none;
          outline: none;
          border-radius: 10px;
          color: #fff;
          padding: 25px;
          border: 1px solid #fff;
          cursor: pointer;

          span {
            font-size: 20px;
            font-weight: 700;
          }
        }

        .vazvrat {
          background: #dd0b0b;
          box-shadow: 5px 8px 10px #b0231966;

          &:hover {
            background-color: #fa6666;
          }
        }

        .print {
          background: #0b0bdd;
          box-shadow: 5px 8px 10px rgba(25, 60, 176, 0.4);

          &:hover {
            background-color: #4c4cf1;
          }
        }

        .success {
          background: #02b902;
          box-shadow: 5px 8px 10px rgba(38, 176, 25, 0.4);

          &:hover {
            background-color: #50db50;
          }
        }
      }
    }
  }

  .printDoctor{
    width: 150px;
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .table {
    min-height: 300px;
    overflow-y: auto;
  }


  table,
  th,
  td {
    border: 2px solid #007BFF;
    border-collapse: collapse;
    text-align: center;
  }

  thead {
    background-color: #007BFF;
    color: #fff;
    border-radius: 5px 5px 0 0;

    th {
      padding: 5px 0;
      border-right: 2px solid #fff;

      &:last-child {
        border-right: 2px solid #007BFF;
      }
    }
  }

  table,
  tbody,
  tr,
  th {
    padding: 3px;
  }
}

.tekshiruv {
  width: 600px;
  border-radius: 5px;
  border-top: 2px solid #007BFF;
  border-left: 2px solid #007BFF;

  &_content {
    display: grid;
    grid-template-columns: 1fr 0.5fr 0.5fr;

    // border-bottom: 1px solid #007BFF;
    .span {
      padding: 10px 5px;
      // border-top: 1px solid #007BFF;
      // border-left: 2px solid #007BFF;
      border-right: 2px solid #007BFF;
      border-bottom: 2px solid #007BFF;
      font-weight: 600;
      // border-radius: 0 5px 0 0;
    }

    &:nth-child(-n+1) {
      border-bottom: none;
    }
  }
}

.orders {
  display: grid;
  grid-template-columns: 1.5fr 0.5fr;
  gap: 10px;

  .table {
    min-height: 300px;
    overflow-y: auto;
    border: 1px solid #007BFF;
    border-radius: 5px;
    background-color: #ffffff;
  }

  .info {
    padding: 8px;
    border: 1px solid #007BFF;
    border-radius: 5px;
    background-color: #F0F6FA;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      min-width: 25%;
      border: none;
      outline: none;
      border-radius: 10px;
      color: #fff;
      padding: 25px;
      border: 1px solid #fff;
      cursor: pointer;

      span {
        font-size: 20px;
        font-weight: 700;
      }
    }

    .success {
      background: #02b902;
      box-shadow: 5px 8px 10px rgba(38, 176, 25, 0.4);


      &:hover {
        background-color: #50db50;
      }
    }
  }
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