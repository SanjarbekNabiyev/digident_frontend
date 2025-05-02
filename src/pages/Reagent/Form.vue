<template>
    <div class="container">
        <div class="container_header">
            <n-button strong secondary type="info" class="header_btn" @click="$router.push('/reagent_prixod_page')">
                <span style="font-size: 19px; font-weight: 600;">{{ $t('maxsulot_olish') }}</span>
            </n-button>
            <n-button strong secondary type="info" class="header_btn" @click="$router.push('/reagent_rasxod_page')">
                <span style="font-size: 19px; font-weight: 600;">{{ $t('maxsulot_berish') }}</span>
            </n-button>
        </div>
    </div>
</template>

<script setup>
import { I18nD, useI18n } from "vue-i18n";
const { t, locale } = useI18n()

</script>

<style scoped lang="scss">
.container {
  margin: 10px;
  padding: 10px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  animation: showBox 0.3s ease-in-out forwards alternate;
  height: calc(100vh - 80px);
  overflow: hidden;
  overflow: auto;
}
.container_header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
//   padding-bottom: 10px;
}
.header_btn{
    display: flex;
    align-items: center;
    justify-content: center;
    // background-color: azure;
    height: 100px;
    width: 300px;
}
</style>