<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { query, orderBy, limit, collection, getDocs } from 'firebase/firestore'
import { auth, db } from 'src/firebase'
import DoughnutChart from 'src/components/DoughnutChart.vue'
import { getDoughnutValue } from 'src/components/functions/getDoughnutValue'
import { OptionCategory, SingleExpenseDoc } from 'src/components/models'
import { getCategory } from 'src/components/functions/getCategory'

const categories = ref<OptionCategory[]>([])

const timelineData = ref<SingleExpenseDoc[]>([])

const chartValue = ref<number[]>([])
const chartSum = ref<number>()

const date = new Date()

onMounted(async () => {
    if (auth.currentUser) {
        const colRef = collection(db, auth.currentUser.uid)

        const tlq = query(colRef, orderBy('createdAt', 'desc'), limit(5))
        const tlSnap = await getDocs(tlq)
        tlSnap.forEach(doc => timelineData.value.push(doc.data() as SingleExpenseDoc))

        categories.value = await getCategory()
        const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        chartValue.value = await getDoughnutValue(monthStr, categories.value)
        let sum = 0
        for (let i = 0; i < chartValue.value.length; i++) {
            sum += chartValue.value[i]
        }
        chartSum.value = sum
    }
})

</script>

<template>
    <div class="u-inner">
        <h2>今月の出費</h2>
        <q-card class="chart-wrap">
            <div v-if="chartSum == 0" class="no-data">
                <img src="../assets/pigbear.png" alt="" draggable="false">
                今月のデータはありません。
            </div>
            <div v-else-if="chartValue.length">
                <div class="amount-area">
                    <div>{{ date.getFullYear() }}年 {{ date.getMonth() + 1 }}月</div>
                    <div class="q-ml-auto">￥ {{ chartSum!.toLocaleString() }}</div>
                </div>
                <DoughnutChart :chart-value="chartValue" :categories="categories" />
            </div>
            <div v-else class="q-pa-xl">Loading</div>
        </q-card>
        <h2>最近の記録</h2>
        <div v-if="timelineData.length" class="tl-wrap">
            <q-timeline color="secondary" class="tl">
                <q-timeline-entry v-for="snap in timelineData" :subtitle="snap.date" :title="snap.category">
                    <div class="tl-inner">
                        <p>{{ snap.memo }}</p>
                        <span>￥{{ snap.amount.toLocaleString() }}</span>
                    </div>
                </q-timeline-entry>
            </q-timeline>
        </div>
    </div>
</template>

<style scoped lang="scss">
h2 {
    margin: 0 0 16px;
    text-align: center;
    font-size: 1.375rem;
}

h2:nth-of-type(2) {
    margin: 40px 0 12px;
}

.chart-wrap {
    min-height: 176px;
    padding: 1px;
    margin: 0 auto;
    box-shadow: rgba(80, 73, 67, 0.2) 0 2px 8px;
    border-radius: 8px;
}

.amount-area {
    width: fit-content;
    padding: 4px 16px;
    border-bottom: 1px solid #ccc;
    margin: 16px auto -10px;
    
    div:last-child {
        font-size: 1.25em;
    }
    // padding: 16px 32px;
    // border: 1px solid rgba(80, 73, 67, 0.16) !important;
    // border-radius: 4px !important;
    // background-color: rgba(80, 73, 67, 0.08);
}

.no-data {
    width: 100%;
    margin: 0;
    padding: 0 8px 20px;
    // border: 1px solid rgba(80, 73, 67, 0.08);
    // background-color: rgba(80, 73, 67, 0.04);
    text-align: center;
    font-size: 1.25rem;

    img {
        display: block;
        margin: 0 auto;
        width: 200px;
    }
}

.tl-wrap {
    display: flex;
    justify-content: center;
}

.tl {
    margin: 0;
    padding: 0 8px;
}

.tl-inner {
    display: flex;
    justify-content: space-between;

    p {
        white-space: pre-wrap;
    }

    span {
        display: block;
        margin-left: 16px;
        font-size: 1.25em;
    }
}
</style>