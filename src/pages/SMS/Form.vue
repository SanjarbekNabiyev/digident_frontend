<template>
    <div class="container">
        <div class="sms_card">
            <div class="left">
                <n-spin :show="show">
                    <div class="left_head">
                        <span class="title">{{ $t('receiver') }}</span>
                        <n-button strong secondary type="info" style="width: 200px; font-weight: 600;"
                            @click="openBemorList(), (showChange = 'Kontakt')"><n-icon size="18">
                                <PlusOutlined />
                            </n-icon> {{ $t('kontakt') }}</n-button>
                    </div>
                    <n-data-table style="margin-top: 5px;" :columns="columns" :data="selectedBemorList" striped :max-height="275"/>
                </n-spin>
            </div>
            <div class="right">
                <div class="title">
                    <span>{{ $t('new_message') }}</span>
                    <n-button type="info" @click="opentShablon(), (showChange = 'Shablon')" style="display: flex; align-items: center; gap: 10px;"><n-icon size="20"><MailTemplate24Filled/></n-icon>{{ $t("template_btn") }}</n-button>
                </div>
                <n-input
                    style="min-height: 280px;"
                    v-model:value="text_message"
                    type="textarea"
                    :placeholder="t('this_message_edit')"
                    :autosize="{minRows: 10}"
                    @input="inputData"
                />
                <div class="btn">
                    <n-button type="error" @click="clearMessage()"><n-icon size="20"><Close/></n-icon> {{ $t("clear_btn") }}</n-button>
                    <n-button type="info" :disabled="(!show && !btn)" @click="sendSMSMessage"><n-icon size="20"><Checkmark/></n-icon>{{ $t("send_btn") }}</n-button>
                </div>
            </div>
        </div>
        <div class="content">
            <n-data-table v-if="smsMessage.length" :pagination="paginationReactive" :columns="columns" :data="smsMessage" striped :max-height="370" />
        </div>
    </div>

    <!-- SMS and Bemor table -->
    <n-modal v-model:show="addedModal" class="custom-card" preset="card" style="width: 1000px; background: #fff;" 
    :title="showChange == 'Kontakt' ? t('recipient') : t('templates')"
    >
        <div class="kontakt">
            <n-data-table v-if="showChange == 'Kontakt'" :columns="bemorColumns" :data="bemorList" :row-key="rowKey" @update:checked-row-keys="chooseBemor" :max-height="450"/>
            <n-data-table v-else :columns="smsColumns" :data="smsList" :max-height="450"/>
            <div class="btn">
                <n-button v-if="showChange == 'Shablon'" @click="addSMS" type="warning"><n-icon size="20"><PlusOutlined/></n-icon>{{ $t('add_btn') }}</n-button>
                <n-button v-else type="info" @click="confirmBemor"><n-icon size="20"><Checkmark/></n-icon>{{ $t('confir_btn') }}</n-button>
            </div>
        </div>
    </n-modal>
    <!-- SMS and Bemor table -->

    <!-- SMS added Modal -->
     <n-modal v-model:show="smsModal" class="custom-card" preset="card" style="width: max-content;">
        <div class="sms" >
            <n-form ref="formRef" :model="smsData" :rules="rules">
                <n-form-item :label="t('name')" path="name">
                    <n-input v-model:value="smsData.name" size="large"/>
                </n-form-item>
                <n-input
                    v-model:value="smsData.message"
                    type="textarea"
                    :placeholder="t('this_message_edit')"
                    :autosize="{minRows: 5}"
                />
                <div class="btn">
                    <n-button type="info" @click="saveSMS"><n-icon size="20"><Checkmark/></n-icon>{{ $t('save_btn') }}</n-button>
                </div>
            </n-form>
        </div>
     </n-modal>
    <!-- SMS added Modal -->
</template>

<script setup>
import { h, ref, reactive, onMounted, inject, defineProps } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, NTag, useDialog } from 'naive-ui'
import { SearchRound, PlusOutlined } from '@vicons/material'
import { Close, Checkmark } from '@vicons/ionicons5'
import { MailTemplate24Filled } from '@vicons/fluent'
import { useRouter, useRoute } from "vue-router";
import { TrashCan, Pen } from '@vicons/carbon'
import axios from 'axios';
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
import { useEventBus } from '../../emitter'
import { useCounterStore } from '../../stores/counter';
const counter = useCounterStore()
const eventBus = useEventBus()
const formRef = ref(null)
const { t, locale } = useI18n()
const dayJS = inject('dayJS')
const notification = useNotification()
const message = useMessage()
const router = useRouter()
const route = useRoute()
const searchText = ref(null)
const bemorList = ref([])
const smsList = ref([])
const selectedBemorList = ref([])
const smsMessage = ref([])
const addedModal = ref(false)
const smsModal = ref(false)
const text_message = ref(null)
const list = ref([])
const show = ref(false)
const btn = ref(false)
const showChange = ref(null)

const smsData = ref({
    name: null,
    message: null,
})

const rules = {
    name: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null || value == '') {
                return new Error(t('message_name_midd'))
            }
        }
    }
}

const columns = [
    // {
    //     title: '№',
    //     render: (_, index) => {
    //         return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
    //     },
    // },
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
        title: '',
        key: "action",
        width: '60px',
        render(row) {
            return [
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'error',
                        onClick: (e) => {
                            e.stopPropagation();
                            let index = selectedBemorList.value.findIndex(el => el.id == row.id);
                            if (index !== -1) {
                                selectedBemorList.value.splice(index, 1);
                            }
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

const bemorColumns = [
    {
        type: "selection",
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
        title: t('birthday'),
        render(row) {
            return dayJS(row.birthday * 1000).format('DD-MM-YYYY')
        }
    },
];

const smsColumns = [
    {
        title: t('name'),
        key: 'name',
    },
    {
        title: '',
        key: "action",
        width: '120px',
        render(row) {
            return [
                h(
                    NButton,
                    {
                        size: 'medium',
                        type: 'error',
                        onClick: (e) => {
                            e.stopPropagation();
                            axios.delete('/sms/delete/'+row.id)
                            .then(function (res) {
                                if (res.success) {
                                    getAllSMS()
                                }
                            })
                            .catch(function (error) {
                                console.log(error.message);
                            })
                        }
                    },
                    {
                        icon: () =>
                            h(NIcon, {
                                component: TrashCan
                            })
                    }
                ),
                h(
                    NButton,
                    {
                        size: 'medium',
                        type: 'success',
                        onClick: (e) => {
                            e.stopPropagation();
                            text_message.value = row.message;
                            addedModal.value = false;
                            btn.value = true
                        }
                    },
                    {
                        icon: () =>
                            h(NIcon, {
                                component: Checkmark
                            })
                    }
                ),
            ]
        }
    }
];


const clearMessage = () => {
    text_message.value = null
}

const sendSMSMessage = () => {
    let data = {
        phones: selectedBemorList.value,
        message: text_message.value,
    }
    axios.post('/sms/send', data)
        .then(function (res) {
            if (res.success) {
                notification.success({
                    content: t('success'),
                    meta: t('send_sms'),
                    duration: 2500,
                    keepAliveOnHover: false
                })
                selectedBemorList.value = []
                text_message.value = null
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const openBemorList = () => {
    addedModal.value = true
}

const opentShablon = () => {
    addedModal.value = true
}

const addSMS = () => {
    smsModal.value = true
}

const saveSMS = async () => {
    try {
        const result = await formRef.value?.validate();
        axios.post('/sms/create', smsData.value)
        .then(function (res) {
            if (res.success) {
                getAllSMS()
                smsModal.value = false
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
    }catch (e) {}
}

const rowKey = (row) => row.id

const chooseBemor = (e) => {
    list.value = e
}

const confirmBemor = () => {
    if(list.value.length > 0){
        show.value = true
        list.value.forEach(e => {
            axios.get('/bemor/info/'+e)
            .then(function (res) {
                if (res.success) {
                    show.value = false
                    addedModal.value = false
                    let index = selectedBemorList.value.findIndex(el => el.phone_number === res.data.phone_number)
                    if(index === -1) {
                        selectedBemorList.value.push(res.data);
                    }else{
                        message.error(t('there_patient'))
                    }
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
        });
    }else{
        notification.error({
            content: 'Хатолик!',
            meta: t('choose_bemor'),
            duration: 2500,
            keepAliveOnHover: false
        })
    }
}

const inputData = (e) => {
    if(e != null && e != '' && e != ' '){
        btn.value = true
    }else{
        btn.value = false
    }
}

const getAllBemor = () => {
    axios.get('/bemor/all')
        .then(function (res) {
            if (res.success) {
                bemorList.value = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const getAllSMS = () => {
    axios.get('/sms/all')
        .then(function (res) {
            if (res.success) {
                smsList.value = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

eventBus.$on('chooseBemorList', (val) => {
    if(val) {
        selectedBemorList.value = []
        show.value = true
        val.forEach(e => {
            axios.get('/bemor/info/'+e)
            .then(function (res) {
                if (res.success) {
                    show.value = false
                    addedModal.value = false
                    let index = selectedBemorList.value.findIndex(el => el.phone_number === res.data.phone_number)
                    if(index === -1) {
                        selectedBemorList.value.push(res.data);
                    }else{
                        message.error(t('there_patient'))
                    }
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
        });
    }
})
onMounted(() => {
    getAllBemor()
    getAllSMS()
    if(counter.birthdayData.length > 0) {
        selectedBemorList.value = []
        show.value = true
        counter.birthdayData.forEach(e => {
            axios.get('/bemor/info/'+e)
            .then(function (res) {
                if (res.success) {
                    show.value = false
                    addedModal.value = false
                    let index = selectedBemorList.value.findIndex(el => el.phone_number === res.data.phone_number)
                    if(index === -1) {
                        selectedBemorList.value.push(res.data);
                    }else{
                        message.error(t('there_patient'))
                    }
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
        });
    }
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

.sms_card {
    display: grid;
    grid-template-columns: 0.7fr 1.3fr;
    gap: 25px;
    border-top: 3px solid #007BFF;
    border-radius: 0 0 5px 5px;
    height: calc(100vh - 600px);

    .left {
        margin-top: 5px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        padding: 5px 10px;
        border-radius: 5px;
        &_head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #ddd;

            .title {
                font-weight: 500;
                font-size: 18px;
                padding: 5px 0;
            }
        }
    }

    .right {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-top: 5px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        padding: 5px 10px;
        border-radius: 5px;
        .title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 500;
            font-size: 18px;
            padding: 5px 0;
            border-bottom: 1px solid #ddd;
        }
        .btn{
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 10px;
        }
    }
}

.container_header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 10px;
}

.content{
    padding-top: 10px;
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

.kontakt{
    .btn{
        padding-top: 10px;
        display: flex;
        align-items: center;
        justify-content: end;
        gap: 10px;
    }
}

.sms{
    width: 500px;
    display: flex;
    flex-direction: column;
    .btn{
        padding-top: 10px;
        display: flex;
        align-items: center;
        justify-content: end;
    }
}
</style>