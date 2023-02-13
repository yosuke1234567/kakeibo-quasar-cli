<script setup lang="ts">
import { createUserWithEmailAndPassword } from '@firebase/auth'
import { auth } from 'src/firebase'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userId = ref('')
const pass = ref('')
const pass2 = ref('')
const isPwd = ref(true)

const idErr = ref('')
const passErr = ref(false)
const diffErr = ref(false)

const isLoad = ref(false)
const showDialog = ref(false)

const onSubmit = async (e: Event) => {
    e.preventDefault()
    isLoad.value = true

    idErr.value = ''
    passErr.value = false
    diffErr.value = false

    if (userId.value!.length < 6) {
        idErr.value = '6文字以上で入力してください。'
    } else if (pass.value !== pass2.value) {
        diffErr.value = true
    } else {
        const email = `${userId.value}@kakeibo.app`
        await createUserWithEmailAndPassword(auth, email, pass.value)
            .then(async () => {
                await auth.signOut()
                showDialog.value = true
            })
            .catch((e: Error) => {
                console.log(e.message)
                if (/email-already/.test(e.message)) idErr.value = '既に使用されています。'
                if (/invalid-email/.test(e.message)) idErr.value = '無効なユーザーIDです。'
                if (/password/.test(e.message)) passErr.value = true
            })
    }
    isLoad.value = false
}

</script>

<template>
    <div class="u-inner">
        <h2>サインアップ</h2>
        <form @submit="onSubmit" novalidate class="q-gutter-y-lg">
            <q-input type="email" v-model="userId" label="ユーザーID（6文字以上）" class="full-width u-bg-white" />
            <p v-if="idErr">{{ idErr }}</p>
            <q-input :type="isPwd ? 'password' : 'text'" v-model="pass" label="パスワード（6文字以上）"
                class="full-width u-bg-white">
                <template v-slot:append>
                    <q-icon :name="isPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'" class="cursor-pointer"
                        @click="isPwd = !isPwd" />
                </template>
            </q-input>
            <p v-if="passErr">6文字以上で入力してください。</p>
            <q-input :type="isPwd ? 'password' : 'text'" v-model="pass2" label="パスワード（確認用）"
                class="full-width u-bg-white">
                <template v-slot:append>
                    <q-icon :name="isPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'" class="cursor-pointer"
                        @click="isPwd = !isPwd" />
                </template>
            </q-input>
            <p v-if="diffErr">確認用パスワードが異なっています。</p>
            <q-btn type="submit" label="登録" unelevated color="secondary" text-color="initial" class="full-width" />
        </form>
        <ul class="description">
            <li>ユーザーIDは、半角英数字と一部の記号一部の記号<br>（ . ! # $ % & ' ` * + - / = ? ^ _ { | } ~ ）<br>のみ使用できます。</li>
            <li>ユーザーIDは、先頭または最後尾にピリオド「.」を使えません。</li>
        </ul>
    </div>
    <q-dialog v-model="showDialog" persistent>
        <q-card class="complete-card">
                <q-card-section>
                    登録が完了しました。
                </q-card-section>
                <q-card-actions class="justify-end">
                    <q-btn label="OK" @click="router.push('/')" flat color="yellow-9" />
                </q-card-actions>
            </q-card>
    </q-dialog>
    <q-inner-loading :showing="isLoad" />
</template>

<style lang="scss" scoped>
h2 {
    margin: 0;
    padding: 16px 0 20px;
    text-align: center;
}

p {
    margin: 0;
    color: $red;
}

.description {
    padding-inline-start: 2em;
    opacity: 0.9;
    font-size: 14px;

    li {
        margin-bottom: 0.5em;
    }
}

.complete-card {
    width: 380px;
    max-width: 90%;
    padding: 16px;
}
</style>