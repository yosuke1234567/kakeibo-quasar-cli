<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { doc, getDoc, setDoc } from '@firebase/firestore'
import { onAuthStateChanged, signInWithEmailAndPassword, signInAnonymously, User } from '@firebase/auth'
import { auth, db } from 'src/firebase'
import { palette } from 'src/components/palette'

const router = useRouter()

const userId = ref('')
const pass = ref('')
const isPwd = ref(true)

const errMsg = ref('')
const isLoad = ref(false)

const confirmGuest = ref(false)

const init = async (user: User) => {
    const docRef = doc(db, user.uid, 'option')
    const docData = (await getDoc(docRef)).data()

    // カテゴリー未設定の場合、初期設定
    if (docData === undefined) {
        await setDoc(docRef, {
            category: [
                { type: '食費', color: palette[0] },
                { type: '日用品', color: palette[1] },
                { type: '交際費', color: palette[2] },
                { type: '交通費', color: palette[4] },
                { type: '衣服', color: palette[5] },
                { type: '水道光熱費', color: palette[6] },
                { type: 'その他', color: palette[15] }
            ]
        })
        console.log('set category')
    }
}

const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('sign in')
        await init(user)
        router.push('/')
    }
})

const onSubmit = async (e: Event) => {
    e.preventDefault()

    isLoad.value = true
    if (userId.value && pass.value) {
        const email = `${userId.value}@kakeibo.app`
        await signInWithEmailAndPassword(auth, email, pass.value)
            .then(() => unsubscribe())
            .catch((e: Error) => {
                console.log(e.message)
                if (/user-not-found|invalid-email/.test(e.message)) errMsg.value = '存在しないユーザーIDです。'
                else if (/wrong-password/.test(e.message)) errMsg.value = 'パスワードが違います。'
                else errMsg.value = '認証できませんでした。'
            })
    } else if (!userId.value) {
        errMsg.value = 'ユーザーIDを入力してください。'
    } else if (!pass.value) {
        errMsg.value = 'パスワードを入力してください。'
    }
    isLoad.value = false
}

const onGuestSignIn = async () => {
    isLoad.value = true
    await signInAnonymously(auth)
    console.log('sign in as guest')
    unsubscribe()
    isLoad.value = false
}

onBeforeUnmount(()=> {
    unsubscribe()
})

</script>
    
<template>
    <div class="u-inner">
        <h2>サインイン</h2>
        <p v-if="errMsg" class="text-red">
            <q-icon name="sym_r_error" size="1.25em" />
            {{ errMsg }}
        </p>
        <form @submit="onSubmit" novalidate class="q-gutter-y-lg">
            <q-input type="email" v-model="userId" label="ユーザーID" class="full-width u-bg-white" />
            <q-input :type="isPwd ? 'password' : 'text'" v-model="pass" label="パスワード" class="full-width u-bg-white">
                <template v-slot:append>
                    <q-icon :name="isPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'" class="cursor-pointer"
                        @click="isPwd = !isPwd" />
                </template>
            </q-input>
            <q-btn type="submit" label="サインイン" unelevated color="secondary" text-color="initial" padding="12px 0"
                class="full-width" />
        </form>
        <q-separator class="q-my-lg" />
        <q-btn @click="confirmGuest = true" label="ゲストとして利用する" flat color="brown-7" class="row q-mx-auto q-mb-sm" />
        <q-btn @click="router.push('/signup')" label="アカウントを新規作成" flat color="brown-7" class="row q-mx-auto" />
        <q-dialog v-model="confirmGuest">
            <q-card class="confirm-card">
                <q-card-section>
                    <p>ゲストとして利用します。</p>
                    <p class="q-mb-none">一度サインアウトすると入力したデータは使用できなくなります。</p>
                </q-card-section>
                <q-card-actions class="justify-end">
                    <q-btn label="キャンセル" @click="confirmGuest = false" flat />
                    <q-btn label="OK" @click="onGuestSignIn" flat color="yellow-9" />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-inner-loading :showing="isLoad" />
    </div>
</template>
    
<style scoped lang="scss">
h2 {
    margin: 0;
    padding: 16px 0 20px;
    text-align: center;
}

form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.confirm-card {
    width: 380px;
    max-width: 90%;
    padding: 16px;
}
</style>