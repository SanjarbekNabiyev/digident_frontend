<template>
    <div class="cont">
        <!-- <n-tabs v-model:value="tekShiruvDefaultValue" type="card" size="medium" animated
            @before-leave="handleBeforeLeave">
            <n-tab-pane name="Навбат олиш" :tab="t('navbat')"> -->
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
                                    <n-input style="width: 300px;" :placeholder="t('search')" v-model:value="searchText"
                                        @change="searchBemor" clearable />
                                </div>
                            </Transition>
                            <n-button @click="isSearch = !isSearch" strong secondary type="info">
                                <n-icon size="25">
                                    <SearchRound v-if="!isSearch" />
                                    <Clean v-else />
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
                                        <n-checkbox v-for="song in shifokorList" :value="song.id"
                                            :label="song.full_name" @update:checked="changeShifokor(song.id)" />
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
                                        <n-checkbox v-for="song in roomList" :value="song.id" :label="song.name"
                                            @update:checked="changeRoom(song.id)" />
                                    </n-space>
                                </n-checkbox-group>
                            </n-tooltip>
                            <n-button strong secondary type="info" @click="fullBtn">
                                <n-icon size="25">
                                    <FullscreenExitOutlined />
                                </n-icon>
                            </n-button>
                            <n-button strong secondary type="error" @click="clearFilters">{{ $t('clear_btn')
                                }}</n-button>
                        </div>
                    </div>

                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{{ $t("data") }}</th>
                                    <th v-for="day in days" :key="day.date"
                                        :class="{ 'today-column': isToday(day.date) }">
                                        {{ day.name }} <br />
                                        <small>{{ day.formattedDate }}</small>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="hour in hours" :key="hour">
                                    <td class="time-col">{{ hour }}</td>

                                    <td style="width: 13%;" v-for="day in days" :key="`${day.date}-${hour}`"
                                        :class="['cell', { 'today-column': isToday(day.date) }]"
                                        @click="openQueueModal(day.date, hour)">
                                        <div v-if="formattedTable[dayJS(day.date).format('DD.MM')]?.[hour]?.show"class="disegn">
                                            <!-- <div class="disegn_addBtn">
                                                <n-icon size="20" color="#60DAB1">
                                                    <PlusRound />
                                                </n-icon>
                                            </div> -->
                                            <div class="disegn_wrapper"
                                                v-for="(item, index) in formattedTable[dayJS(day.date).format('DD.MM')][hour].data"
                                                :key="item.id" @click="enterRegistration(day.date, hour, item)"
                                                :style="{ '--index': index + 1 }">
                                                <div class="disegn_wrapper_head"
                                                    :style="{ 'background': item.color }">
                                                    <p style="text-align: left; padding-left: 5px;">{{
                                                        item.bemor.full_name }}</p>
                                                    <div>
                                                        <n-popover placement="right" trigger="click"
                                                            style="display: flex; justify-content: center; align-items: center; ">
                                                            <template #trigger>
                                                                <div class="radio" @click.stop>
                                                                    <div class="dots">
                                                                        <div class="dots_item"></div>
                                                                        <div class="dots_item"></div>
                                                                        <div class="dots_item"></div>
                                                                    </div>
                                                                </div>
                                                            </template>
                                                            <div class="radio_wrapper">
                                                                <n-button strong secondary
                                                                    class="radio_wrapper_item"
                                                                    @click="whriteRegistrationComment(item)">
                                                                    <n-icon size="25">
                                                                        <CommentEdit24Regular />
                                                                    </n-icon>
                                                                    <span>{{ $t('comment_whrite') }}</span>
                                                                </n-button>
                                                                <n-button strong secondary
                                                                    class="radio_wrapper_item"
                                                                    @click="editRegistration(item)">
                                                                    <n-icon size="25">
                                                                        <FolderArrowUp48Regular />
                                                                    </n-icon>
                                                                    <span>{{ $t('qora_list') }}</span>
                                                                </n-button>
                                                                <n-button strong secondary type="error"
                                                                    class="radio_wrapper_item"
                                                                    @click="deleteRegistration(item)">
                                                                    <n-icon size="25">
                                                                        <Delete48Regular />
                                                                    </n-icon>
                                                                    <span>{{ $t('delete_btn') }}</span>
                                                                </n-button>
                                                            </div>
                                                        </n-popover>
                                                    </div>
                                                </div>
                                                <p class="text">{{ item.comment }}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            <!-- </n-tab-pane>
            <n-tab-pane name="Текширувлар" :tab="t('analitic')">
                <Analitic/>
            </n-tab-pane>
        </n-tabs>-->
    </div>

    <n-modal v-model:show="regInfoModal" class="custom-card" preset="card"
        style="width: 600px; background-color: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); padding: 10px;"
        :title="t('malumot')">
        <div style="display: flex; flex-direction: column; gap: 20px; font-size: 16px; color: #333;">

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 500;">{{ $t('bemor_fio') }} :</span>
                <span>{{ regInfoData.data.bemor.full_name }}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 500;">{{ $t('phone_number') }} :</span>
                <span>{{ usePhoneFormat(regInfoData.data.bemor.phone_number) }}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 500;">{{ $t('total_pay') }} / {{ $t('total_debt') }} :</span>
                <span>{{ useSummaFormat(regInfoData.data.pay_summa) }} / {{
                    useSummaFormat(regInfoData.data.qarzdorlik_summa) }}</span>
            </div>

            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 10px;">
                <n-button type="error" style="width: 150px; border-radius: 8px;" @click="regInfoModal = false">
                    {{ t('cencel_btn') }}
                </n-button>

                <n-button type="info" style="width: 150px; border-radius: 8px;" @click="showRegistration(regInfoData)">
                    {{ t('show_btn') }}
                </n-button>
            </div>
        </div>
    </n-modal>

    <n-modal v-model:show="addedModal" class="custom-card" preset="card" :title="t('comment')"
        style="width: 500px; position: fixed; top: 20px; left: 50%; transform: translateX(-50%);">
        <div>
            <n-input v-model:value="regComment.comment" type="textarea" :placeholder="t('comment')"
                style="margin-bottom: 10px;" />
            <n-button type="primary" @click="saveComment" size="large" style="width: 100%;">{{ $t('save_btn')
                }}</n-button>
        </div>
    </n-modal>
</template>

<script setup>
import axios from 'axios';
import { useEventBus } from '../../emitter'
import { useFullscreen } from '@vueuse/core'
import { ref, computed, onMounted, inject, watchEffect, h } from "vue";
import { format, startOfWeek, addDays, subWeeks, addWeeks, eachDayOfInterval } from "date-fns";
import { uz, ru, be } from "date-fns/locale";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { KeyboardDoubleArrowLeftRound, KeyboardDoubleArrowRightRound, DoorFrontOutlined, PersonSearchOutlined, FullscreenExitOutlined, SearchRound, PlusRound } from '@vicons/material'
import { Delete48Regular, FolderArrowUp48Regular, CommentEdit24Regular } from '@vicons/fluent'
import { Clean } from '@vicons/carbon'
import { I18nD, useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useCounterStore } from "../../stores/counter";
import Analitic from './Analitic.vue';
const tekShiruvDefaultValue = ref('Навбат олиш')
const eventBus = useEventBus()
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
const regInfoModal = ref(false)
const addedModal = ref(false)
const regInfoData = ref(null)

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
                summa: item.summa,
                pay_summa: item.pay_summa,
                qarzdorlik_summa: item.qarzdorlik_summa,
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
        show: bemorTable.value.length > 0
    };
};

const formattedTable = ref({});

// Boshlang'ich hafta dushanbadan boshlanadi
const weekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }));

// Soat oralig'i 08:00 dan 19:00 gacha, har 15 daqiqalik intervallar bilan
const hours = ref(
    Array.from({ length: (22 - 8 + 1) }, (_, i) => {
        const hour = 8 + i;
        return `${String(hour).padStart(2, '0')}:00`;
    })
);


// Haftaning oxirgi kunini hisoblash
const weekEnd = computed(() => addDays(weekStart.value, 6));

// Hafta kunlarini olish (Dushanbadan Yakshanbagacha)
const days = computed(() => {
    return eachDayOfInterval({
        start: weekStart.value,
        end: weekEnd.value
    }).map(date => {
        const formattedDate = format(date, "dd.MM", { locale: uz });
        return {
            name: format(date, "EEEE", { locale: uz }),
            formattedDate,
            date,
            key: formattedDate
        };
    });
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

const regComment = ref(null)
const whriteRegistrationComment = (data) => {
    regComment.value = data
    addedModal.value = true
}

const saveComment = () => {
    axios.post('/registration/update_comment/' + regComment.value.id, { comment: regComment.value.comment })
        .then((response) => {
            if (response.success) {
                addedModal.value = false
                getRegistration(weekStart.value, weekEnd.value, 0, 0)
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const enterRegistration = (date, hour, item) => {
    event.stopPropagation()
    regInfoModal.value = true;
    regInfoData.value = {
        date: date,
        hour: hour,
        data: item
    };
}

const showRegistration = (data) => {
    const isAllowed = [1, 2, 5].includes(activeRole) ||
        (Array.isArray(data.data.doctor_inspections) &&
            data.data.doctor_inspections.some(inspection => inspection.doctor_id == activeUser));

    if (isAllowed) {
        const timestamp = data.date.getTime();
        const [hours, minutes] = data.hour.split(':').map(Number);
        const fullDate = new Date(timestamp);

        fullDate.setHours(hours);
        fullDate.setMinutes(minutes);
        fullDate.setSeconds(0);
        fullDate.setMilliseconds(0);

        const result = Math.floor(fullDate.getTime());

        router.push({ name: "RegistrationAdd", query: { time: result, id: data.data.id } })
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
            bemor.doctor_inspections.some(inspection =>
                selectedDoctor.value.includes(inspection.doctor_id) &&
                ids.includes(inspection.room_id)
            );
    });
}

const editRegistration = (item) => {
    if (activeRole == 1 || activeRole == 2 || activeRole == 5) {
        let datas = {
            id: item.id,
            status: 'not_active'
        }
        axios.post('/registration/update_status', datas)
            .then((res) => {
                if (res.success) {
                    getRegistration(weekStart.value, weekEnd.value, 0, 0);
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
    } else {
        notification.error({
            content: t('error'),
            meta: t('not_change'),
            duration: 2500,
            keepAliveOnHover: false
        })
    }
}

const deleteRegistration = (item) => {
    if (activeRole == 1 || activeRole == 2 || activeRole == 5) {
        axios.delete('/registration/delete/' + item.id)
            .then((res) => {
                if (res.success) {
                    getRegistration(weekStart.value, weekEnd.value, 0, 0);
                }
            })
            .catch(function (error) {
                console.log(error.message);
            })
    } else {
        notification.error({
            content: t('error'),
            meta: t('not_change'),
            duration: 2500,
            keepAliveOnHover: false
        })
    }

}

eventBus.$on('getRegistration', () => {
    getRegistration(weekStart.value, weekEnd.value, 0, 0);
})
// Get all registration api
const allBemorList = ref([])
const bemorList = ref([])
const getRegistration = (date1 = weekStart.value, date2 = weekEnd.value, doctor_id, room_id) => {
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

const showBtn = ref(true)
const handleBeforeLeave = (tabName) => {
    switch (tabName) {
        case "Навбат олиш":
            showBtn.value = true
            return true;
        case "Текширувлар":
            showBtn.value = false
            return true;
        default:
            return true;
    }
}

watchEffect(() => {
    const table = {};
    if (!bemorList.value || bemorList.value.length === 0) return;

    // Bemorlarni avvaldan qayta ishlab olamiz (bir marta)
    const normalizedBemorlar = bemorList.value.map(item => {
        const itemTime = dayJS(item.updated_at * 1000);
        return {
            id: item.id,
            bemor: item.bemor,
            doctor_inspections: item.doctor_inspections,
            summa: item.summa,
            pay_summa: item.pay_summa,
            qarzdorlik_summa: item.qarzdorlik_summa,
            vaqt: itemTime.format('HH:mm'),
            date: itemTime.format('DD.MM'),
            totalMinutes: itemTime.hour() * 60 + itemTime.minute(),
            color: item.color,
            finished: item.finished,
            comment: item.comment
        };
    });

    days.value.forEach(day => {
        const dayKey = dayJS(day.date).format('DD.MM'); // <== BIRXIL format
        table[dayKey] = {};

        hours.value.forEach(hour => {
            const [h, m] = hour.split(':').map(Number);
            const start = h * 60 + m;
            const end = start + 15;


            const filtered = normalizedBemorlar.filter(item =>
                item.date === dayKey && item.totalMinutes >= start && item.totalMinutes < end
            );
            table[dayKey][hour] = {
                data: filtered,
                show: filtered.length > 0
            };
        });
    });
    formattedTable.value = table;
});
</script>

<style scoped lang="scss">
.cont {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 0 10px;
    padding: 5px 10px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    animation: showBox 0.3s ease-in-out forwards alternate;
    height: calc(100vh - 80px);
    overflow: hidden;
    overflow: auto;
}

.disegn {
    display: flex;
    flex-direction: column;
    position: relative;

    &_addBtn {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #adf8cf;
        position: absolute;
        border-radius: 0 0 0 50%;
        top: -15px;
        right: -10px;
        z-index: 999999;
        pointer-events: auto;
    }
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
            z-index: calc(100 - var(--index));
            top: calc((var(--index) - 1) * 35px);
        }

        &:hover {
            z-index: 99999;
            transition: all 0.3s ease-out;
            // top: 0;
        }
    }
}

.dots {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .dots_item {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #46454569;
    }
}

.radio {
    display: flex;
    justify-content: center;
    background-color: #fff;
    padding: 3px 0;
    border-radius: 50%;
}

.radio_wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;

    &_item {
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 5px;
    }
}

.container {
    // margin: 10px;
    // padding: 10px;
    // box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    // border-radius: 5px;
    // animation: showBox 0.3s ease-in-out forwards alternate;

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