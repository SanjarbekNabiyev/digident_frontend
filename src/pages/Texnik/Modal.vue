<template>
    <div class="xodim">
        <div class="xodim_body" v-for="(item, index) in texnikList" :key="index">
            <span class="title">{{ item.fullname }}</span>
            <div class="content" v-for="(it, ind) in item.texnik_xizmats" :key="ind">
                <div class="card">
                    <n-checkbox id="check" @update:checked="(e) => chooseTexnik(it, e)">
                        <span style="font-size: 16px; font-weight: 600;">{{ it.name }}</span>
                    </n-checkbox>
                    <label for="check">{{ useSummaFormat(it.summa) }}</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted, inject, reactive } from 'vue'
import { useMessage, useNotification } from 'naive-ui'
import { useRouter } from "vue-router";
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const emit = defineEmits(['texnik'])
const props = defineProps(['tekshiruvIndex'])
const notification = useNotification()
const router = useRouter()
const texnikList = ref([])
const texnikChoose = ref(false)

const chooseTexnik = (item, value) => {
    if(value){
        let items = { ...item }
        items['texnik_xizmat_id'] = items.id
        items['texnik_xizmat_name'] = items.name
        items['texnik_ids'] = items.texnik_id
        let data = {
            item: items,
            index: props.tekshiruvIndex
        }
        emit('texnik', data)
    }
}

const columns = [
    {
        type: "selection",
        // multiple: false,
    },
    {
        title: t('texnik'),
        key: 'fullname',
    },
    {
        title: t('phone_number'),
        render(row) {
            return usePhoneFormat(row.phone_number)
        }
    },
    // {
    //     title: t('summa'),
    //     render(row){
    //         return useSummaFormat(row.summa)
    //     }
    // },
];

const rowKey = (row) => row.id

const chooseBemor = (e) => {
    axios.get('/texnik/info/'+e)
        .then((res) => {
            // if(res.data){
            //     let data = {
            //         texnik_id: res.data.id,
            //         summa: res.data.summa,
            //     }
            //     emit('texnik', data)
            // }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

const getAllTexnik = () => {
    axios.get('/texnik/all')
        .then((res) => {
            texnikList.value = res.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

onMounted(() => {
    getAllTexnik()
})
</script>

<style scoped lang="scss">
.xodim{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    position: relative;
    border: 2px solid #0064CF;
    border-radius: 5px;
    padding: 7px;
    &_body{
        border: 1.5px solid #0064CF;
        border-radius: 5px;
        padding: 5px;
        background-color: #E8EFF4;
        .title{
            font-weight: 600;
            font-size: 18px;
            color: #3F51B4;
        }
        .card{
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #d0e5f5;
            border: 1px solid #0064CF;
            border-radius: 5px;
            padding: 5px;
            margin-bottom: 5px;
            label, span{
                color: #3F51B4;
                font-size: 17px;
                font-weight: 600;
            }
        }
    }
}
</style>