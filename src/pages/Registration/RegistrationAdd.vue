<template>
    <div class="container">
        <div class="header_top">
            <n-button type="info" @click="saveRegistration" size="large" :disabled="showBtn" :loading="loading">
                <span style="font-size: 18px; font-weight: 500;">{{ $t('save_close') }}</span></n-button>
            <div style="display: flex; align-items: center; gap: 10px;">
                <n-checkbox v-model:checked="data.finished" size="large">{{ $t('finished') }}</n-checkbox>
            </div>
            <div class="exit">
                <n-icon size="45" color="red" @click="exit"><CloseSquareFilled/></n-icon>
            </div>
        </div>
        <n-spin :show="show">
            <div class="content" v-if="!route.query.id">
                <RegistrationPage v-if="!show" @bemorEmit="bemor" :data="data" @shifokorEmit="shifokor" @tekshiruvEmit="tekshiruv" @tekImageEmit="tekImage" @updateTekSummaEmit="updateTekSumma" @updateShifokorTimeEmit="updateShifokorTime" @texnikEmit="texnik" @payEmit="pay" @chekEmit="printChek"/>
            </div>
            <div class="content" v-else>
                <RegistrationPage v-if="!show" @bemorEmit="bemor" :data="data" @shifokorEmit="shifokor" @tekshiruvEmit="tekshiruv" @tekImageEmit="tekImage" @updateTekSummaEmit="updateTekSumma" @updateShifokorTimeEmit="updateShifokorTime" @texnikEmit="texnik" @payEmit="pay" @chekEmit="printChek"/>
                <!-- <n-tabs type="segment" animated @before-leave="handleBeforeLeave" default-value="Регистрация">
                    <n-tab-pane name="Регистрация" :tab="t('registration')" >
                    </n-tab-pane>
                    <n-tab-pane name="Бемор тарихи" :tab="t('patient_history')">
                        <BemorTarixi v-if="!show" :data="data.bemor"/>
                    </n-tab-pane>
                </n-tabs> -->
            </div>
        </n-spin>
    </div>

    <n-modal 
        v-model:show="addedModal" 
        class="custom-card" 
        preset="card" 
        :title="t('comment')"
        style="width: 500px; position: fixed; top: 20px; left: 50%; transform: translateX(-50%);"
    >
        <div>
            <n-input v-model:value="data.comment" type="textarea" :placeholder="t('comment')" style="margin-bottom: 10px;"/>
            <n-button type="primary" @click="saveComment" size="large" style="width: 100%;">{{ $t('save_btn') }}</n-button>
        </div>
    </n-modal>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed, provide } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { CloseSquareFilled } from '@vicons/antd'
import RegistrationPage from './RegistrationPage.vue';
import BemorTarixi from './BemorTarixi.vue'
import axios from 'axios';
import { useEventBus } from '../../emitter'
import { I18nD, useI18n } from "vue-i18n";
const filialId = ref(Number(localStorage.getItem('user_filial')))
const { t, locale } = useI18n()
const show = ref(false)
const eventBus = useEventBus()
const dialog = useDialog()
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const loading = ref(false);
const addedModal = ref(false)

const data = ref({
    updated_at: null,
    finished: false,
    bemor: null,
    filial_id: filialId.value,
    doctor_inspections: [],
    registration_inspections: [],
    registration_pays: [],
    totalSum: 0,
    paySum: 0,
    qarzSum: 0,
    color: null,
    comment: null
})

// ---------------------------------------------------------------------------------------------------- //
// RegistrationContent dan keladigan malumotlar start
const bemor = (e) => {
    data.value.bemor = e
}
// RegistrationContent dan keladigan malumotlar end
// ---------------------------------------------------------------------------------------------------- //

// RegistrationBottom dan keladigan malumotlar start
const shifokor = (e) => {
    if(e) {
        data.value.updated_at = e.inspection_time
        data.value.color = e.color
        let index = data.value.doctor_inspections.findIndex(el => el.doctor_id == e.doctor_id)
        if(index === -1) {
            data.value.doctor_inspections.push({
                doctor_id: e.doctor_id,
                name: e.xodim,
                child: [e]
            })
        } else {
            data.value.doctor_inspections[index].child.push(e)
        }
    }
}
const tekshiruv = (e) => {
    if(e) data.value.registration_inspections.push(e)
}
const texnik = (datas) => {
    if(datas.item){
        data.value.registration_inspections[datas.index].registration_texniks.push(datas.item)
        data.value.registration_inspections[datas.index].texnik_summa += Number(datas.item.summa)
    }
}
const  tekImage = (datas) => {
    if(datas.image){
        data.value.registration_inspections[datas.index].image = datas.image
    }
}

const updateShifokorTime = (datas) => {
    data.value.updated_at = datas.time / 1000
    data.value.doctor_inspections[datas.index].child[0].inspection_time = datas.time / 1000
}
const updateTekSumma = (datas) => {    
    if(datas.summa) {
        data.value.registration_inspections[datas.index].inspection_summa = (datas.summa)
        data.value.registration_inspections[datas.index].summa = (datas.summa)        
    }
}
const pay = (e) => {
    if(e) data.value.registration_pays.push(e)
}
// delete shifokor
eventBus.$on('deleteShifokorIndex', (item) => {
    for (let i = 0; i < data.value.doctor_inspections.length; i++) {
        if(data.value.doctor_inspections[i].doctor_id == item.doctor_id) {
            data.value.doctor_inspections[i].child.splice(item.index, 1);
        }        
    }
})
// delete tekshiruv
eventBus.$on('deleteTekshiruvIndex', (index) => {
    data.value.registration_inspections.splice(index, 1);
})
// delete texnik tekshiruv
eventBus.$on('deleteTexnikTekshiruvIndex', (item) => {
    if(item){
        data.value.registration_inspections[item.index].texnik_summa = Number(data.value.registration_inspections[item.index].texnik_summa) - Number(item.data.summa)
        data.value.registration_inspections[item.index].registration_texniks.splice(item.childIndex, 1);
    }
})
// delete Pay
eventBus.$on('deletePayIndex', (index) => {
    data.value.registration_pays.splice(index, 1);
})

// RegistrationBottom dan keladigan malumotlar end

// get One Registration
const getOneRegistration = () => {
    if(route.query.id){
        show.value = true
        axios.get('/registration/info/' + route.query.id)
        .then(function (res) {
            data.value.qarzSum = res.data.qarzdorlik_summa
            data.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
        .finally(() => show.value = false)
    }
}

const calculateSums = () => {
    data.value.totalSum = 0;
    data.value.paySum = 0;
    data.value.qarzSum = 0;

    // Shifokor ko‘riklari summalarini hisoblash
    data.value.doctor_inspections.forEach((doctor) => {
        doctor.child.forEach((korik) => {
            let summa = Number(korik.korik_summa);
            data.value.totalSum += summa;
            data.value.qarzSum += summa;
        });
    });

    // Ro‘yxatga olish inspeksiyalari summalarini qo‘shish
    data.value.registration_inspections.forEach((item) => {
        let summa = Number(item.inspection_summa);
        data.value.totalSum += summa;
        data.value.qarzSum += summa;
    });

    // To‘lov summalarini hisoblash
    data.value.registration_pays.forEach((item) => {
        data.value.paySum += Number(item.pay_summa) + Number(item.skidka_summa);
    });
};

const saveData = async (isRegistration = false) => {
    if (!isRegistration || data.value.bemor) {
        loading.value = true;
        calculateSums();

        let method;
        if (route.query.id) {
            if (isRegistration) {
                addedModal.value = true;
                return;
            }
            method = axios.patch('/registration/update/' + route.query.id, data.value);
        } else {
            method = axios.post('/registration/create', data.value);
        }

        if (method) {
            method
                .then((response) => {
                    if (response.success) {
                        loading.value = false;
                        router.push({ name: 'Home' });
                    }
                })
                .catch((error) => {
                    notification.error({
                        content: t('error'),
                        meta: `${error.message}`,
                        duration: 1500,
                        keepAliveOnHover: true
                    });
                });
        }
    } else {
        notification.error({
            content: t('warning'),
            meta: t('choose_bemor'),
            duration: 1500,
            keepAliveOnHover: true
        });
    }
};

// Yangi funksiyalarni chaqirish
const saveComment = () => saveData(false);
const saveRegistration = () => saveData(true);


const printChek = () => {
    saveRegistration()
}

provide('summa', computed(() => {
    let summ = 0;
    // for (let i = 0; i < data.value.doctor_inspections.length; i++) {
    //     for (let j = 0; j < data.value.doctor_inspections[i].child.length; j++) {
    //         summ += Number(data.value.doctor_inspections[i].child[j].korik_summa);
    //     }
    // }
    data.value.registration_inspections.forEach((item) => {
        summ += Number(item.inspection_summa);
    })
    return summ;
}))

const exit = () => {
    dialog.info({
        title: t('warning'),
        content: t('exit_window'),
        positiveText: t('exit_btn'),
        negativeText: t('cencel_btn'),
        onPositiveClick: () => {
            router.go(-1)
        },
        onNegativeClick: () => {
        }
    })
}

const showBtn = ref(false)
const handleBeforeLeave = (tabName) => {
    switch (tabName) {
      case "Бемор тарихи":
        showBtn.value = true
        return true;
      case "Регистрация":
        showBtn.value = false
      default:
        return true;
    }
}

onMounted(() => {
    getOneRegistration()
})

</script>

<style scoped>
.container{
    background-color: #D3E4E7;
    width: 100vw;
    min-height: 100vh;
}
.header_top{
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #F0F0F0;
    padding: 10px;
    border-bottom: 1px solid #007BFF;
}
.exit{
    cursor: pointer;
    width: 40px;
    height: 40px;
}
.content{
    padding: 15px 10px;
    height: calc(100vh - 80px);
    overflow-y: scroll;
}
.content_btn{
    display: flex;
    align-items: center;
    gap: 5px;
}
/* .n-tabs-tab{
    // background: #F5EDC9 !important;
    // color: #000 !important;
    // font-weight: 600 !important;
} */
.n-tabs-tab--active{
    /* // background: #D25D5D !important;
    // color: #fff !important; */
    font-weight: 600 !important;
}
.n-tabs-rail{
    width: 60% !important;
    background: inherit !important;
}
</style>