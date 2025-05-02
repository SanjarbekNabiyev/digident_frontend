<script setup>
import App from '../App.vue';
import { ref , onMounted} from 'vue';
import { darkTheme, lightTheme  } from 'naive-ui'
import {useCounterStore} from "../stores/counter";
const counter = useCounterStore()
const themes = ref(lightTheme)
const uzUz = {
  name: "uz-UZ",
  global: {
    undo: "Bekor qilish",
    redo: "Qayta qiling",
    confirm: "Tasdiqlash",
  },
  Popconfirm: {
    positiveText: "Tasdiqlash",
    negativeText: "Bekor qilish",
  },
  Cascader: {
    placeholder: "Iltimos tanlang",
    loading: "Yuklanmoqda",
    loadingRequiredMessage: (label) =>
      `Belgilashdan oldin ${label} ning barcha ichki elementlarini tanlang.`,
  },
  Time: {
    dateFormat: "dd.MM.yyyy",
    dateTimeFormat: "dd.MM.yyyy HH:mm:ss",
  },
  DatePicker: {
    yearFormat: "yyyy",
    monthFormat: "MM",
    dayFormat: "eeeeee",
    yearTypeFormat: "yyyy",
    monthTypeFormat: "yyyy-MM",
    dateFormat: "yyyy-MM-dd",
    dateTimeFormat: "dd.MM.yyyy HH:mm:ss",
    quarterFormat: "yyyy-qqq",
    clear: "Tozalash",
    now: "Hozir",
    confirm: "Tasdiqlash",
    selectTime: "Vaqtni tanlang",
    selectDate: "Sanani tanlang",
    datePlaceholder: "Sanani tanlang",
    datetimePlaceholder: "Sana va vaqtni tanlang",
    monthPlaceholder: "Oyni tanlang",
    yearPlaceholder: "Yilni tanlang",
    quarterPlaceholder: "Chorakni tanlang",
    startDatePlaceholder: "Boshlanish sanasi",
    endDatePlaceholder: "Tugash sanasi",
    startDatetimePlaceholder: "Boshlanish sanasi va vaqti",
    endDatetimePlaceholder: "Tugash sanasi va vaqti",
    monthBeforeYear: true,
    firstDayOfWeek: 6,
    today: "Bugun",
  },
  DataTable: {
    checkTableAll: "Jadvaldagi barchasini tanlash",
    uncheckTableAll: "Jadvaldagi barcha tanlovni olib tashlash",
    confirm: "Tasdiqlash",
    clear: "Tozalash",
  },
  Transfer: {
    sourceTitle: "Manba",
    targetTitle: "Maqsad",
  },
  Empty: {
    description: "Маълумот йўқ",
  },
  Select: {
    placeholder: "Илтимос танланг",
  },
  TimePicker: {
    placeholder: "Вақтни танланг",
    positiveText: "OK",
    negativeText: "Бекор қилиш",
    now: "Hozir",
  },
  Pagination: {
    goto: "O'tish",
    selectionSuffix: "sahifa",
  },
  DynamicTags: {
    add: "Qo'shish",
  },
  Log: {
    loading: "Yuklanmoqda",
  },
  Input: {
    placeholder: "Iltimos, kiriting",
  },
  InputNumber: {
    placeholder: "Iltimos, kiriting",
  },
  DynamicInput: {
    create: "Yaratmoq",
  },
  ThemeEditor: {
    title: "Mavzu muharriri",
    clearAllVars: "Barcha o'zgaruvchilarni tozalash",
    clearSearch: "Qidiruvni tozalash",
    filterCompName: "Filtr komponenti nomi",
    filterVarName: "Filter Variable Name",
    import: "Import",
    export: "Export",
    restore: "Reset to Default",
  },

  // TODO: translation
  Image: {
    tipPrevious: "Oldingi rasm (←)",
    tipNext: "Keyingi rasm (→)",
    tipCounterclockwise: "Soat miliga teskari",
    tipClockwise: "Soat yo'nalishi bo'yicha",
    tipZoomOut: "Kichraytirish",
    tipZoomIn: "Kattalashtirish",
    tipClose: "Yopish (Esc)",
  },
};
const themeOverrides = {
  common: {
    primaryColor: '#007BFF',
    primaryColorHover: '#007BFF',
    primaryColorPressed: '#007BFF',
    primaryColorSuppl: '#007BFF',
    textColor2: '#000',
    borderRadius: '4px',
    modalColor: '#eee',
    fontWeight: '500',
    fontSize: '16px',
    lineHeight: '20px',
    // textColorDisabled: '#fff',
  },
  Layout: {
    siderColor: '#00009D',
  },
  Button: {
    // colorSecondary: '#007BFF',
    // colorSecondaryHover: '#064d99',
    // colorSecondaryPressed: '#007BFF',
  },
  Input: {
    borderHover: "1px solid #007BFF",
    borderFocus: "1px solid #007BFF",
  },
  DataTable: {
    thColor: '#9aa2aa',
    thTextColor: '#fff',
  },
  Tabs: {
    colorSegment: "#D3E4E7",
    tabColorSegment: '#5CB553',
    tabTextColorSegment: "#007BFF",
    tabTextColorActiveSegment: "#fff",
    tabTextColorHoverSegment: "#007BFF",
    tabFontSizeMedium: "16px",
    fontWeightStrong: "500",
  },
  Tooltip: {
    color: "#cdcdcd",
    textColor: "#000",
  },
  Menu:{
    "borderRadius": "5px",
    "color": "#00009D",
    "groupTextColor": "#fff",
    "itemColorHover": "#cccccc15",
    "itemColorActive": "#00BCD4",
    "itemColorActiveHover": "#00BCD4",
    "itemColorActiveCollapsed": "rgba(14, 130, 69, 0.1)",
    "itemTextColor": "#fff",
    "itemTextColorHover": "#fff",
    "itemTextColorActive": "#fff",
    "itemTextColorActiveHover": "#fff",
    "itemTextColorChildActive": "#1AEB7DFF",
    "itemTextColorChildActiveHover": "#21E07BFF",
    "itemTextColorHorizontal": "rgba(56, 70, 84, 1)",
    "itemTextColorHoverHorizontal": "#22C66AFF",
    "itemTextColorActiveHorizontal": "#22DE7BFF",
    "itemTextColorActiveHoverHorizontal": "#0DDE70FF",
    "itemTextColorChildActiveHorizontal": "#0C914AFF",
    "itemTextColorChildActiveHoverHorizontal": "#33DD83FF",
    "itemIconColor": "#fff",
    "itemIconColorHover": "#fff",
    "itemIconColorActive": "#fff",
    "itemIconColorActiveHover": "#fff",
    "itemIconColorChildActive": "#1EDC77FF",
    "itemIconColorChildActiveHover": "#15CC6BFF",
    "itemIconColorCollapsed": "#fff",
    "itemIconColorHorizontal": "rgba(39, 125, 211, 1)",
    "itemIconColorHoverHorizontal": "#1EBE64FF",
    "itemIconColorActiveHorizontal": "#1DDA76FF",
    "itemIconColorActiveHoverHorizontal": "#4AE090FF",
    "itemIconColorChildActiveHorizontal": "#11CB68FF",
    "itemIconColorChildActiveHoverHorizontal": "#29DD7EFF",
    "itemHeight": "40px",
    "arrowColor": "#fff",
    "arrowColorHover": "#fff",
    "arrowColorActive": "#fff",
    "arrowColorActiveHover": "#fff",
    "arrowColorChildActive": "#fff",
    "arrowColorChildActiveHover": "#fff",
    "colorInverted": "#fff",
    "borderColorHorizontal": "#A7333300",
    "fontSize": "17px",
    "fontWeight": "700",
    "dividerColor": "#fff",
    "itemColorHoverInverted": "#fff",
    "itemColorActiveInverted": "#fff",
    "itemColorActiveHoverInverted": "#fff",
    "itemColorActiveCollapsedInverted": "#fff",
    "itemTextColorInverted": "#fff",
    "itemTextColorHoverInverted": "#fff",
    "itemTextColorChildActiveInverted": "#fff",
    "itemTextColorChildActiveHoverInverted": "#fff",
    "itemTextColorActiveInverted": "#fff",
    "itemTextColorActiveHoverInverted": "#fff",
    "itemTextColorHorizontalInverted": "#fff",
    "itemTextColorHoverHorizontalInverted": "#fff",
    "itemTextColorChildActiveHorizontalInverted": "#fff",
    "itemTextColorChildActiveHoverHorizontalInverted": "#fff",
    "itemTextColorActiveHorizontalInverted": "#fff",
    "itemTextColorActiveHoverHorizontalInverted": "#fff",
    "itemIconColorInverted": "#fff",
    "itemIconColorHoverInverted": "#fff",
    "itemIconColorActiveInverted": "#fff",
    "itemIconColorActiveHoverInverted": "#fff",
    "itemIconColorChildActiveInverted": "#fff",
    "itemIconColorChildActiveHoverInverted": "#fff",
    "itemIconColorCollapsedInverted": "#fff",
    "itemIconColorHorizontalInverted": "#fff",
    "itemIconColorHoverHorizontalInverted": "#fff",
    "itemIconColorActiveHorizontalInverted": "#fff",
    "itemIconColorActiveHoverHorizontalInverted": "#fff",
    "itemIconColorChildActiveHorizontalInverted": "#fff",
    "itemIconColorChildActiveHoverHorizontalInverted": "#fff",
    "arrowColorInverted": "#fff",
    "arrowColorHoverInverted": "#fff",
    "arrowColorActiveInverted": "#fff",
    "arrowColorActiveHoverInverted": "#fff",
    "arrowColorChildActiveInverted": "#fff",
    "arrowColorChildActiveHoverInverted": "#fff",
    "groupTextColorInverted": "#fff"
  },
}

const changeTheme = (e) =>{
    if(e){
        themes.value = darkTheme
    }else{
        themes.value = lightTheme
    }
}

</script>
<template>
<n-config-provider :theme="themes" :theme-overrides="themeOverrides" :locale="uzUz" >
  <n-loading-bar-provider>
    <n-dialog-provider>
      <n-message-provider>
        <n-notification-provider>
        <n-loading-bar-provider>
            <App/>
        </n-loading-bar-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-dialog-provider>
  </n-loading-bar-provider>
</n-config-provider>
</template>