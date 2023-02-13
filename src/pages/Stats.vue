<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { DocumentData, deleteDoc, doc, DocumentReference } from 'firebase/firestore'
import { auth, db } from 'src/firebase'
import BarChart from 'src/components/BarChart.vue'
import DoughnutChart from 'src/components/DoughnutChart.vue'
import { getMonthlyData } from 'src/components/functions/getMonthlyData'
import { updateMonthlyData } from 'src/components/functions/updateMonthlyData'
import { getDoughnutValue } from 'src/components/functions/getDoughnutValue'
import { getBarValue } from 'src/components/functions/getBarValue'
import { OptionCategory } from 'src/components/models'
import { getCategory } from 'src/components/functions/getCategory'

const chartLabels = ref<string[]>([])
const date = new Date()
const yearNum = ref(date.getFullYear())
const monthNum = ref(date.getMonth() + 1)
const setLabels = () => {
    for (let i = 0; i < 6; i++) {
        if ((monthNum.value - i) > 0) {
            if ((monthNum.value - i) < 13) {
                const month = (monthNum.value - i).toString().padStart(2, '0') // 月の0埋め
                chartLabels.value.unshift(`${yearNum.value}-${month}`)
            } else {
                const month = ((monthNum.value - i) - 12).toString().padStart(2, '0')
                chartLabels.value.unshift(`${yearNum.value + 1}-${month}`)
            }
        } else {
            const month = (12 - (i - monthNum.value)).toString().padStart(2, '0')
            chartLabels.value.unshift(`${yearNum.value - 1}-${month}`)
        }
    }
}


const doughnutValue = ref<number[]>([])
const categories = ref<OptionCategory[]>([])

const barValue = ref<number[]>([])
const barBg = ref<string[]>(['#ddd0bb', '#ddd0bb', '#ddd0bb', '#ddd0bb', '#ddd0bb', '#fdd835'])
const monthIndex = ref<string>(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`)
const monthIndexNum = ref<number>(5) // activeのbarValueが何番目かを保存
const activeValue = ref<number>()
const barPage = ref<number>(0) // 現在表示している月があるページを0とする

const setMonth = async (index: number) => {
    if (monthIndex.value !== chartLabels.value[index]) openDetail.value = false
    monthIndexNum.value = index
    monthIndex.value = chartLabels.value[index]
    activeValue.value = barValue.value[index]
    barPage.value = 0
    for (let i = 0; i < 6; i++) {
        barBg.value[i] = i == index ? '#fdd835' : '#ddd0bb'
    }
    doughnutValue.value = await getDoughnutValue(monthIndex.value, categories.value)
}

const monthlyData = ref<DocumentData[]>([])
const openDetail = ref(false)
const openDelete = ref(false)

const deleteDocRef = ref<DocumentReference>()

onMounted(async () => {
    if (auth.currentUser) {
        setLabels()
        barValue.value = await getBarValue(chartLabels.value)

        categories.value = await getCategory()
        doughnutValue.value = await getDoughnutValue(monthIndex.value, categories.value)
        activeValue.value = barValue.value[5]
    }
})

// ページネーション
const navigateBar = async (margin: number) => {
    if ((monthNum.value + margin) < 1) {
        yearNum.value = yearNum.value - 1
        monthNum.value = monthNum.value + margin + 12
    } else if ((monthNum.value + margin) > 12) {
        yearNum.value = yearNum.value + 1
        monthNum.value = monthNum.value + margin - 12
    } else {
        monthNum.value = monthNum.value + margin
    }

    chartLabels.value.splice(0)
    setLabels()

    barValue.value = await getBarValue(chartLabels.value)
    console.log(barValue.value)

    margin > 0 ? setMonth(0) : setMonth(5)
}

// 来月、先月表示
const showLastMonth = () => {
    if ((monthIndexNum.value - 1) >= 0) {
        setMonth(monthIndexNum.value - 1)
    } else {
        navigateBar(-6)
    }
}
const showNextMonth = () => {
    if ((monthIndexNum.value + 1) < 6) {
        setMonth(monthIndexNum.value + 1)
    } else {
        navigateBar(6)
    }
}

const showDetail = async () => {
    const time = new Date(monthIndex.value).getTime()
    monthlyData.value = await getMonthlyData(time)
    openDetail.value = true
}

const showDeleteDialog = (id: number) => {
    deleteDocRef.value = doc(db, auth.currentUser!.uid, `expense-${id}`)
    openDelete.value = true
}

const deleteData = async () => {
    const time = new Date(monthIndex.value).getTime()
    await deleteDoc(deleteDocRef.value!)
    await updateMonthlyData(time, categories.value)

    monthlyData.value = await getMonthlyData(time)
    barValue.value = await getBarValue(chartLabels.value)
    doughnutValue.value = await getDoughnutValue(monthIndex.value, categories.value)

    activeValue.value = barValue.value[monthIndexNum.value]
    openDelete.value = false
}
</script>

<template>
    <div class="u-inner">
        <h2>統計</h2>
        <div class="chart-wrap">
            <q-card class="q-py-md q-mb-lg radius-8">
                <div class="amount-area">
                    {{ monthIndex.slice(0, 4) }}年 {{ monthIndex.slice(5, 7) }}月
                    <span v-if="(activeValue || activeValue == 0)">￥{{ activeValue.toLocaleString() }}</span>
                </div>
                <div v-if="barValue.length">
                    <BarChart :chart-value="barValue" :labels="chartLabels" :bg="barBg" :set-month="setMonth" />
                    <div class="pagination">
                        <q-btn @click="navigateBar(-6)" icon="sym_r_keyboard_double_arrow_left" label="前ページ" dense
                            stack flat class="q-mr-lg page-btn" aria-label="prev page" />
                        <q-btn @click="showLastMonth" icon="sym_r_navigate_before" label="前月" dense stack flat
                            class="q-mr-lg page-btn" aria-label="prev month" />
                        <q-btn @click="showNextMonth" icon="sym_r_navigate_next" label="次月" dense stack flat
                            class="q-mr-lg page-btn" aria-label="next month" />
                        <q-btn @click="navigateBar(6)" icon="sym_r_keyboard_double_arrow_right" label="次ページ" dense
                            stack flat class="page-btn" aria-label="next page" />
                    </div>
                </div>
            </q-card>
            <q-card v-if="doughnutValue.length" class="radius-8">
                <DoughnutChart :chart-value="doughnutValue" :categories="categories" />
            </q-card>
        </div>
        <div v-if="doughnutValue.length" class="detail-wrap">
            <q-card v-if="openDetail" transition="fade" class="full-width">
                <div class="detail-title">
                    {{ monthIndex.slice(0, 4) }}年 {{ new Date(monthIndex).getMonth() + 1 }}月
                </div>
                <q-card-section class="q-py-sm">
                    <q-list separator>
                        <q-item v-for="snap in monthlyData" class="q-pa-md">
                            <q-item-section avatar class="q-pr-lg">
                                <q-avatar color="primary" text-color="white" size="md" rounded>{{ snap.date.slice(8) }}
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>￥{{ snap.amount.toLocaleString() }} - {{ snap.category }}</q-item-label>
                                <q-item-label caption>{{ snap.memo }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn @click="showDeleteDialog(snap.createdAt)" icon="sym_r_delete" size="md" flat
                                    round />
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <q-dialog v-model="openDelete">
                        <q-card class="dialog-card">
                            <q-card-section class="dialog-section">
                                <img src="../assets/honey.png" alt="" draggable="false">
                                <div>削除しますか？</div>
                                <q-btn label="削除" @click="deleteData" outline color="red-5"
                                    class="full-width q-mt-lg q-mb-md" />
                                <q-btn label="キャンセル" @click="openDelete = false" outline color="grey-8"
                                    class="full-width" />
                            </q-card-section>
                        </q-card>
                    </q-dialog>
                </q-card-section>
            </q-card>
            <q-card v-else class="q-mt-sm">
                <q-item @click="showDetail" clickable class="q-px-lg q-py-md">
                    <q-item-section avatar>
                        <q-icon name="sym_r_expand_more" />
                    </q-item-section>
                    <q-item-section>詳細を表示</q-item-section>
                </q-item>
            </q-card>
        </div>
    </div>
</template>

<style lang="scss" scoped>
h2 {
    text-align: center;
    margin: 0 0 20px;
}

.chart-wrap {
    min-height: 400px;
    text-align: center;
}

.pagination {
    margin-top: -8px;
}

.page-btn {
    font-size: 12px;
    font-weight: normal;
}

.amount-area {
    width: fit-content;
    margin: 10px auto 8px;
    padding: 16px 32px;
    border: 1px solid rgba(80, 73, 67, 0.16) !important;
    border-radius: 4px !important;
    background-color: rgba(80, 73, 67, 0.08);
}

.radius-8 {
    border-radius: 8px;
}

.detail-wrap {
    padding: 24px 0 48px;
}

.detail-title {
    padding: 16px 24px;
    background-color: $amber-4;
    font-size: 1.25em;
}

.dialog-section {
    text-align: center;
    font-size: 1.25rem;

    img {
        width: 200px;
        user-select: none;
    }
}

.dialog-card {
    width: 400px;
    max-width: 100%;
    padding: 0 16px 16px;
}
</style>
<style>
.page-btn .q-icon {
    font-size: 1.5rem;
}
</style>