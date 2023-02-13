<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from '@firebase/auth'
import { auth } from 'src/firebase'

const signInState = ref<boolean>()
const router = useRouter()

const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
        signInState.value = true
    } else {
        router.push('/signin')
        signInState.value = false
    }
})

onMounted(() => {
    unsubscribe()
})
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