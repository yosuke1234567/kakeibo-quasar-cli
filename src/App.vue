<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged, isSignInWithEmailLink, fetchSignInMethodsForEmail, EmailAuthProvider, verifyPasswordResetCode } from '@firebase/auth'
import { auth } from 'src/firebase'

const params = new URLSearchParams(window.location.search)
const oobCode = params.get('oobCode')
verifyPasswordResetCode(auth, oobCode!).then(() => console.log('ok')).catch((e) => console.error(e.message))
// console.log(oobCode)
const signInState = ref<boolean>()
const router = useRouter()
const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchSignInMethodsForEmail(auth, user.email!)
            .then((signInMethods) => {
                if (signInMethods.indexOf(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1) {
                    // サインイン状態 email/password
                } else if (signInMethods.indexOf(EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD) != -1) {
                    // サインイン状態 email/link
                    router.push('/updatepass')
                }
                signInState.value = true
            })
        console.log(user.email)
    } else if (isSignInWithEmailLink(auth, window.location.href)) {
        signInState.value = true
    } else {
        signInState.value = false
        router.push('/signin')
    }
})

onMounted(() => unsubscribe())
</script>

<template>
    <div v-if="signInState === undefined" class="loading">
        <q-spinner-oval size="3em" />
    </div>
    <router-view v-else />
</template>

<style scoped>
.loading {
    position: absolute;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
}
</style>