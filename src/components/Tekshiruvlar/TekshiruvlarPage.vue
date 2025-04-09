<template>
    <div class="xodim">
        <div class="xodim_body" v-for="(item, index) in tekshiruvList" :key="index">
            <span class="title">{{ item.name }}</span>
            <div class="content" v-for="(it, ind) in item.inspections" :key="ind">
                <div class="card">
                    <span style="font-size: 16px; font-weight: 600;">{{ it.name }}</span>
                    <label for="check">{{new Intl.NumberFormat().format(parseFloat(it.summa)) }}</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { h, ref, onMounted } from 'vue'
const tekshiruvList = ref([])

// Get all tekshiruv api
const getAllTekshiruv = () => {
    axios.get('/inspection_category/filter')
        .then(function (res) {
            if (res.success) {
                tekshiruvList.value = res.data
            }
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

onMounted(() => {
    getAllTekshiruv()
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