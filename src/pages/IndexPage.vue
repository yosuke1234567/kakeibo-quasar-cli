<script setup lang="ts">
import { useRouter } from 'vue-router'
import { auth } from 'src/firebase'
import { EmailAuthProvider, fetchSignInMethodsForEmail } from '@firebase/auth'

const router = useRouter()

auth.currentUser ? router.push('/home') : router.push('/signin')

// if (auth.currentUser) {
//     fetchSignInMethodsForEmail(auth, auth.currentUser.email!)
//         .then((signInMethods) => {
//             if (signInMethods.indexOf(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1) {
//                 router.push('/home')
//             } else if (signInMethods.indexOf(EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD) != -1) {
//                 router.push('/updatepass')
//             }
//         })
// } else {
//     router.push('/signin')
// }
</script>

<template>

</template>

<style>

</style>