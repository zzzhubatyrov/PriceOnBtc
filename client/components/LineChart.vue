<template>
  <div>
    <select v-model="period" @change="updateChart">
      <option value="day">День</option>
      <option value="week">Неделя</option>
      <option value="month">Месяц</option>
      <option value="year">1 год</option>
      <option value="custom">Custom</option>
    </select>
    <div v-if="period === 'custom'">
      <label for="startDate">Начальная дата:</label>
      <input type="date" id="startDate" v-model="startDate" @change="updateChart" />
      <label for="endDate">Конечная дата:</label>
      <input type="date" id="endDate" v-model="endDate" @change="updateChart" />
      <input type="time" v-model="startHour" @change="updateTime" id="start">
      <input type="time" v-model="endHour" @change="updateTime" id="end">
    </div>
    <select v-model="selectedCurrency" @change="changeCurrency">
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
      <option value="GBP">GBP</option>
    </select>
    <Line id="line-chart-id" :data="data" :options="options"/>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
import zoom from 'chartjs-plugin-zoom';
import { defineComponent, onMounted, ref } from 'vue';
import { Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, zoom, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const btcInfo = ref([])
const period = ref('day')
const data = ref({
  labels: [],
  datasets: [{ label: '', data: [] }]
})
const options = ref({
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      min: 31800,
      max: 40000,
    },
  },
  plugins: {
    zoom: {
      pan: {
        enabled: true,
        modifierKey: 'ctrl',
      },
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy',
      },
      limits: {
        y: { min: 30000, max: 50000 },
      }
    }
  },
})
const currencyDataMap = ref([])
const startDate = ref('')
const endDate = ref('')
const selectedCurrency = ref('USD')

const startHour = ref('')
const endHour = ref('')
const loadChartData = async (selectedPeriod: any, selectedCurrency: string) => {
  try {
    let url = `http://localhost:5000/${selectedPeriod}`
    if (selectedPeriod === 'custom') {
      url += `?startDate=${startDate.value}&endDate=${endDate.value}`;
      if (startHour.value && endHour.value) {
        url += `&startHour=${startHour.value}&endHour=${endHour.value}`;
      }
    }
    const periodRes = await axios.get(url)
    currencyDataMap.value = [];
    btcInfo.value = periodRes.data;
    btcInfo.value.forEach((item) => {
      const { code } = item
      if (!currencyDataMap.value[code]) {
        currencyDataMap.value[code] = []
      }
      currencyDataMap.value[code].push({ label: item.updated, data: item.rateFloat});
    })
    const allLabels = currencyDataMap.value[selectedCurrency].map(item => item.label)
    const dataSets = [{
      label: selectedCurrency,
      data: currencyDataMap.value[selectedCurrency].map(item => item.data)
    }]
    data.value = {labels: allLabels, datasets: dataSets};
  } catch (e) {
    console.log(e)
  }
}

const updateTime = () => {
  if (startHour.value && endHour.value) {
    new Date(`${startDate.value}T${startHour.value}`);
    new Date(`${endDate.value}T${endHour.value}`);
    loadChartData(period.value, selectedCurrency.value)
  }
}
const updateChart = () => {
  switch (period.value) {
    case 'day':
      loadChartData(period.value, selectedCurrency.value)
      break;
    case 'week':
      loadChartData(period.value, selectedCurrency.value)
      break;
    case 'month':
      loadChartData(period.value, selectedCurrency.value)
      break;
    case 'year':
      loadChartData(period.value, selectedCurrency.value)
      break;
    case 'custom':
      loadChartData(period.value, selectedCurrency.value)
      break;
  }
}
const changeCurrency = () => {
  loadChartData(period.value, selectedCurrency.value)
};
const updateCustomChart = (selPeriod: any) => {
  loadChartData(period.value, selPeriod.value)
}
watch([startDate.value, endDate.value], () => {
  if (period.value === 'custom') {
    updateCustomChart(period.value);
  }
});
watch(selectedCurrency, () => {
  updateChart();
});
onMounted(() => {
  loadChartData(period.value, selectedCurrency.value)
})
defineComponent({
  name: 'LineChart',
  extends: Line,
})
</script>
