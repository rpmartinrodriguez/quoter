<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-finance</v-icon>
      Simulador de Proyección de Ventas
    </v-card-title>
    
    <div v-if="isLoading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4 text-grey">Cargando datos históricos...</div>
    </div>

    <v-card-text v-else>
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="pa-4" variant="outlined" height="100%">
            <label class="text-overline">1. Objetivo de Crecimiento en Ventas</label>
            <v-slider v-model="growthPercentage" :step="5" thumb-label color="primary" class="mt-2">
              <template v-slot:append>
                <v-text-field v-model="growthPercentage" type="number" style="width: 80px" density="compact" hide-details variant="outlined"></v-text-field>
                <span class="ml-2">%</span>
              </template>
            </v-slider>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="pa-4" variant="outlined" height="100%">
            <label class="text-overline">2. Simular Mejora en Tasa de Conversión</label>
            <v-slider v-model="targetConversionRate" :step="1" thumb-label color="secondary" class="mt-2">
              <template v-slot:append>
                <v-text-field v-model="targetConversionRate" type="number" style="width: 80px" density="compact" hide-details variant="outlined"></v-text-field>
                <span class="ml-2">%</span>
              </template>
            </v-slider>
            <div class="text-caption text-center text-grey">Tu tasa histórica es: {{ totalTasaDeConversion }}%</div>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>
      
      <v-row>
        <v-col cols="12" md="4">
          <div class="text-center">
            <div class="text-h6">Mes Actual ({{ currentMonthName }})</div>
            <v-card class="mt-4 pa-5 elevation-4">
              <div class="text-overline">Ventas Realizadas</div>
              <div class="text-h4 font-weight-bold text-success">{{ formatAsArs(currentMonthStats.totalSales) }}</div>
              <div class="text-caption mb-3">en {{ currentMonthStats.salesCount }} operaciones</div>
              <v-divider></v-divider>
              <div class="text-overline mt-3">Ticket Promedio</div>
              <div class="text-h5 font-weight-bold">{{ formatAsArs(averageTicket) }}</div>
            </v-card>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="text-center">
            <div class="text-h6">Objetivo Próximo Mes ({{ nextMonthName }})</div>
            <v-card class="mt-4 pa-5 elevation-4" color="primary">
              <div class="text-overline">Objetivo de Ventas</div>
              <div class="text-h4 font-weight-bold">{{ formatAsArs(projection.projectedSalesAmount) }}</div>
              <div class="text-caption mb-3">Crecimiento del {{ growthPercentage }}%</div>
              <v-divider></v-divider>
              <div class="text-overline mt-3">Ticket Promedio Estimado</div>
              <div class="text-h5 font-weight-bold">{{ formatAsArs(averageTicket) }}</div>
            </v-card>
          </div>
        </v-col>
        <v-col cols="12" md="4">
           <div class="text-center">
            <div class="text-h6">Esfuerzo Estimado</div>
            <v-card class="mt-4 pa-5 elevation-4">
              <div class="text-overline">Ventas a cerrar por Semana</div>
              <div class="text-h5 font-weight-bold text-info">{{ actionableGoals.weeklySalesTarget }}</div>
              <div class="text-caption mb-2"> ({{ projection.projectedSalesCount }} total mensual)</div>
              <v-divider></v-divider>
              <div class="text-overline mt-3">Cotizaciones a realizar por Día</div>
              <div class="text-h5 font-weight-bold text-info">{{ actionableGoals.dailyQuotesTarget }}</div>
              <div class="text-caption">(proyectado con una tasa de conversión del {{ targetConversionRate }}%)</div>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col>
          <v-card flat variant="outlined">
            <v-card-title>Foco de Productos Sugerido</v-card-title>
            <v-card-subtitle>Para alcanzar tu objetivo de {{ projection.projectedSalesCount }} ventas el próximo mes.</v-card-subtitle>
            <v-card-text>
              <v-list lines="one">
                <v-list-item v-for="product in projectedProductFocus" :key="product.name" :title="product.name">
                  <template v-slot:prepend>
                    <v-avatar color="primary">
                      <span class="text-white font-weight-bold">+{{ product.projectedAdditional }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-subtitle>
                    Ventas adicionales sugeridas (vendiste {{ product.currentCount }} este mes)
                  </v-list-item-subtitle>
                </v-list-item>
                 <v-list-item v-if="projectedProductFocus.length === 0">
                  <v-list-item-title>No hay ventas registradas este mes para generar una proyección de productos.</v-list-item-title>
                </v-list-item>
              </v-list>
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
import { useFormatters } from '~/composables/useFormatters';

const { getRecords, savedRecords, isLoading } = useSavedQuotes();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle();

const growthPercentage = ref(10);
const targetConversionRate = ref(0);
const now = new Date();
const currentMonthStr = now.toISOString().substring(0, 7);
const currentMonthName = now.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });
const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const nextMonthName = nextMonthDate.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });
const totalTasaDeConversion = computed(() => {
  const ventas = savedRecords.value.filter(r => r.type === 'VENTA').length;
  const cotizaciones = savedRecords.value.filter(r => r.type === 'COTIZACIÓN').length;
  const total = ventas + cotizaciones;
  if (total === 0) return 0;
  return Math.round((ventas / total) * 100);
});
const currentMonthStats = computed(() => {
  const recordsOfThisMonth = savedRecords.value.filter(r => r.quoteDate.startsWith(currentMonthStr));
  const sales = recordsOfThisMonth.filter(r => r.type === 'VENTA');
  return {
    salesCount: sales.length,
    totalSales: sales.reduce((sum, record) => sum + record.totalAmount, 0),
    salesRecords: sales,
  };
});
const averageTicket = computed(() => {
  const salesCount = currentMonthStats.value.salesCount;
  if (salesCount === 0) return 0;
  return currentMonthStats.value.totalSales / salesCount;
});
const projection = computed(() => {
  const growthFactor = 1 + (growthPercentage.value / 100);
  const projectedSalesCount = Math.ceil(currentMonthStats.value.salesCount * growthFactor);
  const additionalSalesNeeded = Math.max(0, projectedSalesCount - currentMonthStats.value.salesCount);
  const projectedSalesAmount = currentMonthStats.value.totalSales > 0 ? currentMonthStats.value.totalSales * growthFactor : 0;
  const conversionRate = targetConversionRate.value / 100;
  const projectedQuotesNeeded = conversionRate > 0 ? Math.ceil(projectedSalesCount / conversionRate) : projectedSalesCount;
  return { projectedSalesAmount, projectedSalesCount, projectedQuotesNeeded, additionalSalesNeeded };
});
const actionableGoals = computed(() => {
  const WEEKS_IN_MONTH = 4.33;
  const WORK_DAYS_IN_MONTH = 22;
  const weeklySalesTarget = Math.ceil(projection.value.projectedSalesCount / WEEKS_IN_MONTH);
  const dailyQuotesTarget = Math.ceil(projection.value.projectedQuotesNeeded / WORK_DAYS_IN_MONTH);
  return { weeklySalesTarget, dailyQuotesTarget };
});
const projectedProductFocus = computed(() => {
  const currentSalesCount = currentMonthStats.value.salesCount;
  if (currentSalesCount === 0) return [];
  const productCounts = new Map<string, number>();
  for (const record of currentMonthStats.value.salesRecords) {
    for (const productName of record.products) {
      const currentCount = productCounts.get(productName) || 0;
      productCounts.set(productName, currentCount + 1);
    }
  }
  const productContributions = Array.from(productCounts.entries()).map(([name, count]) => ({ name, currentCount: count, contribution: count / currentSalesCount }));
  const productFocus = productContributions.map(product => ({ ...product, projectedAdditional: Math.round(projection.value.additionalSalesNeeded * product.contribution) }));
  productFocus.sort((a, b) => b.projectedAdditional - a.projectedAdditional || b.currentCount - a.currentCount);
  return productFocus;
});
onMounted(async () => {
  setTitle('Proyección de Ventas');
  await getRecords();
  targetConversionRate.value = totalTasaDeConversion.value;
});
</script>
