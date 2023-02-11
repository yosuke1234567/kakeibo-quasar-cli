<script setup lang="ts">
import { isSignInWithEmailLink, signInWithEmailLink, updatePassword } from '@firebase/auth'
import { auth } from 'src/firebase'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const fromEmail = ref(isSignInWithEmailLink(auth, window.location.href))
const email = ref<string>('')
const pass = ref<string>('')
const isPwd = ref(true)
const isSuccess = ref(false)
const isErr = ref(false)
const isErr2 = ref(false)

onMounted(() => {
    if (fromEmail.value) {
        if (window.localStorage.getItem('emailForSignIn')) {
            email.value = window.localStorage.getItem('emailForSignIn')!
        } else {
            email.value = window.prompt('確認のためメールアドレスを入力してください。')!
        }
        signInWithEmailLink(auth, email.value, window.location.href)
            .then((result) => {
                isSuccess.value = true
                window.localStorage.removeItem('emailForSignIn')
                // You can access the new user via result.user
                // Additional user info profile not available via:
                // result.additionalUserInfo.profile == null
                // You can check if the user is new or existing:
                // result.additionalUserInfo.isNewUser
            })
            .catch((error: Error) => {
                console.error(error.message)
                isErr.value = true
            })
    } else if (auth.currentUser) {
        email.value = window.prompt('確認のためメールアドレスを入力してください。')!
        email.value === auth.currentUser.email ? isSuccess.value = true : isErr2.value = true
    } else {
        router.push('/')
    }
})

const onSubmit = async (e: Event) => {
    e.preventDefault()

    if (auth.currentUser) {
        await updatePassword(auth.currentUser, pass.value)
            .then(() => {
                auth.signOut()
                router.push('/')
            })
            .catch((error: Error) => console.error(error.message))
    }
}
</script>

<template>
    <div v-if="isErr" class="u-inner">
        <q-card class="q-pa-lg">
            <p>認証に失敗しました。もう一度メール送信をお試しください。</p>
            <q-btn @click="router.push('/sendemail')" label="メール送信画面へ" outline color="grey-8" />
        </q-card>
    </div>
    <div v-if="isErr2" class="u-inner">
        <q-card class="q-pa-lg">認証に失敗しました。ページを更新して再度お試しください。</q-card>
    </div>
    <div v-if="isSuccess" class="u-inner">
        <h2>パスワードを設定</h2>
        <form @submit="onSubmit" class="q-gutter-y-lg">
            <div class="q-pt-md">{{ email }}</div>
            <q-input :type="isPwd ? 'password' : 'text'" v-model="pass" label="パスワード（6文字以上）" class="full-width u-bg-white">
                <template v-slot:append>
                    <q-icon :name="isPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'" class="cursor-pointer"
                        @click="isPwd = !isPwd" />
                </template>
            </q-input>
            <q-btn type="submit" label="登録" unelevated color="secondary" text-color="initial" class="full-width" />
        </form>
    </div>
</template>

<style lang="scss" scoped>

</style>