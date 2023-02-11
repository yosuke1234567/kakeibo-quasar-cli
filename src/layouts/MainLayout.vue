<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const location = ref<string>(route.path)

// ナビゲーション後に実行
router.afterEach(() => {
    // drawerのactiveを記憶
    location.value = route.path
})

const links = [
    {
        href: '/home',
        icon: 'sym_r_home',
        label: 'ホーム'
    },
    {
        href: '/input',
        icon: 'sym_r_edit_square',
        label: '入力'
    },
    {
        href: '/stats',
        icon: 'sym_r_leaderboard',
        label: '統計'
    },
    {
        href: '/mypage',
        icon: 'sym_r_person',
        label: 'マイページ'
    }
]

const selectedTab = ref('')

const leftDrawerOpen = window.innerWidth > 1023 ? ref(true) : ref(false)

// onBeforeUnmount(() => {
//     if (auth.currentUser?.isAnonymous) {
//         window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
//             e.preventDefault()
//             e.returnValue = ''
//         })
//     }
// })

</script>
    
<template>
    <q-layout view="lHh Lpr lFf">

        <!-- <q-header reveal class="header">
            <q-toolbar>
                <q-btn flat @click="toggleLeftDrawer" round dense icon="sym_r_menu" aria-label="Menu" />
            </q-toolbar>
        </q-header> -->

        <q-drawer v-model="leftDrawerOpen" side="left" bordered>
            <h2 class="heading"><img src="../assets/yen.svg" alt="">kakeibo</h2>
            <q-list class="u-align-items-center">
                <q-item v-for="link in links" clickable :active="location === link.href" active-class="active-item" class="item"
                    @click="router.push(`.${link.href}`)">
                    <q-item-section avatar>
                        <q-icon :name="link.icon" />
                    </q-item-section>
                    <q-item-section>{{ link.label }}</q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-footer bordered class="footer bg-white text-dark">
            <q-tabs v-model="selectedTab" dense indicator-color="transparent">
                <q-route-tab
                    v-for="link in links"
                    class="tab"
                    active-class="text-yellow-9"
                    :to="link.href"
                    :icon="link.icon"
                    :label="link.label"
                />
            </q-tabs>
        </q-footer>

        <q-page-container class="page-view">
            <router-view />
        </q-page-container>

    </q-layout>

    <div>
        <img src="../assets/bear.png" alt="" class="hidden">
        <img src="../assets/honey.png" alt="" class="hidden">
        <img src="../assets/pigbear.png" alt="" class="hidden">
    </div>
</template>
    
<style scoped lang="scss">
.header {
    background-color: transparent;
    color: #222;

    @media screen and (min-width: 1024px) {
        visibility: hidden;
        height: 8px;
    }
}

.footer {
    padding: 0 16px env(safe-area-inset-bottom);
    
    @media screen and (min-width: 1024px) {
        visibility: hidden;
        height: 0;
        padding: 0;
    }
}

.heading {
    width: 90%;
    margin: 0 auto;
    padding: 24px 16px;
    color: $primary;
    line-height: 1.25;

    img {
        height: 1.5em;
        vertical-align: bottom;
        margin-right: 0.5em;
    }
}
.item {
    width: 90%;
    padding: 12px 20px;
    margin: 12px auto;
    border-radius: 8px;
}

.active-item {
    background-color: #fdd83577;
    color: initial;
}

.tab {
    max-width: 25%;
    padding: 0 12px;
    font-size: 12px;
    
    @media screen and (min-width: 632px) {
        padding: 0 20px 4px;
    }
}

.page-view {
    background-color: #f5f2eb;
    padding-top: env(safe-area-inset-top);
    padding-right: env(safe-area-inset-right);
    padding-left: env(safe-area-inset-left);
}
</style>