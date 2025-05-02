<template>
    <Chart v-if="!show" ref="chartRef" type="bar" :data="data" :options="options" />
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted, inject } from 'vue'
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
import {
    Chart as ChartJS,
    registerables
    // Title,
    // Tooltip,
    // Legend,
    // BarElement,
    // CategoryScale,
    // LinearScale,
} from 'chart.js'
import {
    Chart,
    getDatasetAtEvent,
    getElementAtEvent,
    getElementsAtEvent
} from 'vue-chartjs'
const dayJS = inject('dayJS')
const show = ref(false)
const data = {
    labels: [],
    datasets: [
        {
            label: t('patient_count'),
            backgroundColor: '#f87979',
            data: []
        }
    ]
}

const options = {
    responsive: true,
    maintainAspectRatio: false
}

ChartJS.register(...registerables)

const datasetAtEvent = (dataset) => {
    if (!dataset.length) return

    const datasetIndex = dataset[0].datasetIndex

    console.log('dataset', data.datasets[datasetIndex].label)
}

const elementAtEvent = (element) => {
    if (!element.length) return

    const { datasetIndex, index } = element[0]

    console.log(
        'element',
        data.labels[index],
        data.datasets[datasetIndex].data[index]
    )
}

const elementsAtEvent = (elements) => {
    if (!elements.length) return

    console.log('elements', elements)
}

const chartRef = ref(null)

const onClick = (event) => {
    const {
        value: { chart }
    } = chartRef

    if (!chart) {
        return
    }

    datasetAtEvent(getDatasetAtEvent(chart, event))
    elementAtEvent(getElementAtEvent(chart, event))
    elementsAtEvent(getElementsAtEvent(chart, event))
}

const getBemor = () => {
    show.value = true
    axios.get('/registration/ten_day')
    .then(function (res) {
        if(res.success){
            for (let i = 0; i < res.data.length; i++) {
                const element = res.data[i];
                data.labels.push(element.sana == null ? t('no_patient') : dayJS(element.sana * 1000).format('DD-MMMM'))
                data.datasets[0].data.push(element.jami)
            }
            show.value = false
        }
    })
    .catch(function (error) {
        console.log(error.message);
    })
}

onMounted(() => {
    getBemor()
})
</script>