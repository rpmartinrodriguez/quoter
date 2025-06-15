<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-chart-bar</v-icon>
      Mi Estadística
    </v-card-title>
    
    <div v-if="isLoading || isLoadingReferrals" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4 text-grey">Cargando datos...</div>
    </div>

    <v-card-text v-else>
      <v-row>
        <v-col cols="12">
          <div class="text-overline">Estadísticas Globales (Todo el Histórico)</div>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="success" variant="tonal">
            <div class="text-subtitle-1">NÚMERO DE VENTAS</div>
            <div class="text-h3 font-weight-bold mt-2">{{ totalNumeroDeVentas }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="info" variant="tonal">
            <div class="text-subtitle-1">NÚMERO DE COTIZACIONES</div>
            <div class="text-h3 font-weight-bold mt-2">{{ totalNumeroDeCotizaciones }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="primary" variant="tonal">
            <div class="text-subtitle-1">TASA DE CONVERSIÓN</div>
            <div class="text-h3 font-weight-bold mt-2">{{ totalTasaDeConversion }}%</div>
            <div class="text-caption mt-1">(Ventas / Total de Registros)</div>
          </v-card>
        </v-col>
      </v-row>
      
      <v-divider class="my-8"></v-divider>

      <v-row>
        <v-col cols="12">
          <div class="text-overline">Análisis Visual</div>
        </v-col>
        <v-col cols="12" md="8">
          <v-card flat variant="outlined">
            <v-card-title>Evolución de Ventas</v-card-title>
            <v-card-text>
              <ClientOnly>
                <apexchart
                  height="350"
                  type="bar"
                  :options="salesByMonthChart.chartOptions"
                  :series="salesByMonthChart.series"
                ></apexchart>
              </ClientOnly>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card flat variant="outlined">
            <v-card-title>Tipo de Registros</v-card-title>
             <v-card-text>
              <ClientOnly>
                <apexchart
                  height="350"
                  type="donut"
                  :options="recordTypeChart.chartOptions"
                  :series="recordTypeChart.series"
                ></apexchart>
              </ClientOnly>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-8"></v-divider>

      <v-row>
        <v-col cols="12">
          <div class="text-overline">Análisis Mensual Detallado</div>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedMonth"
            :items="availableMonths"
            label="Seleccionar Mes"
            variant="outlined"
            hide-details
            clearable
            placeholder="Ver todo el histórico"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
           <v-alert color="success" variant="outlined" border="start" prominent>
            <h3 class="mb-2">Ventas del Mes Seleccionado</h3>
            <div class="text-h4 font-weight-bold">{{ formatAsArs(statsForSelectedMonth.totalSales) }}</div>
            <div class="text-body-1 mt-1">({{ statsForSelectedMonth.salesCount }} operaciones)</div>
          </v-alert>
        </v-col>
         <v-col cols="12" md="6">
           <v-alert color="info" variant="outlined" border="start" prominent>
            <h3 class="mb-2">Cotizaciones del Mes Seleccionado</h3>
            <div class="text-h4 font-weight-bold">{{ formatAsArs(statsForSelectedMonth.totalQuotes) }}</div>
            <div class="text-body-1 mt-1">({{ statsForSelectedMonth.quotesCount }} operaciones)</div>
          </v-alert>
        </v-col>
      </v-row>

      <v-divider class="my-8"></v-divider>
      
      <v-row>
        <v-col cols="12" md="6">
           <div class="text-overline mb-2">Ranking de Productos (Histórico)</div>
          <v-card flat variant="outlined" height="100%">
            <v-card-title>Productos Más Populares</v-card-title>
            <v-card-subtitle>Basado en todas las ventas y cotizaciones.</v-card-subtitle>
            <v-card-text>
              <v-list lines="one">
                <v-list-item v-for="(product, index) in rankingDeProductos" :key="product.name">
                  <template v-slot:prepend>
                    <span class="font-weight-bold mr-4 text-h6 text-primary">#{{ index + 1 }}</span>
                  </template>
                  <v-list-item-title>{{ product.name }}</v-list-item-title>
                  <v-list-item-subtitle>Incluido en {{ product.count }} registros</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="rankingDeProductos.length === 0">
                  <v-list-item-title>No hay datos para generar un ranking.</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
           <div class="text-overline mb-2">Evaluación del Programa 4/14</div>
          <v-card flat variant="outlined" height="100%">
            <v-card-title>Estadísticas de Referidos</v-card-title>
            <v-card-subtitle>Total de Referidos Cargados: {{ referralStats.total }}</v-card-subtitle>
            <v-card-text>
              <div v-if="referralStats.total > 0">
                <div class="my-4" v-for="stat in referralStats.details" :key="stat.label">
                  <div class="d-flex justify-space-between mb-1 text-caption">
                    <span class="font-weight-bold">{{ stat.label }}</span>
                    <span>{{ stat.count }} / {{ referralStats.total }} ({{ stat.percentage }}%)</span>
                  </div>
                  <v-progress-linear :model-value="stat.percentage" :color="stat.color" height="10" rounded></v-progress-linear>
                </div>
              </div>
              <div v-else class="text-center text-grey pa-4">
                No hay datos de referidos para mostrar.
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useReferrals } from '~/composables/useReferrals';
import { useFormatters } from '~/composables/useFormatters';

const { getRecords, savedRecords, isLoading } = useSavedQuotes();
const { getReferrals, referrals, isLoading: isLoadingReferrals } = useReferrals();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle();

onMounted(async () => {
  setTitle('Mi Estadística');
  await getRecords();
  await getReferrals(); 
  if (availableMonths.value.length > 0) {
    selectedMonth.value = availableMonths.value[0].value;
  }
});

const selectedMonth = ref<string | null>(null);

const totalNumeroDeVentas = computed(() => savedRecords.value.filter(r => r.type === 'VENTA').length);
const totalNumeroDeCotizaciones = computed(() => savedRecords.value.filter(r => r.type === 'COTIZACIÓN').length);
const totalTasaDeConversion = computed(() => {
  const totalRegistros = totalNumeroDeVentas.value + totalNumeroDeCotizaciones.value;
  if (totalRegistros === 0) return 0;
  return Math.round((totalNumeroDeVentas.value / totalRegistros) * 100);
});

const salesByMonthChart = computed(() => {
  const sales = savedRecords.value.filter(r => r.type === 'VENTA');
  const monthlySales = new Map<string, number>();
  sales.forEach(sale => {
    const monthKey = sale.quoteDate.substring(0, 7);
    const currentSales = monthlySales.get(monthKey) || 0;
    monthlySales.set(monthKey, currentSales + sale.totalAmount);
  });
  const sortedMonths = Array.from(monthlySales.keys()).sort();
  return {
    series: [{
      name: 'Ventas',
      data: sortedMonths.map(month => Math.round(monthlySales.get(month) || 0))
    }],
    chartOptions: {
      chart: { type: 'bar', height: 350, toolbar: { show: true } },
      plotOptions: { bar: { borderRadius: 4, horizontal: false, dataLabels: { position: 'top' } } },
      xaxis: { categories: sortedMonths.map(monthStr => new Date(monthStr + '-02').toLocaleString('es-AR', { month: 'short', year: '2-digit' })) },
      yaxis: { title: { text: 'Monto en ARS' } },
      dataLabels: { enabled: true, formatter: val => formatAsArs(val), offsetY: -20, style: { fontSize: '12px', colors: ["#304758"] } },
      tooltip: { y: { formatter: val => formatAsArs(val) } }
    }
  };
});

const recordTypeChart = computed(() => ({
  series: [totalNumeroDeVentas.value, totalNumeroDeCotizaciones.value],
  chartOptions: {
    chart: { type: 'donut', height: 350 },
    labels: ['Ventas', 'Cotizaciones'],
    colors: ['#4CAF50', '#2196F3'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val, opts) => opts.w.globals.labels[opts.seriesIndex] + ": " + opts.w.globals.series[opts.seriesIndex] },
  }
}));

const availableMonths = computed(() => {
  const months = new Set<string>();
  savedRecords.value.forEach(record => { months.add(record.quoteDate.substring(0, 7)); });
  return Array.from(months).sort().reverse().map(monthStr => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    const label = date.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
    return { title: `${label.charAt(0).toUpperCase()}${label.slice(1)}`, value: monthStr };
  });
});

const statsForSelectedMonth = computed(() => {
  const recordsToAnalyze = selectedMonth.value ? savedRecords.value.filter(r => r.quoteDate.startsWith(selectedMonth.value!)) : savedRecords.value;
  const sales = recordsToAnalyze.filter(r => r.type === 'VENTA');
  const quotes = recordsToAnalyze.filter(r => r.type === 'COTIZACIÓN');
  return {
    salesCount: sales.length,
    totalSales: sales.reduce((sum, record) => sum + record.totalAmount, 0),
    quotesCount: quotes.length,
    totalQuotes: quotes.reduce((sum, record) => sum + record.totalAmount, 0),
  };
});

const rankingDeProductos = computed(() => {
  const productCounts = new Map<string, number>();
  for (const record of savedRecords.value) {
    for (const productName of record.products) {
      const currentCount = productCounts.get(productName) || 0;
      productCounts.set(productName, currentCount + 1);
    }
  }
  const sortedProducts = Array.from(productCounts.entries()).map(([name, count]) => ({ name, count }));
  sortedProducts.sort((a, b) => b.count - a.count);
  return sortedProducts.slice(0, 5);
});

const referralStats = computed(() => {
  const stats = { demo: 0, noAcepta: 0, noContesta: 0, pendiente: 0 };
  for (const referral of referrals.value) {
    switch (referral.status) {
      case 'Demo': stats.demo++; break;
      case 'No Acepta': stats.noAcepta++; break;
      case 'No Contesta': stats.noContesta++; break;
      case 'Pendiente': default: stats.pendiente++; break;
    }
  }
  const total = referrals.value.length;
  if(total === 0) return { total: 0, details: [] };
  
  return {
    total,
    details: [
      { label: 'Demos Realizadas', count: stats.demo, percentage: Math.round((stats.demo / total) * 100), color: 'success' },
      { label: 'Pendientes de Contacto', count: stats.pendiente, percentage: Math.round((stats.pendiente / total) * 100), color: 'info' },
      { label: 'No Contestaron', count: stats.noContesta, percentage: Math.round((stats.noContesta / total) * 100), color: 'warning' },
      { label: 'No Aceptaron', count: stats.noAcepta, percentage: Math.round((stats.noAcepta / total) * 100), color: 'error' },
    ]
  };
});
</script>
