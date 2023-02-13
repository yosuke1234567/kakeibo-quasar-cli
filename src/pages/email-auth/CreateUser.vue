<script setup lang="ts">
import { ActionCodeURL, checkActionCode, createUserWithEmailAndPassword } from '@firebase/auth'
import { auth } from 'src/firebase'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref<string | null>('')
const pass = ref<string>('')
const pass2 = ref<string>('')
const isPwd = ref(true)

const verified = ref(false)
const isErr = ref(false)
const varidateErr = ref(false)
const diffErr = ref(false)
const isLoad = ref(false)

onMounted(() => {
    const params = new URLSearchParams(window.location.search)
    const oobCode = params.get('oobCode')
    const link = new ActionCodeURL()
    // console.log(link)

    checkActionCode(auth, oobCode!)
        .then((actionCodeInfo) => {
            console.log(actionCodeInfo)
            email.value = actionCodeInfo.data.email!
            verified.value = true
        })
        .catch((e: Error) => {
            isErr.value = true
            console.error(e.message)
        })
})

const onSubmit = async (e: Event) => {
    e.preventDefault()

    if (pass.value !== pass2.value) {
        varidateErr.value = false
        diffErr.value = true
    } else {
        isLoad.value = true
        diffErr.value = false
        await createUserWithEmailAndPassword(auth, email.value!, pass.value)
            .then(() => {
                diffErr.value = false
                varidateErr.value = false
                auth.signOut()
                alert('登録が完了しました。')
                window.location.href = '/'
            })
            .catch(() => varidateErr.value = true)
        isLoad.value = false
    }
}
</script>

<template>
    <div v-if="isErr" class="u-inner">
        <q-card class="q-pa-lg">
            <p>リンクが無効です。もう一度メール送信をお試しください。</p>
            <q-btn @click="router.push('/sendemail')" label="メール送信画面へ" outline color="grey-8" />
        </q-card>
    </div>
    <div v-if="verified" class="u-inner">
        <h2>パスワードを設定</h2>
        <p v-if="varidateErr" class="text-red">有効なパスワードを入力してください。</p>
        <p v-if="diffErr" class="text-red">確認用パスワードが異なっています。</p>
        <form @submit="onSubmit" class="q-gutter-y-lg">
            <div class="q-pt-md">{{ email }}</div>
            <q-input :type="isPwd ? 'password' : 'text'" v-model="pass" label="パスワード（6文字以上）"
                class="full-width u-bg-white">
                <template v-slot:append>
                    <q-icon :name="isPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'" class="cursor-pointer"
                        @click="isPwd = !isPwd" />
                </template>
            </q-input>
            <q-input :type="isPwd ? 'password' : 'text'" v-model="pass2" label="パスワード（確認用）"
                class="full-width u-bg-white">
                <template v-slot:append>
                    <q-icon :name="isPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'" class="cursor-pointer"
                        @click="isPwd = !isPwd" />
                </template>
            </q-input>
            <q-btn type="submit" label="登録" unelevated color="secondary" text-color="initial" class="full-width" />
        </form>
    </div>
    <q-inner-loading :showing="isLoad" />
</template>

<style lang="scss" scoped>

</style>