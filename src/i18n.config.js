import { createI18n, useI18n } from 'vue-i18n'
import {uz} from './locale/uz'
import {ru} from './locale/ru'
import {uzk} from './locale/uzk'
import {eng} from './locale/eng'

const lang = localStorage.getItem('lang');
const i18n = createI18n({
    locale: (lang ? lang : 'uz'),
    fallbackLocale: 'uz',
    legacy: false,
    messages: {
        uz:uz,
        ru:ru,
        uzk:uzk,
        eng:eng
    }
})
export {i18n, useI18n}
