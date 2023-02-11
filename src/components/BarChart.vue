<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    Plugin,
    ChartOptions,
    ChartData
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
ChartJS.defaults.font.family = "'Asap', 'Zen Maru Gothic', sans-serif"
ChartJS.defaults.aspectRatio = 1.333

interface props {
    chartValue: number[]
    labels: string[]
    bg: string[]
    setMonth: Function
}

const props = defineProps<props>()

const chartData = ref<ChartData<'bar'>>({
    labels: [],
    datasets: []
})

const updateValue = () => {
    chartData.value = {
        labels: props.labels,
        datasets: [
            {
                borderColor: '#f5f2eb',
                borderRadius: 8,
                backgroundColor: props.bg,
                data: props.chartValue
            }
        ]
    }
}

onMounted(updateValue)

watch(props, updateValue)

const options: ChartOptions<'bar'> = {
    scales: {
        x: { grid: { color: 'transparent' } },
        y: { ticks: { maxTicksLimit: 6 } }
    },
    plugins: {
        legend: { display: false }
    },
    layout: {
        padding: 20
    },
    onClick(event, elements, chart) {
        console.log(event, elements, chart)
        if(elements[0]) {
            props.setMonth(elements[0].index)
        }
    },
}
</script>
        
<template>
    <Bar :data="chartData" :options="options"></Bar>
</template>

<style lang="scss">

</style>