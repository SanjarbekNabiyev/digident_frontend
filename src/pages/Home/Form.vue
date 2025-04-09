<template>
    <div class="container">
        <div class="container_head">
            <div class="controls">
                <n-button strong secondary type="info" @click="prevWeek">
                    <n-icon size="20">
                        <KeyboardDoubleArrowLeftRound />
                    </n-icon>
                </n-button>

                <div class="week">
                    <h4>{{ formattedDateRange }}</h4>
                </div>

                <n-button strong secondary type="info" @click="nextWeek">
                    <n-icon size="20">
                        <KeyboardDoubleArrowRightRound />
                    </n-icon>
                </n-button>
            </div>

            <div class="filters">
                <Transition name="slide-fade">
                    <div v-if="isSearch" class="search-box">
                        <n-input style="width: 300px;" :placeholder="t('search')" v-model:value="searchText" @change="searchBemor" clearable/>
                    </div>
                </Transition>
                <n-button @click="isSearch = !isSearch" strong secondary type="info">
                    <n-icon size="25">
                        <SearchRound v-if="!isSearch"/>
                        <CloseRound v-else/>
                    </n-icon>
                </n-button>
                <n-tooltip trigger="click" placement="bottom">
                    <template #trigger>
                        <n-button strong secondary type="info">
                            <n-icon size="25">
                                <PersonSearchOutlined />
                            </n-icon>
                        </n-button>
                    </template>
                    <n-checkbox-group v-model:value="selectedDoctor" @update:value="changeShifokor">
                        <n-space vertical>
                            <n-checkbox v-for="song in shifokorList" :value="song.id" :label="song.full_name" @update:checked="changeShifokor(song.id)"/>
                        </n-space>
                    </n-checkbox-group>
                </n-tooltip>
                <n-tooltip trigger="click" placement="bottom">
                    <template #trigger>
                        <n-button strong secondary type="info">
                            <n-icon size="25">
                                <DoorFrontOutlined />
                            </n-icon>
                        </n-button>
                    </template>
                    <n-checkbox-group v-model:value="selectedRoom" @update:value="changeRoom">
                        <n-space vertical>
                            <n-checkbox v-for="song in roomList" :value="song.id" :label="song.name"  @update:checked="changeRoom(song.id)" />
                        </n-space>
                    </n-checkbox-group>
                </n-tooltip>
                <n-button strong secondary type="info" @click="fullBtn">
                    <n-icon size="25">
                        <FullscreenExitOutlined />
                    </n-icon>
                </n-button>
                <n-button strong secondary type="error" @click="clearFilters">{{ $t('clear_btn') }}</n-button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>{{ $t("data") }}</th>
                        <th v-for="day in days" :key="day.date" :class="{ 'today-column': isToday(day.date) }">
                            {{ day.name }} <br />
                            <small>{{ day.formattedDate }}</small>
                        </th>
                    </tr>
                </thead>
                <tbody> 
                    <tr v-for="hour in hours" :key="hour">
                        <td class="time-col">{{ hour }}</td>
                        <td style="width: 13%;" v-for="day in days" :key="`${day.date}-${hour}`" :class="['cell', { 'today-column': isToday(day.date) }]" @click="openQueueModal(day.date, hour)">
                            <div v-if="formattedTable[day.date][hour]?.show" class="disegn">
                                <div class="disegn_wrapper" v-for="(item, index) in formattedTable[day.date][hour].data" :key="item.id" @click="enterRegistration(day.date, hour, item)" :style="{ '--index': index + 1 }">
                                    <div class="disegn_wrapper_head" :style="{ 'background': item.color }">
                                        <p style="text-align: left; padding-left: 5px;">{{ item.bemor.full_name }}</p>
                                        <div class="radio">
                                            <n-checkbox type="secondary" v-model:checked="item.finished" size="medium" disabled></n-checkbox>
                                        </div>
                                    </div>
                                    <p class="text">{{ item.comment }}</p>
                                </div>
                                <!-- <n-popover placement="bottom" trigger="hover" style="width: 200px;">
                                    <template #trigger>
                                    </template>
                                </n-popover> -->
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { useFullscreen } from '@vueuse/core'
import { ref, computed, onMounted, inject, watch, h } from "vue";
import { format, startOfWeek, addDays, subWeeks, addWeeks, eachDayOfInterval } from "date-fns";
import { uz, ru, be } from "date-fns/locale";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { KeyboardDoubleArrowLeftRound, KeyboardDoubleArrowRightRound, DoorFrontOutlined, PersonSearchOutlined, FullscreenExitOutlined, SearchRound, CloseRound } from '@vicons/material'
import { I18nD, useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useCounterStore } from "../../stores/counter";
const isSearch = ref(false)
const counter = useCounterStore()
const notification = useNotification()
const { isFullscreen, enter, exit, toggle } = useFullscreen()
const { t, locale } = useI18n()
const router = useRouter()
const dayJS = inject('dayJS')
let bemorTable = ref([]);
const filialId = ref(Number(localStorage.getItem('user_filial')));
const activeRole = Number(localStorage.getItem('user_role_id'))
const activeUser = Number(localStorage.getItem('user_id'))
const selectedDoctor = ref(null);
const selectedRoom = ref(null);
const searchText = ref(null);

const searchBemor = () => {
    if (searchText.value.length > 0) {
        let data = { text: searchText.value }
        axios.post('/registration/search', data)
            .then(function (res) {
                if (res.data) {
                    console.log(res.data);
                    
                    bemorList.value = res.data
                } else {
                    message.error('Бундай маълумот йўқ')
                }
            })
            .catch(function (error) {
                bemorList.value = []
            })
    } else {
        getRegistration(weekStart.value, weekEnd.value, 0, 0);
    }
}

const clearFilters = () => {
    searchText.value = null;
    selectedDoctor.value = null;
    selectedRoom.value = null;
    getRegistration(weekStart.value, weekEnd.value, 0, 0);
};

const fullBtn = () => {
    toggle();
    counter.showNavbar = !counter.showNavbar
}

const showRowData = (date, hour) => {
    let [startHour, startMinute] = hour.split(':').map(Number);
    let startTimeInMinutes = startHour * 60 + startMinute;
    let endTimeInMinutes = startTimeInMinutes + 15;
    let globalDate = dayJS(date).format('DD.MM');

    if (bemorList.value.length === 0) return false;

    bemorTable.value = bemorList.value
        .map(item => {
            let itemTime = dayJS(item.updated_at * 1000);
            return {
                id: item.id,
                bemor: item.bemor,
                doctor_inspections: item.doctor_inspections,
                vaqt: itemTime.format('HH:mm'),
                date: itemTime.format('DD.MM'),
                totalMinutes: itemTime.hour() * 60 + itemTime.minute(),
                color: item.color,
                finished: item.finished,
                comment: item.comment
            };
        })
        .filter(item =>
            item.date == globalDate &&
            item.totalMinutes >= startTimeInMinutes &&
            item.totalMinutes < endTimeInMinutes
        );
    return {
        data: bemorTable.value,
        show : bemorTable.value.length > 0
    };
};

const formattedTable = computed(() => {
    let tableData = {};
    days.value.forEach(day => {
        tableData[day.date] = {};
        hours.value.forEach(hour => {
            tableData[day.date][hour] = showRowData(day.date, hour);
        });
    });
    return tableData;
})

// Boshlang'ich hafta dushanbadan boshlanadi
const weekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }));

// Soat oralig'i 08:00 dan 19:00 gacha, har 15 daqiqalik intervallar bilan
const hours = ref(
    Array.from({ length: ((21 - 8) * 4) + 1 }, (_, i) => {
        let totalMinutes = i * 15 + 8 * 60;
        let hour = Math.floor(totalMinutes / 60);
        let minute = totalMinutes % 60;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    })
);

// Haftaning oxirgi kunini hisoblash
const weekEnd = computed(() => addDays(weekStart.value, 6));

// Hafta kunlarini olish (Dushanbadan Yakshanbagacha)
const days = computed(() => {
    return eachDayOfInterval({
        start: weekStart.value,
        end: weekEnd.value
    }).map(date => ({
        name: format(date, "EEEE", { locale: uz }), // Kunning nomi
        formattedDate: format(date, "dd.MM", { locale: uz }), // Sana formati
        date
    }));
});

// "dd.MM - dd.MM" formatida sana chiqarish
const formattedDateRange = computed(() => {
    return `${format(weekStart.value, "dd.MM")} - ${format(weekEnd.value, "dd.MM")}`;
});

// Haftani oldinga surish
const nextWeek = () => {
    weekStart.value = addWeeks(weekStart.value, 1);
    getRegistration(weekStart.value, weekEnd.value, 0, 0);
};

// Haftani orqaga surish
const prevWeek = () => {
    weekStart.value = subWeeks(weekStart.value, 1);
    getRegistration(weekStart.value, weekEnd.value, 0, 0);
};

const openQueueModal = (date, hour) => {
    const timestamp = date.getTime();
    const [hours, minutes] = hour.split(':').map(Number);
    const fullDate = new Date(timestamp);

    fullDate.setHours(hours);
    fullDate.setMinutes(minutes);
    fullDate.setSeconds(0);
    fullDate.setMilliseconds(0);

    const result = Math.floor(fullDate.getTime());
    router.push({ name: "RegistrationAdd", query: { time: result } })
}

const enterRegistration = (date, hour, item) => {
    event.stopPropagation()
    const isAllowed = [1, 2, 5].includes(activeRole) || 
        (Array.isArray(item.doctor_inspections) && 
        item.doctor_inspections.some(inspection => inspection.doctor_id == activeUser));

    if (isAllowed) {
        const timestamp = date.getTime();
        const [hours, minutes] = hour.split(':').map(Number);
        const fullDate = new Date(timestamp);
    
        fullDate.setHours(hours);
        fullDate.setMinutes(minutes);
        fullDate.setSeconds(0);
        fullDate.setMilliseconds(0);
    
        const result = Math.floor(fullDate.getTime());
    
        router.push({ name: "RegistrationAdd", query: { time: result, id: item.id } })
    } else {
        notification.error({
            content: t('impossible'),
            // meta: "Boshqa shifokorni malumotlarini korish mumkin emas",
            duration: 2500,
            keepAliveOnHover: false
        })
    } 
}

const changeShifokor = async (ids) => {
    bemorList.value = allBemorList.value.filter(bemor => {
        return Array.isArray(bemor.doctor_inspections) &&
            bemor.doctor_inspections.some(inspection => ids.includes(inspection.doctor_id));
    });
}

const changeRoom = (ids) => {
    bemorList.value = allBemorList.value.filter(bemor => {
        return Array.isArray(bemor.doctor_inspections) &&
            bemor.doctor_inspections.some(inspection => ids.includes(inspection.room_id));
    });
}

// Get all registration api
const allBemorList = ref([])
const bemorList = ref([])
const getRegistration = (date1=weekStart.value, date2=weekEnd.value, doctor_id, room_id) => {
    let timeData = {
        datetime1: new Date(date1).getTime(),
        datetime2: new Date(date2.setHours(23, 59, 59, 999)).getTime(),
        doctor_id: doctor_id,
        room_id: room_id
    }    

    let send = { ...timeData }
    let endOf = new Date(send.datetime2);
    endOf.setHours(23, 59, 59, 999);
    send.datetime2 = endOf.getTime()

    axios.post('/registration/getall', send)
        .then(function (res) {
            if (res.data) {
                allBemorList.value = res.data
                bemorList.value = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

// Get All shifokor
const shifokorList = ref([])
const roomList = ref([])
const getAllShifokor = () => {
    axios.get('/user/shifokor/' + filialId.value)
        .then(function (res) {
            shifokorList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}
const getAllRoom = () => {
    axios.get('/room/all')
        .then(function (res) {
            roomList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

onMounted(() => {
    getRegistration()
    getAllShifokor()
    getAllRoom()
})

const isToday = (date) => {
    const today = new Date();
    return format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
};
</script>

<style scoped lang="scss">
.disegn{
    display: flex;
    flex-direction: column;
    position: relative;
    &_wrapper {
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        font-weight: 600;
        border: 1px solid #cdcdcd;
        background-color: #fff;
        height: 100px;
        position: absolute;
        width: 100%;
        left: 0;
        &_head {
            display: grid;
            grid-template-columns: 1.7fr 0.3fr;
            align-items: center;
            border-radius: 10px 10px 0 0;
            padding: 3px 0;
            .radio{
                background-color: #fff;
                padding: 2px 0;
                border-radius: 50%;
            }
        }
        .text {
            color: #adadad;
            font-weight: 500;
            text-align: left;
            padding: 0 5px;
        }
        &:nth-child(1) {
            position: relative;
            z-index: 1;
            top: 0;
        }
        &:nth-child(n + 2) {
            z-index: calc(100 - var(--index)); /* Har bir keyingi element ustiga chiqadi */
            top: calc((var(--index) - 1) * 35px); /* Har biri 10px yuqorida */
        }
        // &:nth-child(n + 3) {
        //     z-index: calc(100 - var(--index)); /* Har bir keyingi element ustiga chiqadi */
        //     top: calc((var(--index) - 1) * 70px); /* Har biri 10px yuqorida */
        // }
        &:hover{
            z-index: 99999;
            transition: all 0.3s ease-out;
            top: 0;
        }
    }
}

.container {
    margin: 10px;
    padding: 10px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    animation: showBox 0.3s ease-in-out forwards alternate;

    &_head {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
        }

        .filters {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
    }
}

.table-container {
    margin-top: 10px;
    height: calc(100vh - 140px);
    overflow: hidden;
    overflow: auto;
    text-align: center;
}

button {
    padding: 5px 10px;
    font-size: 16px;
    cursor: pointer;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #e0e0e0;
    padding: 8px;
    text-align: center;
}

th {
    background-color: #f4f4f4;
}

.time-col {
    font-weight: bold;
    background-color: #eee;
}

.cell {
    min-width: 100px;
    height: 70px;
    overflow: scroll;
    cursor: pointer;
}

.week {
    border: 1px solid #e0e0e0;
    padding: 4px;
    width: 150px;
    text-align: center;
    cursor: pointer;
    border-radius: 5px;
}

.tooltip-content {
    span {
        font-size: 15px;
        font-weight: 600;
    }
}

.today-column {
    background-color: #c8dffa7c !important;
    font-weight: bold;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
  width: 300px;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-out;
  width: 300px;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  width: 0px;
}
</style>