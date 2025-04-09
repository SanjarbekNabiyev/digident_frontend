<template>
    <div class="texnik">
        <n-data-table 
            :single-line="false"
            :columns="texnikColumns" 
            :data="props?.texnikTekshiruv?.model ? props?.texnikTekshiruv?.model : []" 
        />
    </div>
</template>

<script setup>
import { h, ref, reactive, onMounted, defineEmits, watch, inject, computed, provide, createApp } from 'vue'
import { useMessage, useNotification, NButton, NIcon, NText, useDialog } from 'naive-ui'
import { useSummaFormat, useParsenumber, useFormatnumber, usePhoneFormat } from '../../composible/NumberFormat';
const props = defineProps(['texnikTekshiruv'])
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const notification = useNotification()
const currentRole = ref(localStorage.getItem('role'));
import { Delete24Filled } from '@vicons/fluent';
import { useEventBus } from '../../emitter'
const eventBus = useEventBus()

const texnikColumns = [
    {
        title: "#",
        key: "name",
        width: 50,
        render(row, index) {
            return index + 1
        }
    },
    {
        title: t('name'),
        key: 'texnik_xizmat_name',
    },
    {
        title: t('summa'),
        render(row){
            return useSummaFormat(row.summa)
        }
    },
    {
        title: "",
        key: "actions",
        width: 50,
        render(row, index) {
            return [
                h(
                    NButton,
                    {
                    size: 'small',
                    type: 'error',
                    style: 'display:flex; align-items:center; justify-content: center',
                    onClick: (e) => {
                        if (currentRole.value == "Dasturchi" || currentRole.value == "Admin" || currentRole.value == "Registrator") {
                            let data = {
                                index: props?.texnikTekshiruv?.index,
                                data: row,
                                childIndex: index
                            }
                            eventBus.$emit('deleteTexnikTekshiruvIndex', data)
                        } else {
                            notification.error({
                                content: t('error'),
                                meta: t('not_change'),
                                duration: 2500,
                                keepAliveOnHover: false
                            })
                        }
                    }
                    },
                    {
                    icon: () =>
                        h(NIcon, {
                        component: Delete24Filled
                        })
                    }
                )
            ]
        }
    }
];
</script>