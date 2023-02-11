<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { doc, setDoc } from '@firebase/firestore'
import { auth, db } from 'src/firebase'
import { getCategory } from 'src/components/functions/getCategory'
import { updateMonthlyData } from 'src/components/functions/updateMonthlyData'
import { OptionCategory } from 'src/components/models'

const categories = ref<OptionCategory[]>([])
const options = ref<OptionCategory['type'][]>([])

// inputs
const date = ref('')
const category = ref('')
const amount = ref('') // コンマ含む、画面表示
const amountNum = ref<number>(0) // firebaseに送信用
const memo = ref('')

// error flag
const calendarErr = ref(false)
const categoryErr = ref(false)
const amountErr = ref(false)

// 「保存しました」ダイアログの表示
const openDialog = ref(false)

onMounted(async () => {
    if (auth.currentUser) {
        categories.value = await getCategory()
        options.value = categories.value.map((e: OptionCategory) => e.type)
    }
})

const onSubmit = async (e: Event) => {
    e.preventDefault()

    calendarErr.value = date.value === '' ? true : false
    categoryErr.value = category.value === '' ? true : false
    amountErr.value = amountNum.value < 1 ? true : false

    if (!calendarErr.value && !categoryErr.value && !amountErr.value) {
        const monthIndex = new Date(date.value.slice(0, 7)).getTime()
        const id = Date.now()
        const docRef = doc(db, auth.currentUser!.uid, `expense-${id}`)
        await setDoc(docRef, {
            date: date.value,
            category: category.value,
            amount: amountNum.value,
            memo: memo.value,
            expenseMonthIndex: monthIndex,
            createdAt: id
        })

        await updateMonthlyData(monthIndex, categories.value)

        date.value = ''
        amount.value = ''
        category.value = ''
        memo.value = ''

        openDialog.value = true
    }
}

const onKeydown = (e: KeyboardEvent) => {
    e.key === 'Enter' ? e.preventDefault() : null
}

const onInput = () => {
    // 全角数字を半角に変換
    let x = amount.value.replace(/[０-９]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xFEE0)
    })
    // アラビア数字以外を削除
    x = x.replace(/\D/g, '') // \D = アラビア数字以外
    amountNum.value = Number(x)
    if (amountNum.value > 0) {
        amount.value = amountNum.value.toLocaleString()
    }
}
</script>
            
<template>
    <div class="u-inner">
        <h2>入力</h2>
        <form v-if="options.length" @submit="onSubmit" class="q-gutter-y-lg">
            <q-input v-model="date" readonly label="日付 *"
                class="u-bg-white u-del-date-icon cursor-pointer" :class="{ err: calendarErr }">
                <template v-slot:prepend>
                    <q-icon name="sym_r_event" />
                </template>
                <q-popup-proxy transition="fade">
                    <q-date v-model="date" first-day-of-week="0" mask="YYYY-MM-DD" today-btn color="secondary"
                        text-color="dark" flat>
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="閉じる" outline color="grey-8" />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-input>
            <q-select v-model="category" label="カテゴリー *" :options="options" :class="{ err: categoryErr }"
                class="u-bg-white">
                <template v-slot:prepend>
                    <q-icon name="sym_r_category" />
                </template>
            </q-select>
            <q-input v-model="amount" @update:model-value="onInput" @keydown="onKeydown" label="金額 *" inputmode="numeric"
                :class="{ err: amountErr }" class="amount-input u-bg-white" autocomplete="off">
                <template v-slot:prepend>
                    <q-icon name="sym_r_currency_yen" />
                </template>
            </q-input>
            <q-input v-model="memo" label="メモ" autogrow class="u-bg-white">
                <template v-slot:prepend>
                    <q-icon name="sym_r_edit" />
                </template>
            </q-input>
            <q-btn type="submit" label="保存する" unelevated color="secondary" text-color="initial" padding="12px 0"
                class="full-width" />
        </form>
        <q-dialog v-model="openDialog">
            <q-card class="q-px-lg q-pb-md">
                <q-card-section class="dialog-section">
                    <img src="../assets/bear.png" alt="" class="dialog-img" draggable="false">
                    <div>保存しました</div>
                </q-card-section>
                <q-card-actions>
                    <q-btn label="閉じる" v-close-popup outline color="grey-8" padding="8px 32px" class="q-mx-auto" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>
            
<style scoped lang="scss">
h2 {
    margin: 0;
    padding: 0 0 20px;
    text-align: center;
}

form {
    padding-bottom: 60px;
}

.err {
    position: relative;
    background-color: $red-2;
    margin-bottom: 36px;
}

.err::after {
    content: '選択してください。';
    position: absolute;
    bottom: -1.5em;
    color: $red-4;
    font-size: 0.75em;
}

.amount-input.err::after {
    content: '1以上の半角数字で入力してください。';
}

.dialog-section {
    text-align: center;
    font-size: 1.25rem;

    img {
        width: 250px;
        user-select: none;
    }
}
</style>