<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { auth } from 'src/firebase'
import { OptionCategory } from 'src/components/models'
import { Doughnut } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    Plugin,
    ChartData,
    ChartOptions
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)
ChartJS.defaults.font.family = "'Asap', 'Zen Maru Gothic', sans-serif"
ChartJS.defaults.plugins.legend.position = 'top'

interface props {
    chartValue: number[],
    categories: OptionCategory[]
}

const props = defineProps<props>()

const chartData = ref<ChartData<'doughnut'>>({
    labels: [],
    datasets: []
})

const chartLabels = ref<string[]>([])
const chartBgColor = ref<string[]>([])

const setChartValue = () => {
    chartData.value = {
        labels: chartLabels.value,
        datasets: [
            {
                borderColor: '#fff',
                backgroundColor: chartBgColor.value,
                data: props.chartValue
            }
        ]
    }
}

onMounted(async () => {
    if (auth.currentUser) {
        chartLabels.value = props.categories.map(e => e.type)
        chartBgColor.value = props.categories.map(e => e.color)

        setChartValue()
    }
})

watch(props, setChartValue)

const options: ChartOptions<'doughnut'> = {
    layout: {
        padding: 24
    }
}
</script>

<template>
    <Doughnut :data="chartData" :options="options"></Doughnut>
</template>

<style lang="scss">

</style>