<template>
    <n-layout has-sider>
        <n-layout-sider v-if="counter.showNavbar" :bordered="true" collapse-mode="width" :collapsed-width="leftMenu ? 70 : 0" :width="leftMenu ? 260 : 0"
            :collapsed="collapsed" :native-scrollbar="true" @collapse="collapsed = true" :style="{ height: '100vh' }"
            @expand="collapsed = false">
            <div class="navbar-header" :class="collapsed ? '' : 'navbar-header_active'">
                <img style=" width: 50px; height: 45px;" src="/mehri.png" alt="tooth">
                <p class="logo_text" v-if="!collapsed" style="color: #fff;">Mehri</p>
                <!-- <img style=" width: 50px; height: 45px;" src="/lgoo.png" alt="tooth">
                <h1 v-if="!collapsed" style="color: #fff;">DIGIDENT</h1> -->
            </div>
            <div class="navbar-body">
                <n-menu :collapsed="collapsed" v-model:value="selectMenu" :collapsed-width="64" :collapsed-icon-size="25"
                    :options="menuOptions" :on-update:value="updateValue" @update:expanded-keys="UpdateAccordion" :default-expanded-keys="accordionValue" >
                </n-menu>
            </div>
        </n-layout-sider>
        <n-layout>
            <div class="header" v-if="counter.showNavbar">
                <div class="header-item" v-if="leftMenu">
                    <n-button strong secondary type="info" @click="collapsed = !collapsed"><n-icon size="20"><MenuRound v-if="!collapsed"/> <MenuOpenTwotone v-else/></n-icon></n-button>
                    <span style="font-size: 18px; font-weight: 500;">{{ activUser }} / {{ currentRole }}</span>
                </div>
                <div class="header-item" style="display: flex; align-items: center; gap: 20px;">
                    <n-popselect v-model:value="activLang" :options="langList" size="small" @update:value="changeLang">
                        <n-button style="width: 85px; font-size: 17px; font-weight: 600;" strong secondary type="primary" >{{ activLang }}</n-button>
                    </n-popselect>
                    <n-badge :value="count" :max="30">
                        <n-button strong secondary circle type="success">
                            <n-icon @click="birthdayModal" size="22"><BirthdayCake/></n-icon>
                        </n-button>
                    </n-badge>
                    <n-button strong secondary type="error" @click="userSetting">
                        <n-icon size="25">
                            <LogoutIcon/>
                        </n-icon>
                    </n-button>
                </div>
            </div>
            <div class="router-view">
                <RouterView />
            </div>
        </n-layout>
    </n-layout>

    <n-modal 
        v-model:show="addedModal" 
        class="custom-card" 
        preset="card" 
        style="width: 1000px; background: #F4F6FD;" 
        :title="t('birthday')"
    >
        <Birthday @closeModal="close"/>
    </n-modal>

</template>

<script setup>
import axios from 'axios';
import { ref, h, onMounted, defineEmits, watch } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { useMessage, useDialog, NIcon } from "naive-ui";
import { Person as PersonIcon, LogOutOutline as LogoutIcon, PersonAdd, Home,DocumentAttach, GitBranchOutline, Menu} from "@vicons/ionicons5";
import { Wheelchair, MoneyBillAltRegular, Download,Upload,Sms,BirthdayCake } from '@vicons/fa'
import { TextBulletListSquareEdit24Filled, BuildingBank24Filled, Doctor20Filled, DocumentBulletList24Filled,PeopleQueue24Filled,PeopleMoney24Filled,Box16Filled,PersonMoney20Filled,MoneyHand24Filled,BookAdd20Filled, Settings24Filled, MoneyCalculator24Regular,DocumentTable24Filled,PersonEdit24Filled } from '@vicons/fluent'
import { GroupRound, MeetingRoomFilled,MenuBookSharp,BuildSharp,ShoppingBagFilled, MenuRound, MenuOpenTwotone } from '@vicons/material'
import { Delivery } from '@vicons/carbon'
import { I18nD, useI18n } from "vue-i18n";
import Birthday from "../Bemor/Birthday.vue";
import { useEventBus } from '../../emitter';
import { useCounterStore } from '../../stores/counter';
const counter = useCounterStore()
const eventBus = useEventBus()
const { t, locale } = useI18n()
const activUser = ref(localStorage.getItem('user_name'))
const router = useRouter();
const route = useRoute()
const message = useMessage();
const dialog = useDialog();
const inverted = ref(false);
const currentRole = ref(localStorage.getItem('role'));
const activLang = ref(localStorage.getItem('lang'));
const activeUser = Number(localStorage.getItem('user_role_id'))
const addedModal = ref(false)
const count = ref(null)

const langList = [
    {
        label: "uz-uz",
        value: "uz"
    },
    {
        label: "ru-ру",
        value: "ru"
    },
    {
        label: "en-en",
        value: "eng"
    },
    {
        label: "uz-уз",
        value: "uzk"
    },
]

const changeLang = () => {
    localStorage.setItem('lang', activLang.value)
    locale.value = activLang.value;
    router.go(0)
}

const menuOptions = [
    {
        label: t("home"),
        key: "Home",
        icon: renderIcon(Home),
        // show: (activeUser == 1 || activeUser == 2 || activeUser == 4) ? true : false
    },
    {
        label: t("report"),
        key: "XisobotForm",
        icon: renderIcon(DocumentBulletList24Filled),
        show: (activeUser == 1 || activeUser == 2 || activeUser == 3 || activeUser == 4) ? true : false
    },
    {
        label: t("dokument"),
        key: "Документ",
        icon: renderIcon(BookAdd20Filled),
        children: [
            // {
            //     label: t("registration"),
            //     key: "Registration",
            //     icon: renderIcon(PersonAdd),
            // },
            {
                label: t("backlog"),
                key: "Backlog",
                icon: renderIcon(MoneyCalculator24Regular),
                show: (activeUser == 3) ? false: true
            },
            {
                label: t("kassa_order"),
                key: "Kassa-order",
                icon: renderIcon(BuildingBank24Filled),
                show: (activeUser == 5 || activeUser == 3) ? false: true
            },
            {
                label: t("maosh"),
                key: "SelaryCalc",
                icon: renderIcon(MoneyHand24Filled),
                show: (activeUser == 5 || activeUser == 3) ? false: true
            },
            {
                label: t("xodimga_tolov"),
                key: "Tolov",
                icon: renderIcon(PersonMoney20Filled),
                show: (activeUser == 5 || activeUser == 3) ? false: true
            },
            {
                label: t("prixod"),
                key: "Prixod",
                icon: renderIcon(Download),
                show: (activeUser == 5 || activeUser == 3) ? false: true
            },
            // {
            //     label: t("boshlangich"),
            //     key: "BoshlangichQoldiq",
            //     icon: renderIcon(DocumentAttach),
            //     show: (activeUser == 5 || activeUser == 3) ? false: true
            // },
            {
                label: t("kontragent_tolov"),
                key: "KontragentTolov",
                icon: renderIcon(PeopleMoney24Filled),
                show: (activeUser == 5 || activeUser == 3) ? false: true
            },
            {
                label: t("texnik_pay"),
                key: "TexnikPay",
                icon: renderIcon(PeopleMoney24Filled),
                show: (activeUser == 5 || activeUser == 3) ? false: true
            },
            // {
            //     label: t("reagent_prixod"),
            //     key: "ReagentPrixodForm",
            //     icon: renderIcon(Download),
            //     show: (activeUser == 5 || activeUser == 3) ? false: true
            // },
            // {
            //     label: t("reagent_rasxod"),
            //     key: "ReagentRasxodForm",
            //     icon: renderIcon(Upload),
            //     show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false : true
            // }
        ]
    },
    {
        label: t("malumot"),
        key: "Маълумот",
        icon: renderIcon(MenuBookSharp),
        children: [
            // {
            //     label: t("sklad"),
            //     key: "Sklad",
            //     icon: renderIcon(ShoppingBagFilled),
            //     show: (activeUser == 5 || activeUser == 3) ? false: true
            // },
            {
                label: t("bemor"),
                key: "Bemor",
                icon: renderIcon(GroupRound),
            },
            {
                label: t("sms"),
                key: "SMS_send",
                icon: renderIcon(Sms),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            {
                label: t("navbat"),
                key: "DoctorNavbat",
                icon: renderIcon(PeopleQueue24Filled),
            },
            // {
            //     label: t("navbat"),
            //     key: "NavbatForm",
            //     icon: renderIcon(PeopleQueue24Filled),
            // },
            {
                label: t("xodim"),
                key: "Xodim",
                icon: renderIcon(PersonIcon),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            // {
            //     label: "Шифокорлар",
            //     key: "Shifokor",
            //     icon: renderIcon(Doctor20Filled),
            //     show: (currentRole.value == "Shifokor" ) ? false: true
            // },
            {
                label: t("tek_bolim"),
                key: "Tekshiruv_Bolim",
                icon: renderIcon(TextBulletListSquareEdit24Filled),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            {
                label: t("tek"),
                key: "TekshiruvChild",
                icon: renderIcon(TextBulletListSquareEdit24Filled),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            {
                label: t("xona"),
                key: "Xona",
                icon: renderIcon(MeetingRoomFilled),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            {
                label: t("kontragent"),
                key: "Kontragent",
                icon: renderIcon(Delivery),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            {
                label: t("maxsulot"),
                key: "Product",
                icon: renderIcon(Box16Filled),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            {
                label: t("texnik"),
                key: "Texnik",
                icon: renderIcon(DocumentTable24Filled),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            {
                label: t("texnik_xizmat"),
                key: "TexnikXizmat",
                icon: renderIcon(DocumentTable24Filled),
                show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            },
            // {
            //     label: t("sozlama"),
            //     key: "Settings",
            //     icon: renderIcon(Settings24Filled),
            //     show: (activeUser == 5 || activeUser == 4 || activeUser == 3) ? false: true
            // },
            {
                label: t("filial"),
                key: "Filial",
                icon: renderIcon(GitBranchOutline),
                show: (activeUser == 1) ? true : false
            },
        ]
    },
];

function renderIcon(icon) {
    return () => h(NIcon, null, { default: () => h(icon) });
}
const userSetting = (e) => {
    dialog.info({
        title: t('warning'),
        content: t('exit_window'),
        positiveText: t('exit_btn'),
        negativeText: t('cencel_btn'),
        onPositiveClick: () => {
            router.push({name:'Login'})
            localStorage.clear()
        },
        onNegativeClick: () => {
            // message.error("Not Sure");
        }
    })
}

const birthdayModal = () => {
    addedModal.value = true;
}

const close = () => {
    addedModal.value = false;
}

const ThemeAction = ref(false);
const collapsed = ref(true);
const selectMenu = ref(null);
const leftMenu = ref(true);
const emits = defineEmits(['themeupdate']);
const navbarBtn = () => {
    if (collapsed.value) {
        collapsed.value = false;
    } else {
        collapsed.value = true;
    }
}
const panels = ref(['Home']);
const updateValue = (e) => {
    router.push({ name: e })
    selectMenu.value = e;
    inverted.value = true;
    localStorage.setItem('selected', e)
}
const accordionValue = ref([]);
const UpdateAccordion = (e) => {
  accordionValue.value = e;
  localStorage.removeItem("accordion");
  localStorage.setItem("accordion", accordionValue.value);
};

watch(ThemeAction, (val) => {
    localStorage.setItem("theme", val)
    emits('themeupdate', val)
    if (val) {
        message.info('Dark theme')
    } else {
        message.info('Light theme')
    }
})
watch(collapsed, (val) => {
    localStorage.setItem('collopsed', val);
})
const getBemorBirthday = () => {
    axios.get('/bemor/birthday')
    .then(function (res) {
      if(res.success){
        count.value = res.data.length;
      }
    })
    .catch(function (error) {
      console.log(error.message);
    })
}

onMounted(() => {
    getBemorBirthday()
    let accordion = localStorage.getItem("accordion");
    if (localStorage.getItem("theme") != null) {
        ThemeAction.value = JSON.parse(localStorage.getItem("theme").toLowerCase());
    }
    if (accordion) {
        accordionValue.value.push(accordion)
    }
    selectMenu.value = route.name;
})
const name = ref(1);
const handleClose = (val) => {
    const index = panels.value.findIndex((v) => val === v);
    if (panels.value.length == 1) {
        message.error("The last one!");
    }
    if (panels.value[index] != 'Home') {
        panels.value.splice(index, 1);
    }
    if (name.value === val) {
        message.info("Close " + val);
        name.value = panels.value[index];
    }
}
</script>

<style scoped>
/* .header{
    padding-bottom: 15px;
    background-color: #d2d4d6;
} */
.navbar-header{
    display: flex;
    align-items: end;
    border-bottom: 1px solid #ffffff;
}
.logo_text{
    font-size: 25px;
}
.navbar-body{
    max-height: calc(100vh - 80px);
    overflow-y: scroll;
}
</style>
