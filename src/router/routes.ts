import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('src/pages/IndexPage.vue'),
    },
    {
        path: '/signin',
        component: () => import('src/pages/SignIn.vue'),
    },
    {
        path: '/sendemail',
        component: () => import('src/pages/SendEmail.vue'),
    },
    {
        path: '/updatepass',
        component: () => import('src/pages/UpdatePass.vue'),
    },
    {
        path: '/home',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Home.vue') }],
    },
    {
        path: '/input',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/InputMenu.vue') }],
    },
    {
        path: '/stats',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Stats.vue') }],
    },
    {
        path: '/mypage',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('src/pages/MyPage.vue') }],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
    },
];

export default routes;
