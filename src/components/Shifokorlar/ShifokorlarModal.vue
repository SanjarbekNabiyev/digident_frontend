<template>
    <div class="bord">
        <div class="bord_head" v-for="(item, index) in shifokorList" :key="index">
            <n-popover placement="bottom" trigger="click" v-model:show="item.showPopover" style="width: 200px;">
                <template #trigger>
                    <div class="card">
                        <div class="card_item">
                            <n-checkbox size="large" @update:checked="(e) => chooseDoctor(item, e)">
                                <span class="doctor_name">{{ item.full_name }}</span>
                            </n-checkbox>
                        </div>
                    </div>
                </template>

                <!-- Popover ichida xonalar -->
                <n-radio-group v-model:value="selectedRoomId" @update:value="chooseRoom">
                    <div class="room">
                        <div class="room_item" v-for="(room, i) in roomList" :key="i">
                            <n-radio size="large" :value="room.id">
                                <span class="room_name">{{ room.name }}</span>
                            </n-radio>
                        </div>
                    </div>
                </n-radio-group>
            </n-popover>
        </div>
    </div>
</template>


<script setup>
import axios from "axios";
import { useMessage, useNotification } from 'naive-ui';
import { ref, reactive, onMounted, defineEmits, watch, inject } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n();
const filialId = ref(Number(localStorage.getItem('user_filial')));
const router = useRouter();
const route = useRoute();
const dayJS = inject('dayJS');
const emit = defineEmits(['shifokor']);
const props = defineProps(['bemor_id', 'shifokorTekshiruvProps']);
const message = useMessage();
const notification = useNotification();
const bemor_id = ref(null);
const doctorArray = ref([]);
const doctorSend = ref(null);
const doctorId = ref(null);
const roomList = ref([])
const selectedRoomId = ref(null)

const chooseRoom = (value) => {
    let sendData = {
        doctor_id: doctorId.value,
        inspection_time: Number(route.query.time) / 1000
    }
    axios.post('/doctor_inspection/check-inspection-time', sendData)
        .then(function (res) {
            if (res.data) {
                notification.error({
                    content: t('error'),
                    meta: t('doctor_band'),
                    duration: 2000,
                    keepAliveOnHover: false
                })
            } else {
                const room = roomList.value.find(r => r.id === value)
                doctorSend.value.room_id = room.id
                doctorSend.value.room_name = room.name
                saveDoc()
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const chooseDoctor = (item, value) => {
    if (value) {
        // Boshqa popoverlarni yopamiz
        shifokorList.value.forEach(doc => {
            if (doc.id !== item.id) doc.showPopover = false;
        });

        if (value) {
            // Joriy tanlangan shifokor uchun popoverni ochamiz
            item.showPopover = value;
            getBemor();
        }
        if (props.bemor_id || bemor_id.value) {
            doctorId.value = item.id
            doctorSend.value = item;
            doctorTime.value = Number(route.query.time) / 1000

            let data = {
                id: item.id,
                full_name: item.full_name,
                foiz: item.foiz,
            };
            doctorArray.value.push(data);

        } else {
            notification.error({
                content: t('error'),
                meta: t('choose_bemor'),
                duration: 1500,
                keepAliveOnHover: false
            })
        }
    }
}

const doctorTime = ref(null)
const saveDoc = () => {
    if (doctorTime.value) {
        localStorage.setItem('doctor', JSON.stringify(doctorArray.value));

        let data = {
            time: doctorTime.value,
            doctor_id: doctorSend.value.id,
            xodim: doctorSend.value.full_name,
            bemor_id: props.bemor_id || bemor_id.value,
            inspection_time: doctorTime.value,
            between_time: 11,
            comment: null,
            korik_summa: doctorSend.value.korik_summa,
            foiz: doctorSend.value.foiz,
            room_id: doctorSend.value.room_id,
            room_name: doctorSend.value.room_name,
            key: doctorTime.value,
            color: doctorSend.value.color
        }

        emit('shifokor', data)
    } else {
        message.error(t('error_message'))
    }
}

// Get All shifokor
const shifokorList = ref([])
// Popoverni har shifokor uchun qo‘shamiz
const getAllShifokor = () => {
    axios.get('/user/shifokor/' + filialId.value)
        .then(function (res) {
            shifokorList.value = res.data.map(item => ({
                ...item,
                showPopover: false  // Har bir shifokor uchun popover holati
            }));
        })
        .catch(function (error) {
            console.log(error.message);
        });
};

// get One Registration
const getOneRegistration = () => {
    if (route.query.id) {
        axios.get('/registration/info/' + route.query.id)
            .then(function (res) {
                bemor_id.value = res.data.bemor_id
            })
            .catch(function (error) {
                console.log(error.message);
            })
    }
}

// Get all room api
const getBemor = () => {
    axios.get('/room/all')
        .then(function (res) {

            roomList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

onMounted(() => {
    getOneRegistration()
    getAllShifokor()
})
</script>

<style scoped lang="scss">
.bord {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 10px;

    &_head {
        .card {
            border: 1px solid #b3b3b3;
            padding: 5px;
            border-radius: 5px;

            &_item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                background-color: #E8EFF4;
                border: 1px solid #0064CF;
                border-radius: 5px;
                padding: 5px;

                span {
                    color: #3F51B4;
                    font-size: 18px;
                    font-weight: 700;
                }
            }
        }
    }
}

.room {
    display: flex;
    flex-direction: column;
    gap: 5px;

    &_item {
        display: flex;
        align-items: center;
        gap: 5px;
    }
}

.head {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    align-items: center;
    gap: 5%;
    margin-bottom: 10px;
}

.wrap {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    align-items: center;
    gap: 10px;
    height: calc(100vh - 250px);
    overflow: hidden;
    overflow: auto;

    &_head {
        margin-right: 5px;

        .card {
            border: 1px solid #b3b3b3;
            padding: 5px;
            border-radius: 5px;

            &_bosh {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                background-color: #E8EFF4;
                border: 1px solid #0064CF;
                border-radius: 5px;
                padding: 5px;

                span {
                    color: #3F51B4;
                    font-size: 18px;
                    font-weight: 700;
                }
            }

            &_band {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                background-color: #E8EFF4;
                border: 1px solid #f54f4f;
                border-radius: 5px;
                padding: 5px;

                span {
                    color: #f54f4f;
                    font-size: 18px;
                    font-weight: 700;
                }
            }
        }
    }

    &::-webkit-scrollbar {
        display: flex;
        width: 4px;
        height: 6px;
        border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb {
        background: #0073fa;
        border-radius: 5px;
    }

    &::-webkit-scrollbar-track {
        background: #fff;
        border-radius: 5px;
    }
}
</style>