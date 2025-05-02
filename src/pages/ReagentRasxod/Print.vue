<template>
    <div class="content">
        <div class="header">
            <div class="logo">
                <img v-if="list?.image" :src="BASE_URL + list.image" alt="Logo" height="80" width="80" />
                <span v-else>No Image</span>
            </div>
            <div class="info">
                <span class="title">{{ list?.name || 'No Name' }}</span>
                <span class="phone">{{ list?.phone_number || 'No Phone' }}</span>
            </div>
        </div>

        <div class="section-title">{{ $t('give_product') }}</div>

        <div v-for="(item, index) in datas.reagent_rasxod_tables" :key="index" class="item">
            <div class="label">
                <span>{{ $t('product_name') }}:</span>
                <span>{{ $t('count') }}:</span>
            </div>
            <div class="value">
                <span>{{ item.product_name }}</span>
                <span>{{ item.count }}</span>
            </div>
        </div>

        <div class="footer">
            <div class="label">
                <span>{{ $t('data') }}:</span>
                <span>{{ $t('beruvchi') }}:</span>
            </div>
            <div class="value">
                <span>{{ dayJS(datas.datetime).format('YYYY-MM-DD') }}</span>
                <span>{{ datas.postavchik_name }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted, inject } from 'vue';

const dayJS = inject('dayJS');
const datas = JSON.parse(localStorage.getItem('reagentRasxod'));
const list = ref(null);
const BASE_URL = import.meta.env.VITE_BASE_URL + '/logo/';

const getAll = async () => {
    const filial_id = Number(localStorage.getItem('user_filial'));
    try {
        const res = await axios.get(`/filial/info/${filial_id}`);
        list.value = res.data;
        setTimeout(() => {
            window.print();
            setTimeout(() => window.close(), 500);
        }, 3000);
    } catch (err) {
        console.error(err.message);
    }
};

onMounted(getAll);
</script>

<style scoped lang="scss">
.content {
    width: 420px;
    padding: 10px;
    font-family: Arial, sans-serif;
}

.header {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 15px;

    .logo {
        width: 100px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .info {
        display: flex;
        flex-direction: column;
        // gap: 5px;
        flex: 1;

        .title {
            font-size: 22pt;
            font-weight: bold;
            color: #000;
        }

        .phone {
            font-size: 16pt;
            color: #000;
        }
    }
}

.section-title {
    font-size: 18pt;
    font-weight: 700;
    text-align: center;
    margin: 20px 0 10px;
    border-top: 2px dashed #000;
    padding-top: 10px;
}

.item,
.footer {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14pt;
    font-weight: 600;

    .label,
    .value {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 200px;
    }
}

.footer {
    border-top: 2px dashed #000;
    padding-top: 10px;
    margin-top: 15px;
}
</style>