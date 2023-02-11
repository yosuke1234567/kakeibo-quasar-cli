<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { doc, setDoc } from '@firebase/firestore'
import { auth, db } from 'src/firebase'
import { OptionCategory } from 'src/components/models'
import { getCategory } from 'src/components/functions/getCategory'
import { palette } from 'src/components/palette'

const router = useRouter()
const confirmSignOut = ref(false)

const onSignOut = () => {
    auth.signOut()
    router.push('/')
}

const isGuest = ref<boolean>()
const categories = ref<OptionCategory[]>([])

onMounted(async () => {
    if (auth.currentUser) {
        isGuest.value = auth.currentUser.isAnonymous
        categories.value = await getCategory()
    }
})

const isEditing = ref(false)
const pickedColor = ref<string>()
const editIndex = ref<number>()
const confirmDelete = ref(false)

const onEdit = (index: number) => {
    pickedColor.value = categories.value[index].color
    editIndex.value = index
    isEditing.value = true
}

const saveColor = async () => {
    categories.value[editIndex.value!].color = pickedColor.value!
    const docRef = doc(db, auth.currentUser!.uid, 'option')
    await setDoc(docRef, {
        category: categories.value
    })
    isEditing.value = false
}

const deleteCategory = async () => {
    categories.value.splice(editIndex.value!, 1)
    const docRef = doc(db, auth.currentUser!.uid, 'option')
    await setDoc(docRef, {
        category: categories.value
    })
    confirmDelete.value = false
    isEditing.value = false
}

const openAdd = ref(false)
const newCategory = ref<string>()
const newColor = ref('#999999')

const addCategory = async () => {
    const docRef = doc(db, auth.currentUser!.uid, 'option')
    if (newCategory.value) {
        categories.value.push({
            type: newCategory.value,
            color: newColor.value
        })
        await setDoc(docRef, {
            category: categories.value
        })
        openAdd.value = false
    }
}
</script>

<template>
    <div class="u-inner">
        <h2 class="text-center">マイページ</h2>
        <div>{{ auth.currentUser?.email }}</div>
        <q-card flat bordered class="q-mt-sm">
            <q-item @click="confirmSignOut = true" clickable class="q-px-lg q-py-md">
                <q-item-section avatar>
                    <q-icon name="sym_r_logout" />
                </q-item-section>
                <q-item-section>サインアウト</q-item-section>
            </q-item>
        </q-card>
        <q-dialog v-model="confirmSignOut">
            <q-card class="confirm-card">
                <q-card-section class="dialog-section">
                    <div>サインアウトしますか？</div>
                    <div v-if="isGuest" class="guest-text">
                        ゲストの場合、このデータは使用できなくなります。
                    </div>
                </q-card-section>
                <q-card-actions class="justify-end">
                    <q-btn label="キャンセル" @click="confirmSignOut = false" flat />
                    <q-btn label="OK" @click="onSignOut" color="yellow-9" flat />
                </q-card-actions>
            </q-card>
        </q-dialog>
        <div class="category-wrap">
            <div class="category-head">
                <h3>カテゴリー</h3>
                <!-- <q-btn :label="(isEditing ? '完了' : '編集')" @click="(isEditing = !isEditing)" color="primary" flat /> -->
            </div>
            <q-card flat bordered class="q-mb-md">
                <q-item @click="openAdd = true" clickable class="q-px-lg q-py-md">
                    <q-item-section avatar>
                        <q-icon name="sym_r_add" />
                    </q-item-section>
                    <q-item-section>カテゴリーを追加</q-item-section>
                </q-item>
            </q-card>
            <q-dialog v-model="openAdd">
                <q-card class="dialog-card">
                    <div class="dialog-inner">
                        <h3 class="text-center">カテゴリーを追加</h3>
                        <q-input v-model="newCategory" label="カテゴリー名" class="q-mb-lg">
                            <template v-slot:prepend>
                                <q-icon name="sym_r_edit" />
                            </template>
                        </q-input>
                        <q-color v-model="newColor" :palette="palette" default-view="palette" no-header-tabs bordered
                            class="color-picker q-mx-auto" />
                        <q-btn label="保存" @click="addCategory" unelevated color="secondary" text-color="initial"
                            class="full-width q-mt-lg q-mb-md" />
                        <q-btn label="キャンセル" @click="openAdd = false" outline color="grey-8" class="full-width" />
                    </div>
                </q-card>
            </q-dialog>
            <q-card v-if="categories" flat bordered>
                <q-list separator>
                    <q-item v-for="(category, index) in categories" clickable @click="onEdit(index)"
                        class="q-px-lg category-item">
                        <q-item-section side>
                            <div :style="{ backgroundColor: category.color }" class="category-color"></div>
                        </q-item-section>
                        <q-item-section>
                            {{ category.type }}
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card>
            <q-dialog v-model="isEditing">
                <q-card class="dialog-card q-pa-lg">
                    <div class="dialog-inner">
                        <h3 class="text-center">{{ categories[editIndex!].type }}</h3>
                        <q-color v-model="pickedColor" :palette="palette" default-view="palette" no-header-tabs bordered
                            class="color-picker" />
                        <q-btn label="保存" @click="saveColor" color="secondary" unelevated text-color="initial"
                            class="full-width q-my-md" />
                        <q-btn label="キャンセル" @click="isEditing = false" outline color="grey-8" class="full-width" />
                        <q-btn label="削除" @click="confirmDelete = true" outline color="red-5"
                            class="full-width q-mt-xl" />
                    </div>
                </q-card>
            </q-dialog>
            <q-dialog v-model="confirmDelete">
                <q-card class="confirm-card">
                    <q-card-section class="dialog-section">
                        <div>削除しますか？</div>
                    </q-card-section>
                    <q-card-actions class="justify-end">
                        <q-btn label="キャンセル" @click="confirmDelete = false" flat />
                        <q-btn label="OK" @click="deleteCategory" flat color="yellow-9" />
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </div>
    </div>
</template>

<style lang="scss" scoped>
h2 {
    margin: 0 0 20px;
}

.category-wrap {
    padding-bottom: 50px;
}

.category-head {
    display: flex;
    align-items: center;
    padding: 24px 0 4px;

    h3 {
        margin: 0 auto 0 4px;
    }
}

.confirm-card {
    width: 380px;
    max-width: 90%;
    padding: 16px;
    font-weight: 500;
}

.guest-text {
    margin-top: 14px;
    font-size: 14px;
    opacity: 0.85;
}

.dialog-card {
    width: 400px;
    max-width: 90vw;
    padding: 32px 0;
}

.dialog-inner {
    width: 264px;
    margin: 0 auto;

    h3 {
        margin: 4px 0 16px;
    }
}

.category-item {
    height: 56px;
}

.category-color {
    width: 24px;
    height: 24px;
    margin-right: 16px;
    border-radius: 50%;
}

.color-picker {
    width: 264px;
    box-shadow: none;
}
</style>