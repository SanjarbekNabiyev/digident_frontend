import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layouts',
      redirect: '/home',
      component: () => import('../pages/Layouts/Sidebar.vue'),
      children:[
        //Home page
        {
          path: '/home',
          name: 'Home',
          component: () => import('../pages/Home/Form.vue')
        },
        // Registration page
        {
          path: '/registration',
          name: 'Registration',
          component: () => import('../pages/Registration/Registration.vue')
        },
        // Backlog page
        {
          path: '/backlog',
          name: 'Backlog',
          component: () => import('../pages/Registration/Backlog.vue')
        },
        // Xodim page
        {
          path: '/xodim',
          name: 'Xodim',
          component: () => import('../pages/Xodim/Xodim.vue')
        },
        // Xodim Added page
        {
          path: '/xodim_add',
          name: 'XodimAdd',
          component: () => import('../pages/Xodim/XodimAdd.vue')
        },
        // Shifokor page
        {
          path: '/shifokor',
          name: 'Shifokor',
          component: () => import('../pages/Shifokor/ShifokorPage.vue')
        },
        // Kassaviy Order page
        {
          path: '/kassa-order',
          name: 'Kassa-order',
          component: () => import('../pages/KassaviyOrder/KassaviyOrder.vue')
        },
        // Kassaviy Order Added page
        {
          path: '/kassa-order-add',
          name: 'Kassa-order-add',
          component: () => import('../pages/KassaviyOrder/KassaviyOrderAdd.vue')
        },
        // BemorList page
        {
          path: '/bemor',
          name: 'Bemor',
          component: () => import('../pages/Bemor/BemorList.vue')
        },
        // BemorList page
        {
          path: '/sklad',
          name: 'Sklad',
          component: () => import('../pages/Sklad/Form.vue')
        },
        // BemorList page
        {
          path: '/bemor-update',
          name: 'BemorUpdate',
          component: () => import('../pages/Bemor/BemorUpdate.vue')
        },
        // Tolovlar page
        {
          path: '/tolov',
          name: 'Tolov',
          component: () => import('../pages/Tolov/TolovPage.vue')
        },
        // Tolovlar Added page
        {
          path: '/tolov_add',
          name: 'Tolov_Add',
          component: () => import('../pages/Tolov/TolovAdd.vue')
        },
        // Texnik page
        {
          path: '/texnik',
          name: 'Texnik',
          component: () => import('../pages/Texnik/Form.vue')
        },
        // Texnik Added page
        {
          path: '/texnik_add',
          name: 'Texnik_Add',
          component: () => import('../pages/Texnik/Create.vue')
        },
        // Texnik page
        {
          path: '/texnik_xizmat',
          name: 'TexnikXizmat',
          component: () => import('../pages/Texnik/TexnikXizmat.vue')
        },
        // Texnik page
        {
          path: '/texnik_pay',
          name: 'TexnikPay',
          component: () => import('../pages/TexnikPay/Form.vue')
        },
        // SelaryCalc page
        {
          path: '/selary',
          name: 'SelaryCalc',
          component: () => import('../pages/Tolov/SelaryCalcPage.vue')
        },
        // Tekshiruv Bolim page
        {
          path: '/tekshiruv_bolim',
          name: 'Tekshiruv_Bolim',
          component: () => import('../pages/Tekshiruv/TekshiruvBolim.vue')
        },
        // Tekshiruv Bolim Added page
        {
          path: '/tekshiruv_bolim_add',
          name: 'TekshiruvBolimAdd',
          component: () => import('../pages/Tekshiruv/TekshiruvBolimAdd.vue')
        },
        // Tekshiruv Child page
        {
          path: '/tekshiruv_child',
          name: 'TekshiruvChild',
          component: () => import('../pages/Tekshiruv/TekshiruvChild.vue')
        },
        // Tekshiruv Child Added page
        {
          path: '/tekshiruv_child_add',
          name: 'TekshiruvChildAdd',
          component: () => import('../pages/Tekshiruv/TekshiruvChildAdd.vue')
        },
        // Xona page
        {
          path: '/xona',
          name: 'Xona',
          component: () => import('../pages/Xona/Xona.vue')
        },
        // Xona Added page
        {
          path: '/xona_add',
          name: 'XonaAdd',
          component: () => import('../pages/Xona/XonaAdd.vue')
        },
        // Prixod page
        {
          path: '/prixod',
          name: 'Prixod',
          component: () => import('../pages/Prixod/Prixod.vue')
        },
        // Boshlangich qoldiq page
        {
          path: '/boshlangich_qoldiq',
          name: 'BoshlangichQoldiq',
          component: () => import('../pages/BoshlangichQoldiq/Form.vue')
        },
        //Xisobot Form page
        {
          path: '/xisobot-form',
          name: 'XisobotForm',
          component: () => import('../pages/Xisobot/Form.vue')
        },
        //Navbat Form page
        {
          path: '/navbat-form',
          name: 'NavbatForm',
          component: () => import('../pages/Navbat/Form.vue')
        },
        //Doctor Navbat page
        {
          path: '/doctor-navbat',
          name: 'DoctorNavbat',
          component: () => import('../pages/Navbat/DoctorQueue.vue')
        },
        //Kontragent Form page
        {
          path: '/kontragent',
          name: 'Kontragent',
          component: () => import('../pages/Kontragent/Kontragent.vue')
        },
        //Kontragent Added page
        {
          path: '/kontragent_add',
          name: 'KontragentAdd',
          component: () => import('../pages/Kontragent/KontragentAdd.vue')
        },
        //Kontragent Tolov page
        {
          path: '/kontragent_tolov',
          name: 'KontragentTolov',
          component: () => import('../pages/Kontragent/KontragentTolov.vue')
        },
        //Kontragent Tolov Added page
        {
          path: '/kontragent_tolov_add',
          name: 'KontragentTolovAdd',
          component: () => import('../pages/Kontragent/KontragentTolovAdd.vue')
        },
        //Product Form page
        {
          path: '/product',
          name: 'Product',
          component: () => import('../pages/Product/Product.vue')
        },
        //Product Added page
        {
          path: '/product_add',
          name: 'ProductAdd',
          component: () => import('../pages/Product/ProductAdd.vue')
        },
        //Reagent Form page
        {
          path: '/reagent',
          name: 'Reagent',
          component: () => import('../pages/Reagent/Form.vue')
        },
        // Reagent Prixod Page
        {
          path: '/reagent_prixod_page',
          name: 'ReagentPrixodForm',
          component: () => import('../pages/ReagentPrixod/Form.vue')
        },
         // Reagent Rasxod Page
         {
          path: '/reagent_rasxod_page',
          name: 'ReagentRasxodForm',
          component: () => import('../pages/ReagentRasxod/Form.vue')
        },
        // Settings page
        {
          path: '/settings',
          name: 'Settings',
          component: () => import('../pages/Settings/Form.vue')
        },
        // SMS page
        {
          path: '/sms_send',
          name: 'SMS_send',
          component: () => import('../pages/SMS/Form.vue')
        },
        // Filial page
        {
          path: '/filial',
          name: 'Filial',
          component: () => import('../pages/Filial/Form.vue')
        },
        //Labaratoriya Form page
        {
          path: '/labaratoriya',
          name: 'Labaratoriya',
          component: () => import('../pages/Labaratoriya/Form.vue')
        },
        //Labaratoriya Add Form page
        {
          path: '/labaratoriya_add',
          name: 'LabaratoriyaAdd',
          component: () => import('../pages/Labaratoriya/Create.vue')
        },
      ]
    },
    // Login page
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/Login.vue')
    },
    // Registration Added page
    {
      path: '/registration_add',
      name: 'RegistrationAdd',
      component: () => import('../pages/Registration/RegistrationAdd.vue')
    },
    // Prixod Added page
    {
      path: '/prixod_add',
      name: 'PrixodAdd',
      component: () => import('../pages/Prixod/PrixodAdd.vue')
    },
    // Boshlangich qoldiq Added page
    {
      path: '/boshlangich_qoldiq_add',
      name: 'BoshlangichQoldiqAdd',
      component: () => import('../pages/BoshlangichQoldiq/Create.vue')
    },
    // User selary Added page
    {
      path: '/selary_add',
      name: 'SelaryCalcAdd',
      component: () => import('../pages/Tolov/SelaryCalcAdd.vue')
    },
    // Reagent Prixod Added page
    {
      path: '/reagent_prixod_create',
      name: 'ReagentPrixodCreate',
      component: () => import('../pages/ReagentPrixod/CreateForm.vue')
    },
    // Reagent Rasxod Added page
    {
      path: '/reagent_rasxod_create',
      name: 'ReagentRasxodCreate',
      component: () => import('../pages/ReagentRasxod/CreateForm.vue')
    },
    // Shifokor Xisoboti page
    {
      path: '/shifokor_xisoboti',
      name: 'ShifokorXisoboti',
      component: () => import('../pages/Xisobot/ShifokorXisoboti.vue')
    },
    // Shifokor Sverkasi page
    {
      path: '/shifokor_sverka',
      name: 'ShifokorSverkasi',
      component: () => import('../pages/Xisobot/ShifokorSverka.vue')
    },
    // Shifokor Korik page
    {
      path: '/korik_soni',
      name: 'KorikSoni',
      component: () => import('../pages/Xisobot/KorikSoni.vue')
    },
    // Kassa Xisobot page
    // {
    //   path: '/kassa_xisobot',
    //   name: 'KassaXisobot',
    //   component: () => import('../pages/Xisobot/KassaXisobot.vue')
    // },
    // Kassa Xisobot page
    {
      path: '/kassa_sverka',
      name: 'KassaSverka',
      component: () => import('../pages/Xisobot/KassaSverka.vue')
    },
    // Kontragent Xisobot page
    {
      path: '/kontragent_xisobot',
      name: 'KontragentXisobot',
      component: () => import('../pages/Xisobot/KontragentXisobot.vue')
    },
    // Kontragent Sverka page
    {
      path: '/kontragent_sverka',
      name: 'KontragentSverka',
      component: () => import('../pages/Xisobot/KontragentSverka.vue')
    },
    // Reagent Xisobot page
    {
      path: '/reagent_xisobot',
      name: 'ReagentXisobot',
      component: () => import('../pages/Xisobot/ReagentXisobot.vue')
    },
    // Reagent Sverka page
    {
      path: '/reagent_sverka',
      name: 'ReagentSverka',
      component: () => import('../pages/Xisobot/ReagentSverka.vue')
    },
    // Tekshiruv Statistika page
    {
      path: '/tekshiruv_statistics',
      name: 'ReagentTekshiruv',
      component: () => import('../pages/Xisobot/ReagentTekshiruv.vue')
    },
    // Bemor Statistika page
    {
      path: '/bemor_statistics',
      name: 'BemorStatistics',
      component: () => import('../pages/Xisobot/BemorStatistika.vue')
    },
    // Reagent Xodim page
    {
      path: '/reagent_xodim',
      name: 'ReagentXodim',
      component: () => import('../pages/Xisobot/ReagentXodim.vue')
    },
    // Texnik xisobot page
    {
      path: '/texnik_xisobot',
      name: 'TexnikXisobot',
      component: () => import('../pages/Xisobot/TexnikXisobot.vue')
    },
    // Texnik sverka page
    {
      path: '/texnik_sverka',
      name: 'TexnikSverka',
      component: () => import('../pages/Xisobot/TexnikSverka.vue')
    },
    // Chek page
    {
      path: '/chek_print',
      name: 'ChekPrint',
      component: () => import('../pages/Print/Chek.vue')
    },
    // Navbat Chek page
    {
      path: '/navbat_chek_print',
      name: 'NavbatChekPrint',
      component: () => import('../pages/Print/NavbatChek.vue')
    },
    // Doctor Chek page
    {
      path: '/doctor_chek_print',
      name: 'DoctorChekPrint',
      component: () => import('../pages/Print/DoctorChek.vue')
    },
    // Reagent Prixod Print page
    {
      path: '/reagent_prixod_print',
      name: 'ReagentPrixodPrint',
      component: () => import('../pages/ReagentPrixod/Print.vue')
    },
    // Reagent Rasxod Print page
    {
      path: '/reagent_rasxod_print',
      name: 'ReagentRasxodPrint',
      component: () => import('../pages/ReagentRasxod/Print.vue')
    },
    // Labaratoriya Print page
    {
      path: '/labaratory_print',
      name: 'LabaratoryPrint',
      component: () => import('../pages/Labaratoriya/Print.vue')
    },
  ]
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem('token')
  if (authRequired && !loggedIn) {
    next('/login');
  }
  else {
    next()
  }
})

export default router
