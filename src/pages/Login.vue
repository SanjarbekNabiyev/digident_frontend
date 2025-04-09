<template>
    <div class="login">
        <div class="login-box">
            <n-card title="Кириш" style="text-align: center;">
                <n-form ref="formRef" :model="form_data" :rules="rules">
                    <n-form-item label="Ходим танланг" path="userId" style="text-align: left;">
                        <n-select v-model:value="form_data.userId" :options="userList" value-field="id"
                            label-field="full_name" placeholder="Ходим танланг" filterable clearable @keyup="onPress"
                            size="large" />
                    </n-form-item>
                    <n-form-item label="Парол" path="password" style="text-align: left;">
                        <n-input v-model:value="form_data.password" type="password" show-password-on="mousedown"
                            placeholder="Парол киритинг" @keyup="onPress" size="large" />
                    </n-form-item>
                    <n-button @click="signin" type="info" block size="large" style="margin-top: 5px;">Кириш</n-button>
                </n-form>
            </n-card>
        </div>
        <div class="use_not" v-if="useTime">
            <div class="card">
                <h3>Dasturdan foydalanish vaqti tugadi?</h3>
                <span>Iltimos to'lovni amalga oshiring?</span>
                <n-button type="primary" size="large" @click="checkServerTime" style="margin-top: 10px;">Qayta tekshirish</n-button>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { useMessage, useNotification } from 'naive-ui'
import axios from 'axios';
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()
const router = useRouter()
const message = useMessage()
const notification = useNotification()
const formRef = ref(null)
const userList = ref([])
const useTime = ref(false)

const form_data = ref({
    userId: null,
    password: null,
})

const rules = {
    userId: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null) {
                return new Error("Ходим танлаш мажбурий")
            }
        }
    },
    password: {
        required: true,
        trigger: 'blur',
        validator: (rule, value) => {
            if (value == null) {
                return new Error("Парол киритиш мажбурий")
            }
        }
    }
}

// User Login api
const signin = async () => {
    try {
        const result = await formRef.value?.validate();
        axios.post('/user/login', {
            user_id: form_data.value.userId,
            password: form_data.value.password
        })
            .then(function (response) {
                if (response.success) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    localStorage.setItem('user_id', response.data.id);
                    localStorage.setItem('user_name', response.data.full_name);
                    localStorage.setItem('role', response.data.role.name);
                    localStorage.setItem('user_filial', response.data.filial_id);
                    localStorage.setItem('user_foiz', response.data.foiz);
                    localStorage.setItem('user_role_id', response.data.role_id);
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('lang', 'uzk')

                    notification.success({
                        content: 'Муаффақиятли!',
                        meta: "Киритилган маълумотлар тўғри",
                        duration: 1500,
                        keepAliveOnHover: true
                    })
                    if (response.data.role_id == 1 || response.data.role_id == 2 || response.data.role_id == 3) {
                        window.location.href = '/home'
                        // router.push({ name: 'Home' })
                    } else {
                        window.location.href = '/registration'
                        // router.push({ name: 'Registration' })
                    }
                } else {
                    message.error("Киритилган маълумотлар хато!")
                }
            })
            .catch((error) => {
                message.error(error.message)
            });
    } catch (e) {
    }
}

const onPress = (e) => {
    if (e.key === "Enter") {
        signin()
    }
}
                    
// Get all user api
const user = () => {
    axios.get('/user/all')
        .then(function (response) {
            userList.value = response.data
        })
        .catch(function (error) {
            console.log(error.message);
        })
}

// Get getUseTimeApi 
const getUseTimeApi = async () => {
    const sameTime = Math.floor(new Date().getTime() / 1000)
    axios.get('/filial/get_use_time')
        .then(res => {
            if (res.data) {
                if (sameTime > res.data.use_time) {
                    useTime.value = true
                }
            }
        })
        .catch(error => {
            console.log(error.message);
        });
}

const checkServerTime = () => {
    axios.get('/filial/check_server_time')
        .then(res => {
            if (res.success) {
                useTime.value = false
                message.success(res.message)
            }else{
                message.error(res.message)
            }
        })
        .catch(error => {
            console.log(error.message);
        });
}

onMounted(() => {
    user()
    getUseTimeApi()
})
</script>

<style scoped>
.login {
    display: flex;
    align-items: center;
    flex-direction: column;
    /* padding-top: 5%; */
    width: 100%;
    height: 100vh;
    /* text-align: -webkit-center; */
    background-image: url("../../public/future.jpg");
    background-size: cover;
    background-repeat: no-repeat;
}
h3{
    font-size: 25px;
    color: #fff;
    padding-bottom: 10px;
}
.card-tabs .n-tabs-nav--bar-type {
    padding-left: 4px;
}

.use_not{
    position: absolute;
    background-color: #0f0f0f71;
    width: 100vw;
    height: 100vh;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
}
.use_not .card{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: red;
    width: 35%;
    height: 18%;
    border-radius: 10px;
    padding: 10px;
}
span{
    color: #fff;
    font-size: 19px;
    font-weight: 600;
}

</style>