<template>
    <n-layout has-sider>
        <n-layout-sider v-if="counter.showNavbar" :bordered="true" collapse-mode="width" :collapsed-width="leftMenu ? 70 : 0" :width="leftMenu ? 260 : 0"
            :collapsed="collapsed" :native-scrollbar="true" @collapse="collapsed = true" :style="{ height: '100vh' }"
            @expand="collapsed = false">
            <div class="navbar-header" :class="collapsed ? '' : 'navbar-header_active'" @click="router.push('/home')">
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
                    <n-button strong secondary type="warning" @click="getRegClick" >
                        <n-icon size="25">
                            <DocumentBulletListOff24Filled/>
                        </n-icon>
                    </n-button>
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

    <div class="regModal">
        <n-modal v-model:show="regModal">
            <n-card
                style="width: 1000px; background: #F4F6FD;"
                :title="t('qora_list')"
                :bordered="false"
                size="huge"
                role="dialog"
                aria-modal="true"
            >
                <template #header-extra>
                    <div class="search">
                        <Transition name="slide-fade">
                            <div v-if="isSearch" class="search-box">
                                <n-input style="width: 300px;" :placeholder="t('search')" v-model:value="searchText" @change="searchBemor" clearable />
                            </div>
                        </Transition>
                        <n-button @click="openInput" strong secondary type="info">
                            <n-icon size="25">
                                <SearchRound v-if="!isSearch" />
                                <Clean v-else />
                            </n-icon>
                        </n-button>
                        <n-button strong secondary type="error" @click="regModal = false">
                            <n-icon size="25">
                                <CloseRound />
                            </n-icon>
                        </n-button>
                    </div>
                </template>
                <div class="birthday">
                    <n-data-table style="width: 100%; max-height: 700px; min-height: 300px; background: #F4F6FD;" :columns="columns" :data="bemorList"/>
                </div>
            </n-card>
        </n-modal>
    </div>
    <!-- <n-modal 
        v-model:show="regModal" 
        preset="card" 
        style="width: 1000px; background: #F4F6FD;" 
        :title="t('qora_list')"
    >
        <div class="search">
            <Transition name="slide-fade">
                <div v-if="isSearch" class="search-box">
                    <n-input style="width: 300px;" :placeholder="t('search')" v-model:value="searchText"
                    @change="searchBemor" clearable />
                </div>
            </Transition>
            <n-button @click="isSearch = !isSearch" strong secondary type="info">
                <n-icon size="25">
                    <SearchRound v-if="!isSearch" />
                    <CloseRound v-else />
                </n-icon>
            </n-button>
        </div>
        <div class="birthday">
            <n-data-table style="max-height: 700px; min-height: 300px; background: #F4F6FD;" :columns="columns" :data="bemorList"/>
        </div>
    </n-modal> -->

</template>

<script setup>
import axios from 'axios';
import { ref, h, onMounted, defineEmits, watch, reactive, inject } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { useMessage, useDialog, NIcon, NTag, NButton } from "naive-ui";
import { Person as PersonIcon, LogOutOutline as LogoutIcon, PersonAdd, Home,DocumentAttach, GitBranchOutline, Menu} from "@vicons/ionicons5";
import { Wheelchair, MoneyBillAltRegular, Download,Upload,Sms,BirthdayCake } from '@vicons/fa'
import { TextBulletListSquareEdit24Filled, BuildingBank24Filled, Doctor20Filled, DocumentBulletList24Filled,PeopleQueue24Filled,PeopleMoney24Filled,Box16Filled,PersonMoney20Filled,MoneyHand24Filled,BookAdd20Filled, Settings24Filled, MoneyCalculator24Regular,DocumentTable24Filled,PersonEdit24Filled, DocumentBulletListOff24Filled, ArrowSwap24Filled } from '@vicons/fluent'
import { GroupRound, MeetingRoomFilled,MenuBookSharp,BuildSharp,ShoppingBagFilled, MenuRound, MenuOpenTwotone, RefreshFilled, SearchRound, CloseRound } from '@vicons/material'
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { Delivery, Clean } from '@vicons/carbon'
import { I18nD, useI18n } from "vue-i18n";
import Birthday from "../Bemor/Birthday.vue";
import { useEventBus } from '../../emitter';
import { useCounterStore } from '../../stores/counter';
const dayJS = inject('dayJS')
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
const regModal = ref(false)
const count = ref(null)
const bemorList = ref([])
const isSearch = ref(false)
const searchText = ref(null);

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

const columns = [
    {
        title: '№',
        render: (_, index) => {
            return index + 1 + (paginationReactive.page - 1) * paginationReactive.pageSize
        },
    },
    {
        title: t("data"),
        render(row) {
            return dayJS(row.updated_at * 1000).format('YYYY-MM-DD') + ' / ' + dayJS(row.updated_at * 1000).format("HH:mm")
        }
    },
    {
        title: t('bemor_fio'),
        key: 'bemor_name'
    },
    {
        title: t('phone_number'),
        render(row){
            return usePhoneFormat(row.bemor.phone_number)
        }
    },
    {
        title: t('status'),
        key: 'status',
        render(row) {
            return h(
                NTag,
                {
                    type: row.status === 'active' ? 'success' : 'error', // rangni farqlash uchun
                    bordered: false
                },
                {
                    default: () => row.status === 'active' ? 'Kelgan' : 'Kelmagan' // tarjimasi bo‘lsa
                }
            )
        }
    },
    {
        title: '',
        key: "action",
        width: 50,
        render(row) {
            return [
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'warning',
                        style: 'border-radius: 5px;',
                        onClick: (e) => {
                            let datas = {
                                id: row.id,
                                status: 'active'
                            }
                            axios.post('/registration/update_status', datas)
                            .then((res)=> {
                                if(res.success) {
                                    eventBus.$emit('getRegistration')
                                    getRegistration()
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
                                size: '20',
                                component: RefreshFilled
                            })
                    }
                )
            ]
        }
    }
]

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
    }else {
        getRegistration()
    }
}

const openInput = () => {
    searchText.value = null
    isSearch.value = !isSearch.value
    getRegistration()
}

const changeLang = () => {
    localStorage.setItem('lang', activLang.value)
    locale.value = activLang.value;
    router.go(0)
}

const menuOptions = [
    // {
    //     label: t("home"),
    //     key: "Home",
    //     icon: renderIcon(Home),
    //     // show: (activeUser == 1 || activeUser == 2 || activeUser == 4) ? true : false
    // },
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
            {
                label: t('maxsulot_aylanma'),
                key: "Reagent",
                icon: renderIcon(ArrowSwap24Filled),
                show: (activeUser == 5 || activeUser == 3) ? false: true
            },
            {
                label: t('labaratory'),
                key: "Labaratoriya",
                icon: renderIcon(Settings24Filled),
                show: (activeUser == 5 || activeUser == 3) ? false: true
            }
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

const getRegistration = () => {
    axios.get('/registration/all')
    .then(function (res) {
      if(res.success){
        bemorList.value = res.data;
      }
    })
    .catch(function (error) {
      console.log(error.message);
    })
}

const getRegClick = () => {
    getRegistration()
    regModal.value = true
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

<style scoped>
.navbar-header{
    display: flex;
    align-items: end;
    border-bottom: 1px solid #ffffff;
    cursor: pointer;
}
.logo_text{
    font-size: 25px;
}
.navbar-body{
    max-height: calc(100vh - 80px);
    overflow-y: scroll;
}
.search {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    /* position: absolute;
    top: 10px;
    right: 50px; */
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
