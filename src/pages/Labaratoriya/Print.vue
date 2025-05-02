<template>
    <div class="wrap">
        <div class="wrap_head">
            <img 
                v-if="list && list.image" 
                :src="BASE_URL + list.image" 
                alt="tooth" 
                height="100px" 
                width="100px"
            >
            <div v-else>
                <span>No Image Available</span>
            </div>
            <div class="wrap_head_info" v-if="list">
                <span class="title">{{ list.name || 'No Name' }}</span>
                <span class="phone">📞 {{ list.phone_number || 'No Phone' }}</span>
                <span class="phone">📍 Farg'ona sh. Airaport k, 1-uy</span>
                <span class="phone">📥 @sanjarbek_nabiyev</span>
            </div>
        </div>
        <div class="wrap_body">
            <div class="wrap_body_item">
                <span class="title">{{ $t('data') }}</span>
                <span class="value">{{ dayJS(printData.datetime).format('DD/MM/YYYY') }}</span>
            </div>
            <div class="wrap_body_item">
                <span class="title">{{ $t('bemor_fio') }}</span>
                <span class="value">{{ printData.bemor_name || 'No Bemor' }}</span>
            </div>
            <div class="wrap_body_item">
                <span class="title">{{ $t('doctor') }}</span>
                <span class="value">{{ printData.doctor_name || 'No Doctor' }}</span>
            </div>
            <div class="wrap_body_item">
                <span class="title">{{ $t('texnik') }}</span>
                <span class="value">{{ printData.texnik_name || 'No Texnik' }}</span>
            </div>
        </div>
        <span class="big_title">{{ $t('selected_teeth') }}</span>
        <div class="wrap_teeth">
            <div class="tooth" v-for="(item, index) in printData.labaratory_tables" :key="index">
                <div class="tooth_item">
                    <span>{{ item.teeth_number }}</span>
                    <div class="tooth_image" v-html="item.teeth_name"></div>
                </div>
                <div class="tooth_item">
                    <span class="tek_name">{{ t('color')}}: {{ " "+ item.color_id }}</span>
                    <span class="tek_name">{{ item.texnik_xizmat_name }}</span>
                </div>
            </div>
        </div>
        <div class="wrap_footer">
            <span>💬 {{ printData.comment }}</span>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, watch, inject } from 'vue'
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const BASE_URL = import.meta.env.VITE_BASE_URL + '/logo/'
const dayJS = inject('dayJS')
const list = ref(null);
const printData = JSON.parse(localStorage.getItem('labaratoryData'))


const getFilialData = () => {
    const filial_id = Number(localStorage.getItem('user_filial'))
    axios.get('/filial/info/' + filial_id)
    .then(function (res) {
        if (res.data) {
            list.value = res.data;
            setTimeout(() => {
                window.print();
                setTimeout(() => {
                    window.close()
                }, 500)
            }, 3000);
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

onMounted(() => {
    getFilialData()
})

</script>

<style scoped lang="scss">
.wrap{
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 30px;
    &_head{
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px dashed #cdcdcd;
        gap: 10px;
        padding-bottom: 10px;
        &_info{
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .title{
            font-size: 20px;
            font-weight: 700;
        }
        .phone{
            font-size: 16px;
            font-weight: 500;
        }
    }
    &_body{
        display: grid;
        grid-template-columns: 0.3fr 1fr repeat(2, 0.35fr);
        align-items: center;
        gap: 10px;
        margin-top: 20px;
        &_item{
            display: flex;
            flex-direction: column;
            justify-content: start;
            gap: 10px;
            .title{
                font-size: 13pt;
                font-weight: 600;
            }
            .value{
                font-size: 11pt;
                font-weight: 500;
            }
        }
    }
    &_teeth{
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        .tooth{
            display: grid;
            grid-template-columns: 30% 70%;
            align-items: flex-end;
            border-bottom: 1px dashed #cdcdcd;
            gap: 10px;
            padding-bottom: 10px;
            &_item{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: start;
                gap: 10px;
                span{
                    font-size: 12pt;
                    font-weight: 600;
                }
            }
            &_image{
                display: flex;
                justify-content: center;
                background-color: rgb(255, 255, 255);
                border: 1px solid #F0F0F0;
                box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
                animation: showBox 0.3s ease-in-out forwards alternate;
                padding: 15px;
                border-radius: 10px;
                height: 100px;
                width: 100px;
            }
            .tek_name{
                font-size: 12pt;
                font-weight: 500;
            }
        }
    }
    &_footer{
        display: flex;
        align-items: center;
        padding-top: 10px;
        span{
            font-size: 13pt;
        }
    }

    .big_title{
        font-size: 16pt;
        font-weight: 500;
    }
}
</style>