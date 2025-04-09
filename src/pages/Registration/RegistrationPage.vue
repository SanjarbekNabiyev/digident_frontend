<template>
    <div class="containers">
        <RegistrationContent @bemorEmit="bemorInfo" :bemordata="props.data"/>
        <RegistrationBottom @shifokor="shifokorInfo" @tekshiruv="tekshiruvInfo" @texnik="texnikInfo" @tekImage="tekImageInfo" @updateTekSumma="updateTekSummaInfo" @updateShifokorTime="updateShifokorTimeInfo" @pay="payInfo" @printChek="chekInfo" :bemor_id_prop="bemorId" :data="props.data"/>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, } from 'vue'
import { useRouter } from "vue-router";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import RegistrationContent from '../../components/Registration/RegistrationContent.vue';
import RegistrationBottom from '../../components/Registration/RegistrationBottom.vue';
const emit = defineEmits(['bemorEmit', 'shifokorEmit', 'tekshiruvEmit', 'texnikEmit', 'tekImageEmit', 'updateTekSummaEmit', 'updateShifokorTimeEmit', 'payEmit', 'chekEmit'])
const props = defineProps(['data'])
const bemorId = ref(null)

const bemorInfo = (data) => {
    if (data) {
        bemorId.value = data.id;
        emit('bemorEmit', data)
    }
}
const shifokorInfo = (data) => {
    if (data) {
        emit('shifokorEmit', data)
    }
}
const tekshiruvInfo = (data) => {
    if (data) {
        emit('tekshiruvEmit', data)
    }
}
const texnikInfo = (data) => {
    if (data) {
        emit('texnikEmit', data)
    }
}
const tekImageInfo = (data) => {
    if (data) {
        emit('tekImageEmit', data)
    }
}
const updateTekSummaInfo = (data) => {
    if (data) {
        emit('updateTekSummaEmit', data)
    }
}
const updateShifokorTimeInfo = (data) => {
    if (data) {
        emit('updateShifokorTimeEmit', data)
    }
}
const payInfo = (data) => {
    if (data) {
        emit('payEmit', data)
    }
}
const chekInfo = () => {
    emit('chekEmit')
}


onMounted(() => {
    bemorInfo()
    shifokorInfo()
})

</script>

<style scoped>
.containers{
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 100vh;
    overflow: auto;
}
</style>