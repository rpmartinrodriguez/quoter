<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-finance</v-icon>
      Simulador de Proyección de Ventas
    </v-card-title>
    
    <div v-if="isLoadingSales || isLoadingReferrals" class="text-center pa-8">
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
            <label class="text-overline">2. Simular Mejora en Tasa de Cierre</label>
            <v-slider v-model="targetConversionRate" :step="1" thumb-label color="secondary" class="mt-2" :max="100">
              <template v-slot:append>
                <v-text-field v-model="targetConversionRate" type="number" style="width: 80px" density="compact" hide-details variant="outlined"></v-text-field>
                <span class="ml-2">%</span>
              </template>
            </v-slider>
            <div class="text-caption text-center text-grey">Tu tasa de cierre por demo histórica es: {{ demoToSaleRate }}%</div>
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
            <div class="text-h6">Tu Plan de Acción</div>
            <v-card class="mt-4 pa-5 elevation-4">
              <div class="text-overline">OBJETIVO FINAL</div>
              <div class="text-h4 font-weight-bold text-success">{{ projection.projectedSalesCount }} VENTAS</div>
              <div class="text-center my-2"><v-icon color="grey">mdi-chevron-down</v-icon></div>
              <div class="text-overline">DEMOS A REALIZAR</div>
              <div class="text-h5 font-weight-bold text-info">{{ projection.projectedDemosNeeded }}</div>
              <div class="text-caption">(usando tu tasa objetivo del {{ targetConversionRate }}%)</div>
              <div class="text-center my-2"><v-icon color="grey">mdi-chevron-down</v-icon></div>
              <div class="text-overline">REFERIDOS A CONTACTAR</div>
              <div class="text-h5 font-weight-bold text-warning">{{ projection.projectedReferralsToContact }}</div>
              <div class="text-caption">(basado en tu tasa de demo del {{ leadToDemoRate }}%)</div>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col>
          <v-card flat variant="outlined">
            <v-card-title>Proyección de Foco de Productos</v-card-title>
            <v-card-subtitle>{{ projectedProductFocus.subtitle }}</v-card-subtitle>
            <v-card-text>
              <v-list lines="two">
                <v-list-item v-for="product in projectedProductFocus.products" :key="product.name" :title="product.name">
                  <template v-slot:prepend>
                    <v-avatar color="primary"><span class="text-white font-weight-bold" title="Unidades adicionales a vender">+{{ product.projectedAdditionalUnits }}</span></v-avatar>
                  </template>
                  <v-list-item-subtitle>
                    Objetivo: Vender **{{ product.projectedAdditionalUnits }} unidades más** para generar <span class="font-weight-bold">{{ formatAsArs(product.projectedAdditionalAmount) }}</span> adicionales.
                    <div class="text-caption mt-1">(Actualmente representa el {{ product.contributionPercentage }}% de tu facturación)</div>
                  </v-list-item-subtitle>
                </v-list-item>
                 <v-list-item v-if="projectedProductFocus.products.length === 0">
                  <v-list-item-title>No hay ventas registradas para generar una proyección de productos.</v-list-item-title>
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
import { useReferrals } from '~/composables/useReferrals';
import { useProducts } from '~/composables/useProducts';

const { getRecords, savedRecords, isLoading: isLoadingSales } = useSavedQuotes();
const { getReferrals, referrals, isLoading: isLoadingReferrals } = useReferrals();
const { list: productList } = useProducts();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle();

const growthPercentage = ref(10);
const targetConversionRate = ref(0);
const now = new Date();
const currentMonthStr = now.toISOString().substring(0, 7);
const currentMonthName = now.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });
const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const nextMonthName = nextMonthDate.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });

const currentMonthStats = computed(() => {
  const recordsOfThisMonth = savedRecords.value.filter(r => r.quoteDate.startsWith(currentMonthStr));
  const sales = recordsOfThisMonth.filter(r => r.type === 'VENTA');
  return {
    salesCount: sales.length,
    totalSales: sales.reduce((sum, r) => sum + r.totalAmount, 0),
    salesRecords: sales,
  };
});

const averageTicket = computed(() => {
  const salesCount = currentMonthStats.value.salesCount;
  if (salesCount === 0) return 0;
  return currentMonthStats.value.totalSales / salesCount;
});

const demoToSaleRate = computed(() => {
  const demoReferrals = referrals.value.filter(r => r.status === 'Demo');
  const totalDemos = demoReferrals.length;
  if (totalDemos === 0) return 0;
  const clientsWhoBought = new Set(savedRecords.value.filter(r => r.type === 'VENTA').map(r => r.clientName.toLowerCase().trim()));
  const successfulDemos = demoReferrals.filter(r => clientsWhoBought.has(r.referralName.toLowerCase().trim())).length;
  return Math.round((successfulDemos / totalDemos) * 100);
});

const leadToDemoRate = computed(() => {
  const totalDemos = referrals.value.filter(r => r.status === 'Demo').length;
  const contactedReferrals = referrals.value.filter(r => r.status !== 'Pendiente').length;
  if (contactedReferrals === 0) return 0;
  return Math.round((totalDemos / contactedReferrals) * 100);
});

const projection = computed(() => {
  const growthFactor = 1 + (growthPercentage.value / 100);
  const projectedSalesCount = Math.ceil(currentMonthStats.value.salesCount * growthFactor);
  const demoRate = (targetConversionRate.value > 0 ? targetConversionRate.value : demoToSaleRate.value) / 100;
  const projectedDemosNeeded = demoRate > 0 ? Math.ceil(projectedSalesCount / demoRate) : projectedSalesCount;
  const leadRate = leadToDemoRate.value / 100;
  const projectedReferralsToContact = leadRate > 0 ? Math.ceil(projectedDemosNeeded / leadRate) : 0;
  return {
    projectedSalesAmount: currentMonthStats.value.totalSales > 0 ? currentMonthStats.value.totalSales * growthFactor : 0,
    projectedSalesCount,
    additionalSalesNeeded: Math.max(0, projectedSalesCount - currentMonthStats.value.salesCount),
    projectedDemosNeeded,
    projectedReferralsToContact,
  };
});

const actionableGoals = computed(() => {
  const WEEKS_IN_MONTH = 4.33;
  const WORK_DAYS_IN_MONTH = 22;
  const weeklySalesTarget = Math.ceil(projection.value.projectedSalesCount / WEEKS_IN_MONTH);
  const dailyQuotesTarget = Math.ceil(projection.value.projectedReferralsToContact / WORK_DAYS_IN_MONTH);
  return { weeklySalesTarget, dailyQuotesTarget };
});

const projectedProductFocus = computed(() => {
  let salesRecordsForRanking = currentMonthStats.value.salesRecords;
  let subtitle = "Para alcanzar tu objetivo, basado en la facturación de este mes.";
  if (salesRecordsForRanking.length === 0) {
    salesRecordsForRanking = savedRecords.value.filter(r => r.type === 'VENTA');
    subtitle = "No hay ventas este mes. Sugerencia basada en tu historial completo.";
  }
  const baseTotalSales = salesRecordsForRanking.reduce((sum, r) => sum + r.totalAmount, 0);
  if (baseTotalSales === 0) {
    return { subtitle: "Para alcanzar tu objetivo...", products: [] };
  }
  const productValueMap = new Map<string, number>();
  for (const record of salesRecordsForRanking) {
    for (const productName of record.products) {
      const productInfo = productList.value.find(p => p.detail === productName);
      if (productInfo) {
        const currentValue = productValueMap.get(productName) || 0;
        productValueMap.set(productName, currentValue + productInfo.price);
      }
    }
  }
  const productContributions = Array.from(productValueMap.entries()).map(([name, totalValue]) => ({
    name,
    totalValue,
    contributionPercentage: Math.round((totalValue / baseTotalSales) * 100),
  }));
  const additionalSalesAmountNeeded = projection.value.projectedSalesAmount - currentMonthStats.value.totalSales;
  const productFocus = productContributions.map(product => {
    const productInfo = productList.value.find(p => p.detail === product.name);
    const productPrice = productInfo ? productInfo.price : 0;
    const projectedAdditionalAmount = additionalSalesAmountNeeded * (product.contributionPercentage / 100);
    const projectedAdditionalUnits = productPrice > 0 ? Math.ceil(projectedAdditionalAmount / productPrice) : 0;
    return { name: product.name, contributionPercentage: product.contributionPercentage, projectedAdditionalAmount, projectedAdditionalUnits, currentCount: Math.round(product.totalValue / (productPrice || 1)) };
  });
  productFocus.sort((a, b) => b.projectedAdditionalAmount - a.projectedAdditionalAmount);
  return { subtitle, products: productFocus.slice(0, 5) };
});

onMounted(async () => {
  setTitle('Proyección de Ventas');
  await Promise.all([getRecords(), getReferrals(), useProducts().getProducts()]);
  targetConversionRate.value = demoToSaleRate.value;
});
</script>
