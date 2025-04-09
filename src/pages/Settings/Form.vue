<template>
  <div class="container">
    <div class="container_body">
      <div class="content">
        <div class="content_image">
          <n-spin :show="show">
            <n-upload :onFinish="onFinish" :action="BaseUrl + '/setting/upload'" v-model:file-list="upload"
              accept="image/*" :min="1">
              <n-upload-dragger accept="image/png, image/jpeg">
                <div style="margin-bottom: 12px">
                  <n-icon size="48" :depth="3">
                    <CloudUpload />
                  </n-icon>
                </div>
                <n-text style="font-size: 16px">
                  Rasm yuklash uchun bosing
                </n-text>
              </n-upload-dragger>
            </n-upload>
          </n-spin>
        </div>
        <n-form class="form" ref="formRef" :model="data" :rules="rules">
          <n-form-item :label="t('name')" path="name">
            <n-input size="large" placeholder="" style="font-size: 17px;" v-model:value="data.name" />
          </n-form-item>
          <n-form-item :label="t('phone_number')" path="phone">
            <input class="phone_number" type="text" required v-model="data.phone" @keyup="formatTelNumber()"
              maxlength="19">
          </n-form-item>
          <n-button type="success" size="medium" style="width: 100%;" @click="saveDoc">{{ $t('save_btn') }}</n-button>
        </n-form>
      </div>
      <n-data-table :single-line="false" :columns="columns" :data="list" />
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, h, onMounted, defineEmits, watch } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { useMessage, useDialog, NImage } from "naive-ui";
import { I18nD, useI18n } from "vue-i18n";
import { CloudUpload } from '@vicons/carbon'
const formRef = ref(null)
const BaseUrl = import.meta.env.VITE_BASE_URL
const { t, locale } = useI18n()
const message = useMessage()
const list = ref([])
const show = ref(false)
const upload = ref([])
const data = ref({
  name: null,
  phone: null,
  image: null,
})

const rules = {
  name: {
    required: true,
    trigger: 'blur',
    validator: (rule, value) => {
      if (value == null || value == '') {
        return new Error()
      }
    }
  },
  phone: {
    required: true,
    trigger: 'blur',
    validator: (rule, value) => {
      if (value == null || value == '') {
        return new Error()
      }
    }
  }
}

const columns = [
  {
    title: "#",
    key: "name",
    width: '4%',
    render(row, index) {
      return index + 1
    }
  },
  {
    title: t('image'),
    width: '40%',
    render(row) {
      return [
        row.image ? 
        h(
          NImage,
          {
            src: `${BaseUrl}/logo/${row.image}`,
            width: 40,
            height: 30
          }
        ) : null
      ]
    }
  },
  {
    title: t('name'),
    width: '28%',
    key: 'name',
  },
  {
    title: t('phone_number'),
    width: '28%',
    key: 'phone',
  },
]

const onFinish = (options) => {
  // const sendImage  = new FormData();
  // sendImage.append('file', options.file.file);
  // axios.post('/setting/upload', sendImage).then((res) => {
  //   data.value.image = res.data
  // })
}

const saveDoc = async () => {
  try {
    const result = await formRef.value?.validate();
    axios.post('/setting/create', data.value)
      .then(function (res) {
        if (res.success) {
          data.value.name = null
          data.value.phone = null
          data.value.image = null
          upload.value = []
          getAll()
        }
      })
      .catch(function (error) {
        message.error(error.message)
      })
  }catch (e) {

  }
}

const getAll = () => {
  axios.get('/setting/all')
    .then(function (res) {
      list.value = res.data
    })
    .catch(function (error) {
      console.log(error.message);
    })
}

onMounted(() => {
  getAll()
})

const length = ref(0)
const formatTelNumber = () => {
  if (length.value < data.value.phone) {
    let numbers = formatNumber(data.value.phone)
    data.value.phone = numbers
  }
  length.value = data.value.phone
}

const formatNumber = (value) => {
  if (!value) return value
  const phoneNumber = value.replace(/[^\d]/g, "")
  const phoneNumberLength = phoneNumber.length
  if (phoneNumberLength < 4) return `+998${phoneNumber}`
  if (phoneNumberLength < 6) {
    return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}`
  }
  if (phoneNumberLength < 8) {
    return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5)}`
  }
  if (phoneNumberLength < 10) {
    return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8)}`
  }
  return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)} ${phoneNumber.slice(10)}`
}
</script>

<style scoped lang="scss">
.container {
  margin: 10px;
  padding: 10px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  animation: showBox 0.3s ease-in-out forwards alternate;
  // height: calc(100vh - 80px);
  height: 400px;
  overflow: hidden;
  overflow: auto;

  &_body {
    display: grid;
    grid-template-columns: 0.8fr 1.2fr;
    gap: 10px;
  }
}

.phone_number {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #E0E0E6;
  border-radius: 4px;
  font-size: 17px;
  outline: none;
}

.phone_number:hover {
  caret-color: #007BFF;
  border: 1px solid #007BFF;
}

.content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  border: 1px solid #ECECF2;
  border-radius: 5px;
  padding: 5px;

  &_image {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.container_header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 10px;
}

.header_btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

.header_search {
  display: flex;
  position: relative;
  width: 35%;

  .search {
    width: 100%;
    border: 1px solid #cdcdcd;
    border-radius: 4px;
    outline: none;
    padding: 6px 10px 6px 30px;
    font-size: 14px;

    &:hover {
      border: 1px solid #007BFF;
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
      border: 1px solid #007BFF;
    }

    &::placeholder {
      color: #cdcdcd;
      font-family: inherit;
      font-weight: 500;
      font-size: 14px;
    }
  }

  .eye {
    position: absolute;
    top: 50%;
    transform: translateY(-35%);
    left: 5px;
  }
}
</style>