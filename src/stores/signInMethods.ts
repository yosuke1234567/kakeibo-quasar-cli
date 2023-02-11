import { User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { auth } from 'src/firebase'

export const useSignInMethods = defineStore('signInMethods', {
    state: () => {
        return {
            user: null as User | null
        }
    },
    actions: {
        set(value: User) {
            this.user = value
        },
        signOut() {
            auth.signOut()
            this.user = null
        },
    },
})