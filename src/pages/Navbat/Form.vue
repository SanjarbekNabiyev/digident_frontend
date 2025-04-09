<template>
    <div class="bord">
        <div class="bord_head">
            <n-form style="display: flex; align-items: center; justify-content: space-between;">
                <n-form-item :label="t('doctor')">
                    <n-select style="width: 300px" :onUpdate:value="changeShifokorId" v-model:value="shifokorID"
                        :options="shifokorList" size="large" value-field="id" label-field="full_name"
                        :placeholder="t('doctor')" filterable clearable :disabled="disabledSelect" />
                    <!-- :disabled="disabledSelect" -->
                </n-form-item>
                <n-form-item label="" style="text-align: center;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <n-button type="info" size="large" @click="prevweek"><n-icon size="20" color="#fff">
                                <KeyboardArrowLeftSharp />
                            </n-icon></n-button>
                        <n-input placeholder="Хафта #" size="large" style="width: 300px;"
                            v-model:value="timestamp"></n-input>
                        <n-button type="info" size="large" @click="nextweek"><n-icon size="20" color="#fff">
                                <KeyboardArrowRightSharp />
                            </n-icon></n-button>
                    </div>
                </n-form-item>
            </n-form>
        </div>
        <div class="boxses">
            <table>
                <thead>
                    <tr>
                        <td style="width: 70px;">Вақт</td>
                        <td v-for="(item, index) in dayArray" :key="index">
                            {{ dayJS(item.name).format('DD') + "-" + dayNameUz(dayJS(item.name).format('MMMM'), 'month')
                            }} ({{
                                dayNameUz(dayJS(item.name).locale('de').format('dddd'), 'day') }}) </td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(el, y) in dynamicMatrix" :key="y">
                        <td style="background: #E0E7EE;">{{ workTime[y].name }}</td>
                        <td v-for="(val, x) in el" :key="x" @click="rowClick(dayArray[x].name, workTime[y].name)" :class="{ 'red-background': isPastTime(dayArray[x].name, workTime[y].name) }">
                            <div class="row-box" @click="getComment(dayArray[x].name, workTime[y].name)">
                                <div class="disegn-wrapper" v-html="getData(dayArray[x].name, workTime[y].name)"></div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Shifokor vaqtini belgilash modal
  <n-modal v-model:show="TaskModal" class="custom-card" preset="card"
      style="width: 25%; min-height: 300px; background: #F0F0F0;" title="Шифокорга бемор қўшиш">
      <n-form>
          <div class="wrap">
              <n-form-item label="Кўрик санаси">
                  <n-date-picker v-model:value="rowDataObj.date" type="date" size="large" disabled />
              </n-form-item>
              <n-form-item label="Кўрик вақти">
                  <n-time-picker format="HH:mm" :default-formatted-value="rowDataObj.time" size="large" disabled />
              </n-form-item>
          </div>
          <n-form-item label="Изоҳ">
              <n-input v-model:value="comment" type="textarea" placeholder="" />
          </n-form-item>

          <n-button type="info" style="width: 100%;" size="large" @click="saveDoc">Сақлаш</n-button>
      </n-form>
  </n-modal> -->
</template>

<script setup>
import axios from "axios"
import { useMessage, useNotification } from 'naive-ui'
import { ref, reactive, onMounted, defineEmits, watch, inject } from 'vue'
import { PlusSquare } from '@vicons/fa'
import { ClockAlarm32Filled } from '@vicons/fluent'
import { KeyboardArrowRightSharp, KeyboardArrowLeftSharp } from '@vicons/material'
import { useRouter, useRoute } from "vue-router";
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute();
const dayJS = inject('dayJS')
const emit = defineEmits(['shifokor'])
const props = defineProps(['bemor_id'])
const message = useMessage()
const notification = useNotification()
const TaskModal = ref(false)
const comment = ref(null)
const shifokorName = ref(null)
const weekDay = ref(null)
const indexData = ref(null)
const weekDayId = ref(null)
const range = ref(30)
const datas = ref([])
const bemor_id = ref(null)
const shifokorTekshiruv = ref([])
const timestamp = ref(null)
const mn = ref(null)
const st = ref(null)
const defaultDay = ref(7)
const month = ref(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "sunday"];
const dayArray = ref([]);
const workTime = ref([]);

const datass = ref([]);

const isPastTime = (date, time) => {
    let format = dayJS(date).format('YYYY-MM-DD');
    let timeParts = time.split(':');
    let hour = timeParts[0];
    let minute = timeParts[1].split(' ')[0];

    let newTime = new Date(format + 'T' + hour + ':' + minute + ':00').getTime();
    let today = new Date().getTime();
    return newTime <= today;
}

const disabledMinuts = (minute) => {
    if (minute == 0 || minute == 30) {
        return false
    }
    return true
}

const weekChange = () => {
    const [startHour, startMinute] = work_start.value.split(":").map(part => parseInt(part, 10));
    // const [endHour, endMinute] = end.split(":").map(part => parseInt(part, 10));

    const today = new Date().setHours(startHour, startMinute, 0, 0);
    let data = []
    for (let index = 0; index < defaultDay.value; index++) {
        // let x = today.

        let x = (today / 1000) + index * 86400;
        const currentDay = new Date(x * 1000).getDate();
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "sunday"];
        const currentWeekdayName = weekdays[new Date(x * 1000).getDay()];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthName = month.value[new Date(x * 1000).getMonth()];
        data.push({
            // label: `${new Date(x * 1000)}`
            day: currentDay,
            week: currentWeekdayName,
            month: currentMonthName
            // month: new Date(x * 1000).getMonth(),
        })
    }
    datas.value = data
}

const dayFunction = (mn) => {
    let today = new Date();
    let dayOfWeek = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Sunday)

    // Calculate the difference between the current day and Monday (assuming Monday is 1)
    let daysUntilMonday = (1 - dayOfWeek - 7) % 7;
    let mondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilMonday);

    // Adjust the date based on the given number of weeks (mn: number of weeks to move forward, sn: number of weeks to move backward)
    let targetDate = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + mn);

    dayArray.value = [];
    for (let i = 0; i < 7; i++) {
        let el = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + i);
        dayArray.value.push({ name: el.getTime() });
    }

}

const parseTime = (timeString) => {
    const time = timeString.split(':');
    return new Date(0, 0, 0, parseInt(time[0]), parseInt(time[1]));
}
const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes;
}

const workFunction = (start, end, range) => {

    const startHour = parseTime(start);
    const endHour = parseTime(end);
    let currentTime = new Date(startHour);
    const intervals = [];

    while (currentTime <= endHour) {
        intervals.push({
            name: formatTime(currentTime)
        });
        currentTime.setMinutes(currentTime.getMinutes() + range);
    }

    workTime.value = intervals;
    setData()
}

const dayNameUz = (name, type) => {
    let days = [
        {
            name: 'Monday',
            name_uz: 'Душ'
        },
        {
            name: 'Tuesday',
            name_uz: 'Сеш'
        },
        {
            name: 'Wednesday',
            name_uz: 'Чош',
        },
        {
            name: 'Thursday',
            name_uz: 'Пай',
        },
        {
            name: 'Friday',
            name_uz: 'Жу'
        },
        {
            name: 'Saturday',
            name_uz: 'Шан'
        },
        {
            name: 'Sunday',
            name_uz: 'Якш'
        }
    ]
    let months = [
        {
            name: "January",
            name_uz: 'Январ'
        },
        {
            name: "February",
            name_uz: 'Феврал'
        },
        {
            name: "March",
            name_uz: 'Март'
        },
        {
            name: "April",
            name_uz: 'Апрел'
        },
        {
            name: "May",
            name_uz: 'Май'
        },
        {
            name: "June",
            name_uz: 'Июн'
        },
        {
            name: "July",
            name_uz: 'Июл'
        },
        {
            name: "August",
            name_uz: 'Август'
        },
        {
            name: "September",
            name_uz: 'Сентябр'
        },
        {
            name: "October",
            name_uz: 'Октабр'
        },
        {
            name: "November",
            name_uz: 'Ноябр'
        },
        {
            name: "December",
            name_uz: 'Декабр'
        },
    ];
    if (type == 'day') {
        for (let day of days) {
            if (day.name === name) {
                return day.name_uz;
            }
        }
    } else {
        for (let month of months) {
            if (month.name === name) {
                return month.name_uz;
            }
        }
    }



    return 'Invalid day';

}

const dynamicMatrix = ref([])
const setData = () => {
    // Dynamically initialize a 3x3 array
    let rows = workTime.value.length;
    let cols = dayArray.value.length;
    dynamicMatrix.value = [];
    for (let i = 0; i < rows; i++) {
        dynamicMatrix.value[i] = [];
        for (let j = 0; j < cols; j++) {
            dynamicMatrix.value[i][j] = 0; // Initialize each element to 0
        }
    }
}

const getData = (x, y) => {
    // console.log(x)
    let format = dayJS(x).format('YYYY-MM-DD');

    let timeParts = y.split(':');
    let hour = parseInt(timeParts[0]);
    let minute = parseInt(timeParts[1].split(' ')[0]);
    let period = timeParts[1].split(' ')[1];

    // Adjust hour if PM
    if (period === 'PM' && hour < 12) {
        hour += 12;
    }

    // Pad hours and minutes with leading zeros if necessary
    hour = hour.toString().padStart(2, '0');
    minute = minute.toString().padStart(2, '0');

    // Create a new Date object with the formatted date and adjusted time
    let newTime = new Date(format + 'T' + hour + ':' + minute + ':00').getTime() / 1000;
    for (let i = 0; i < datass.value.length; i++) {
        let el = datass.value[i];
        if (el.inspection_time == newTime) {
            return `<div style="display: flex;  align-items: flex-start; gap: 5px; juctify border: 1px solid #007bff; background: aqua; border-radius: 5px;  padding: 8px;">
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><g fill="none"><path d="M8 3c1.523 0 2.886.68 3.803 1.754A11.975 11.975 0 0 1 16 4c1.476 0 2.89.267 4.197.754a5 5 0 1 1 7.05 7.05c.486 1.306.753 2.72.753 4.196c0 2.954-1.067 5.658-2.837 7.749l2.544 2.544a1 1 0 0 1-1.414 1.414l-2.544-2.544A11.952 11.952 0 0 1 16 28a11.953 11.953 0 0 1-7.749-2.837l-2.544 2.544a1 1 0 0 1-1.414-1.414l2.544-2.544A11.952 11.952 0 0 1 4 16c0-1.476.267-2.89.754-4.197A5 5 0 0 1 8 3zM5.67 9.89a12.06 12.06 0 0 1 4.22-4.22a3 3 0 0 0-4.22 4.22zm16.44-4.22a12.06 12.06 0 0 1 4.22 4.22a3 3 0 0 0-4.22-4.22zM16 10a1 1 0 1 0-2 0v7a1 1 0 0 0 1 1h5a1 1 0 1 0 0-2h-4v-6z" fill="green"></path></g></svg>
              <span style="font-size: 14px;">${dayJS(el.inspection_time * 1000).format('HH:mm')}- ${dayJS(el.between_time * 1000).format('HH:mm')}</span>
          </div>`;
        }
        // <span style="font-size: 14px;">${el.comment ? el.comment : ''}</span>
    }

}

const rowDataObj = ref({})
const rowClick = (date, time) => {
    let format = dayJS(date).format('YYYY-MM-DD');
    let timeParts = time.split(':');
    let hour = timeParts[0];
    let minute = timeParts[1].split(' ')[0];
    let period = timeParts[1].split(' ')[1];
    // Adjust hour if PM
    if (period === 'PM' && hour < 12) {
        hour += 12;
    }
    let newTime = new Date(format + 'T' + hour + ':' + minute + ':00').getTime() / 1000;
    let today = new Date().getTime() / 1000;
    setData()
    // if (newTime >= today) {
    //     // TaskModal.value = true;
    //     rowDataObj.value = {
    //         date: date,
    //         time: time,
    //     }
    // }else{
    //     notification.error({
    //         content: 'Хатолик!',
    //         meta: "Эски вақтда кўрик бириктириш мумкин эмас",
    //         duration: 2500,
    //         keepAliveOnHover: false
    //     })
    // }

    // data.value.push({
    //     title: 'title ',
    //     datetime: newTime
    // });
    // console.log(data.value)
};
const getComment = (x, y) => {
    let format = dayJS(x).format('YYYY-MM-DD');

    let timeParts = y.split(':');
    let hour = parseInt(timeParts[0]);
    let minute = parseInt(timeParts[1].split(' ')[0]);
    let period = timeParts[1].split(' ')[1];

    // Adjust hour if PM
    if (period === 'PM' && hour < 12) {
        hour += 12;
    }

    // Pad hours and minutes with leading zeros if necessary
    hour = hour.toString().padStart(2, '0');
    minute = minute.toString().padStart(2, '0');

    // Create a new Date object with the formatted date and adjusted time
    let newTime = new Date(format + 'T' + hour + ':' + minute + ':00').getTime() / 1000;
    for (let i = 0; i < datass.value.length; i++) {
        let el = datass.value[i];
        if (el.inspection_time == newTime) {
            comment.value = el.comment;
        }
    }
}
//  Hafta kunlari function 
const getDays = () => {
    let today = new Date();
    // get day of the week (0-6, where 0 is Sunday)
    const dayOfWeek = today.getDay();

    // calculate Monday of the current week
    const monday = new Date(today);
    // const mnday =
    monday.setDate(today.getDate() - dayOfWeek + 1);
    // calculate sunday of the current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // format dates as strings (e.g. "2023-03-01")
    const mondayString = monday.toISOString().slice(0, 10);
    const sundayString = sunday.toISOString().slice(0, 10);

    const mnDatetimeMonth = new Date(new Date(mondayString).getTime()).getMonth();
    const mnDatetimeDate = new Date(new Date(mondayString).getTime()).getDate();
    const stDatetimeMonth = new Date(
        new Date(sundayString).getTime()
    ).getMonth();
    const stDatetimeDate = new Date(new Date(sundayString).getTime()).getDate();
    mn.value = new Date(mondayString).getTime();
    st.value = new Date(sundayString).getTime();
    timestamp.value =
        mnDatetimeDate +
        "-" +
        month.value[mnDatetimeMonth] +
        " / " +
        stDatetimeDate +
        "-" +
        month.value[stDatetimeMonth];
};

let mnx = ref(0);
const nextweek = () => {
    mnx.value += 7,
        dayFunction(mnx.value)
    mn.value = mn.value + 604800000;
    st.value = st.value + 604800000;
    const mnDatetimeMonth = new Date(mn.value).getMonth();
    const mnDatetimeDate = new Date(mn.value).getDate();
    const stDatetimeMonth = new Date(st.value).getMonth();
    const stDatetimeDate = new Date(st.value).getDate();
    timestamp.value =
        mnDatetimeDate +
        "-" +
        month.value[mnDatetimeMonth] +
        " / " +
        stDatetimeDate +
        "-" +
        month.value[stDatetimeMonth];
    // getSchedule();
};

const prevweek = () => {
    mnx.value -= 7,
        dayFunction(mnx.value)
    mn.value = mn.value - 604800000;
    st.value = st.value - 604800000;
    const mnDatetimeMonth = new Date(mn.value).getMonth();
    const mnDatetimeDate = new Date(mn.value).getDate();
    const stDatetimeMonth = new Date(st.value).getMonth();
    const stDatetimeDate = new Date(st.value).getDate();
    timestamp.value =
        mnDatetimeDate +
        "-" +
        month.value[mnDatetimeMonth] +
        " / " +
        stDatetimeDate +
        "-" +
        month.value[stDatetimeMonth];
    // getSchedule();
};
//  Hafta kunlari function 

const addTask = (item, index) => {
    weekDay.value = item.name
    weekDayId.value = item.id
    TaskModal.value = true
    indexData.value = index
}

const saveDoc = () => {
    if (props.bemor_id || bemor_id.value) {
        if (shifokorID.value) {
            let format = dayJS(rowDataObj.value.date).format('YYYY-MM-DD');
            let timeParts = rowDataObj.value.time.split(':');
            let hour = timeParts[0];
            let minute = timeParts[1].split(' ')[0];
            let period = timeParts[1].split(' ')[1];
            // Adjust hour if PM
            if (period === 'PM' && hour < 12) {
                hour += 12;
            }
            // Create a new Date object with the formatted date and adjusted time
            let newTime = new Date(format + 'T' + hour + ':' + minute + ':00').getTime() / 1000;

            let data = {
                doctor_id: shifokorID.value,
                xodim: shifokorName.value,
                bemor_id: props.bemor_id || bemor_id.value,
                inspection_time: newTime,
                between_time: newTime + (parseInt(shifokorTekshiruvVaqti.value) * 60),
                comment: comment.value,
                korik_summa: shifokorKorikSumma.value,
                key: new Date().getTime()
            }

            axios.post('/doctor_inspection/check-inspection-time', data)
                .then(function (res) {
                    if (res.data == null) {
                        datass.value.push({
                            comment: comment.value,
                            inspection_time: newTime,
                            between_time: newTime + (parseInt(shifokorTekshiruvVaqti.value) * 60),
                        });

                        //shifokorTekshiruv.value.push(data);
                        // emit('shifokor', shifokorTekshiruv.value)
                        emit('shifokor', data)


                        TaskModal.value = false
                        message.success('Шифокорга бемор бириктирилди')
                        comment.value = null
                    } else {
                        notification.error({
                            content: 'Хатолик!',
                            meta: "Bu vaqtda shifokor band",
                            duration: 2500,
                            keepAliveOnHover: false
                        })
                        comment.value = null
                    }
                })
                .catch(function (error) {
                    console.log(error.message);
                })
        } else {
            message.error('Шифокор танланмади')
        }
    } else {
        notification.error({
            content: 'Хатолик!',
            meta: "Бемор танланмаган",
            duration: 1500,
            keepAliveOnHover: false
        })
    }
}

const getOneDoctorInspection = (id) => {
    // router.push({name: "RegistrationAdd", query: {id: id}})
    // axios.get('/doctor_inspection/one/' + id)
    // .then(function (res) {
    //     console.log(res.data);
    // })
    // .catch(function (error) {
    //     console.log(error.message);
    // })
}

const getDocTime = (start, end) => {
    // Initialize start time;

    const [startHour, startMinute] = start.split(":").map(part => parseInt(part, 10));
    const [endHour, endMinute] = end.split(":").map(part => parseInt(part, 10));
    // let start2= start[]
    let startTime = new Date();
    startTime.setHours(startHour, startMinute, 0); // Set to 09:00

    // Set target time
    let targetTime = new Date();
    targetTime.setHours(endHour, endMinute, 0); // Set to 18:00

    // Loop to add 30 minutes until target time is reached
    while (startTime <= targetTime) {
        // shifokorList.value.push(startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        let times = startTime.setTime(startTime.getTime() + 30 * 60000); // Add 30 minutes (30 * 60 * 1000 milliseconds);
        // console.log(new Date(times).toLocaleTimeString());
    }
}
// Get All shifokor
const shifokorList = ref([])
const getAllShifokor = () => {
    axios.get('/user/shifokor')
        .then(function (res) {
            if (res.success) {
                shifokorList.value = res.data;
                if (activeUser != 1 || activeUser != 2) {
                    changeShifokorId(Number(localStorage.getItem('user_id')))
                }
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

// get One Registration
const getOneRegistration = () => {
    if (route.query.id) {
        axios.get('/registration/info/' + route.query.id)
            .then(function (res) {
                bemor_id.value = res.data.bemor_id
                shifokorTekshiruv.value = res.data.doctor_inspections
            })
            .catch(function (error) {
                console.log(error.message);
            })
    }
}

const work_start = ref(null)
const work_end = ref(null)
const shifokorID = ref(null)
const shifokorKorikSumma = ref(null)
const shifokorTekshiruvVaqti = ref(null)

const activeUser = Number(localStorage.getItem('user_role_id'))
const disabledSelect = ref(false)
if (activeUser == 1 || activeUser == 2) {
    disabledSelect.value = false
} else {
    shifokorID.value = Number(localStorage.getItem('user_id'))
    disabledSelect.value = true
}

const changeShifokorId = (id) => {
    for (let index = 0; index < shifokorList.value.length; index++) {
        if (shifokorList.value[index].id == id) {
            shifokorTekshiruvVaqti.value = shifokorList.value[index].korik_vaqti
            shifokorKorikSumma.value = shifokorList.value[index].korik_summa
            shifokorName.value = shifokorList.value[index].full_name
            work_start.value = shifokorList.value[index].work_start
            work_end.value = shifokorList.value[index].work_end
            weekChange()
            workFunction(work_start.value, work_end.value, shifokorTekshiruvVaqti.value)
        }
    }
    axios.get('/doctor_inspection/info/' + id)
        .then(function (res) {
            datass.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })

}

const chooseShifokor = (tabName) => {
    shifokorName.value = tabName
    switch (tabName) {
        case tabName:
            let data = {
                name: tabName,
            }
            axios.post('/doctor_inspection/info', data)
                .then(function (res) {
                    datas.value = res.data.model;
                    work_start.value = res.data.work_start
                    weekChange();
                    getDocTime(res.data.work_start, res.data.work_end)
                })
                .catch(function (error) {
                    message.error(error.message)
                })
            return true;
        default:
            return true;
    }
}

onMounted(() => {
    getOneRegistration()
    getAllShifokor()
    getDays();
    dayFunction(0, 0);
    setData()

})
</script>

<style scoped lang="scss">
.bord {
    margin: 10px;
    padding: 10px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    animation: showBox 0.3s ease-in-out forwards alternate;
    height: calc(100vh - 80px);
    overflow: hidden;
    overflow: auto;
}

.boxses {
    display: flex;
    width: 100%;
    max-height: 800px;
    overflow-y: scroll;
    // display: grid;
    // grid-template-columns: repeat(7, 1fr);
    text-align: center;

    // gap: 20px 10px;
    &_item {
        width: 190px;
        height: max-content;
        border-right: 1px dashed #2080F0;
        border-left: 1px dashed #2080F0;

        .scroll {
            max-height: 300px;
            overflow-y: auto;

        }

        &_head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 5px;
            cursor: pointer;

            &:hover {
                background-color: #8fc2fc56;
            }
        }

        &_content {
            display: flex;
            flex-direction: column;
            cursor: pointer;

            .time {
                padding: 8px 5px;
                border-top: 1px dashed #2080F0;
            }

            &:hover {
                background-color: #8fc2fc56;
            }

        }

        &:last-child {
            border-right: none;
        }
    }

}

table {
    padding: 0;
    border-collapse: collapse;
    width: 100%;
    border: none;

    thead {
        background-color: #E0E7EE;
        color: #5D6DA4;
        font-weight: 600;

        td {
            padding: 5px;
        }
    }

    tbody {
        td {
            // padding: 5px;
            cursor: pointer;
        }
    }

    // tr,
    th,
    td {
        padding: 5px;
        border: 1px dashed #409ECF;
    }
}

.shifokor {
    display: flex;
    flex-direction: column;
    gap: 10px;

    &_item {
        display: grid;
        grid-template-columns: 25% 75%;
        align-items: center;
        gap: 10px;

        span {
            font-weight: 600;
        }
    }
}

.wrap {
    display: flex;
    align-items: center;
    gap: 20px;

    .davomiylik {
        position: relative;
        width: 150px;
        padding: 8px 25px 8px 10px;
        border: 1px solid #e0e0e6;
        border-radius: 7px;
        outline: none;
    }

    .button {
        display: flex;
        flex-direction: column;
        position: absolute;
        right: 0;
        top: 0;
        border-left: 1px solid #e0e0e6;

        span {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 19px;
            padding: 0 5px;
            font-weight: 700;
            font-size: 20px;
            cursor: pointer;

            &:nth-child(even) {
                border-top: 1px solid #e0e0e6;
            }

            &:hover {
                background-color: #2080F0;
                border-radius: 0 7px 0px 0;
                color: #fff;
            }

            &:hover:nth-child(even) {
                background-color: #2080F0;
                border-radius: 0 0px 7px 0;
                color: #fff;
            }
        }
    }
}
.red-background {
    background-color: #E0E7EE;
}
</style>