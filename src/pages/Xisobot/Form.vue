<template>
    <div class="container">
        <div class="card">
            <div class="card_item">
                <div class="card_item_head">
                    <span>{{ $t('employee') }}</span>
                </div>
                <div class="card_item_body">
                    <router-link class="title" target="_blank" :to="{ path: '/shifokor_xisoboti'}">{{ $t('employee_report') }}</router-link>
                    <router-link class="title" target="_blank" :to="{ path: '/shifokor_sverka'}">{{ $t('employee_sverka') }}</router-link>
                </div>
            </div>
            <div class="card_item" v-if="activeUser == 1 || activeUser == 2 || activeUser == 4">
                <div class="card_item_head">
                    <span>{{ $t('kassa') }}</span>
                </div>
                <div class="card_item_body">
                    <!-- <router-link class="title" target="_blank" :to="{ path: '/kassa_xisobot'}">Касса хисоботи</router-link> -->
                    <router-link class="title" target="_blank" :to="{ path: '/kassa_sverka'}">{{ $t('kassa_sverka') }}</router-link>
                </div>
            </div>
            <div class="card_item" v-if="activeUser == 1 || activeUser == 2 || activeUser == 4">
                <div class="card_item_head">
                    <span>{{ $t('kontragent') }}</span>
                </div>
                <div class="card_item_body">
                    <router-link class="title" target="_blank" :to="{ path: '/kontragent_xisobot'}">{{ $t('kontragent_report') }}</router-link>
                    <router-link class="title" target="_blank" :to="{ path: '/kontragent_sverka'}">{{ $t('kontragent_sverka') }}</router-link>
                </div>
            </div>
            <div class="card_item" v-if="activeUser == 1 || activeUser == 2 || activeUser == 4">
                <div class="card_item_head">
                    <span>{{ $t('reagent') }}</span>
                </div>
                <div class="card_item_body">
                    <router-link class="title" target="_blank" :to="{ path: '/reagent_xisobot'}">{{ $t('reagent_report') }}</router-link>
                    <router-link class="title" target="_blank" :to="{ path: '/reagent_sverka'}">{{ $t('reagent_sverka') }}</router-link>
                    <!-- <router-link class="title" target="_blank" :to="{ path: '/reagent_xodim'}">{{ $t('reagent_xodim') }}</router-link> -->
                    <!-- <router-link class="title" target="_blank" :to="{ path: '/reagent_tekshiruv'}">Текширув бўйича</router-link> -->
                </div>
            </div>
            <div class="card_item">
                <div class="card_item_head">
                    <span>{{ $t('statistic') }}</span>
                </div>
                <div class="card_item_body">
                    <router-link class="title" target="_blank" :to="{ path: '/korik_soni'}">{{ $t('doctor_ins') }}</router-link>
                    <!-- <router-link class="title" target="_blank" :to="{ path: '/tekshiruv_statistics'}">{{ $t('tek') }}</router-link> -->
                    <router-link  v-if="activeUser == 1 || activeUser == 2 || activeUser == 4" class="title" target="_blank" :to="{ path: '/bemor_statistics'}">{{ $t('bemor') }}</router-link>
                </div>
            </div>
            <div class="card_item" v-if="activeUser == 1 || activeUser == 2 || activeUser == 4">
                <div class="card_item_head">
                    <span>{{ $t('texnik') }}</span>
                </div>
                <div class="card_item_body">
                    <router-link class="title" target="_blank" :to="{ path: '/texnik_xisobot'}">{{ $t('texnik_report') }}</router-link>
                    <router-link class="title" target="_blank" :to="{ path: '/texnik_sverka'}">{{ $t('texnik_sverka') }}</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
const router = useRouter()
const activeUser = Number(localStorage.getItem('user_role_id'))
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()

</script>

<style scoped lang="scss">
.container{
  margin: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  animation: showBox 0.3s ease-in-out forwards alternate;
  height: calc(100vh - 80px);
  overflow: hidden;
  overflow: auto;
}
.card{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
    &_item{
        background-color: #DEDEDE;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        animation: showBox 0.3s ease-in-out forwards alternate;
        min-height: 200px;
        max-height: max-content;
        max-width: 300px;
        min-width: 250px;
        &_head{
            text-align: center;
            border-bottom: 1px solid #007BFF;
            color: #084d96;
            padding: 5px;
            span{
                font-size: 18px;
                font-weight: 600;
            }
        }
        &_body{
            display: flex;
            flex-direction: column;
            gap: 3px;
            color: #084d96;
            padding: 10px 15px;
            .title{
                font-size: 16px;
                font-weight: 600;
                text-decoration: none;
                color: #084d96;
            }
        }
    }
}

</style>