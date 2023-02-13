<script setup lang="ts">
import { ActionCodeSettings, sendSignInLinkToEmail } from '@firebase/auth'
import { auth } from 'src/firebase'
import { ref } from 'vue'

const email = ref<string | null>('')
const sent = ref(false)
const isLoad = ref(false)

const onSendEmail = async (e: Event) => {
    e.preventDefault()

    const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/#/signup`,
        handleCodeInApp: true
    }

    if (email.value) {
        isLoad.value = true
        await sendSignInLinkToEmail(auth, email.value, actionCodeSettings)
            .then(() => sent.value = true)
            .catch((error: Error) => {
                alert('メールを送信できませんでした。')
                console.error(error.message)
            })
        isLoad.value = false
    }
}
</script>

<template>
    <div v-if="sent" class="u-inner">
        <q-card class="sent-msg">
            <p>メールを送信しました。</p>
            <p>メールが受信されない場合、お手数ですがページを更新して再度お試しください。</p>
        </q-card>
    </div>
    <div v-else class="u-inner">
        <h2>確認メールを送信します。</h2>
        <form @submit="onSendEmail" class="q-gutter-y-lg">
            <q-input type="email" v-model="email" label="メールアドレス" class="full-width u-bg-white" />
            <q-btn type="submit" label="送信" unelevated color="secondary" text-color="initial" class="full-width" />
        </form>
    </div>
    <q-inner-loading :showing="isLoad" />
</template>

<style lang="scss" scoped>
h2 {
    margin: 0;
    padding: 0 0 20px;
    font-size: 1.17rem;
    text-align: center;
}

.sent-msg {
    padding: 16px 24px;

    p {
        margin: 8px auto;
    }
}
</style>