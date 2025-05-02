<template>
    <div class="containers">
        <RegistrationContent @bemorEmit="bemorInfo" :bemordata="props.data" />
        <RegistrationBottom @shifokor="shifokorInfo" @tekshiruv="tekshiruvInfo" @texnik="texnikInfo" @tekImage="tekImageInfo" @updateTekSumma="updateTekSummaInfo" @pay="handlePayment" :data="localData" @update:data="updateData" @printChek="chekInfo" :bemor_id_prop="bemorId" />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, toRaw } from 'vue'
import { useRouter } from "vue-router";
import { useMessage, useNotification, useDialog } from 'naive-ui'
import RegistrationContent from '../../components/Registration/RegistrationContent.vue';
import RegistrationBottom from '../../components/Registration/RegistrationBottom.vue';
const emit = defineEmits(['bemorEmit', 'shifokorEmit', 'tekshiruvEmit', 'texnikEmit', 'tekImageEmit', 'updateTekSummaEmit', 'payEmit', 'chekEmit'])
const props = defineProps(['data'])
const bemorId = ref(null)
const localData = ref(props.data ? { ...props.data } : {
    finished: false,
    bemor: null,
    doctor_inspections: [],
    registration_inspections: [],
    registration_pays: [],
    totalSum: 0,
    paySum: 0,
    qarzSum: 0
});
const bemorInfo = (data) => {
    if (data) {
        bemorId.value = data.id;
        localData.value.bemor = data;
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
const updateData = (newData) => {
    localData.value = JSON.parse(JSON.stringify(toRaw(newData)));
    emit('update:data', localData.value);
}

const handlePayment = (payment) => {
    // Update local data
    localData.value.registration_pays.push(payment);

    // Update relevant inspections
    payment.selectedItems.forEach(item => {
        const index = localData.value.registration_inspections.findIndex(
            i => i.number === item.number
        );
        if (index > -1) {
            localData.value.registration_inspections[index] = item;
        }
    });

    // Emit update
    updateData(localData.value);
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