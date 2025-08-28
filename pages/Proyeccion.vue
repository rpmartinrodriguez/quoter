<template>
  <div>
    <v-card class="mb-8">
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-rocket-launch-outline</v-icon>
        Tu Plan de Acción
      </v-card-title>
      <v-card-text>
        <div v-if="isLoadingSales || isLoadingReferrals" class="text-center pa-4">
          <v-progress-circular indeterminate></v-progress-circular>
        </div>
        <v-row v-else>
          <v-col cols="12" md="4">
            <v-card class="pa-4 text-center fill-height" variant="tonal" color="warning">
              <div class="text-overline">REFERIDOS A CONTACTAR</div>
              <p class="text-h3 font-weight-bold">{{ projection.projectedReferralsToContact }}</p>
              <div class="text-caption">(basado en tu tasa de demo del {{ leadToDemoRate }}%)</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="pa-4 text-center fill-height" variant="tonal" color="info">
              <div class="text-overline">DEMOS A REALIZAR</div>
              <p class="text-h3 font-weight-bold">{{ projection.projectedDemosNeeded }}</p>
              <div class="text-caption">(usando tasa del {{ targetConversionRate }}%)</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="pa-4 text-center fill-height" variant="tonal" color="success">
              <div class="text-overline">OBJETIVO FINAL DE VENTAS</div>
              <p class="text-h3 font-weight-bold">{{ projection.projectedSalesCount }}</p>
              <div class="text-caption" v-if="salesGoalFromOKR">Basado en tu OKR</div>
              <div class="text-caption" v-else>Crecimiento del {{ growthPercentage }}%</div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <v-card class="mb-8">
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-target-account</v-icon>
        Mis Objetivos (OKRs)
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="openGoalDialog()">
          {{ activeGoal ? 'Editar Objetivo Actual' : 'Definir Nuevo Objetivo' }}
        </v-btn>
      </v-card-title>
      <div v-if="isLoadingGoals" class="text-center pa-4"><v-progress-circular indeterminate></v-progress-circular></div>
      <v-card-text v-else-if="activeGoal">
        <h3 class="text-h6 font-weight-regular mb-1"><span class="font-weight-bold">Objetivo:</span> {{ activeGoal.objective }}</h3>
        <p class="text-caption text-grey">Período: {{ new Date(activeGoal.startDate).toLocaleDateString('es-AR') }} - {{ new Date(activeGoal.endDate).toLocaleDateString('es-AR') }}</p>
        <v-list class="mt-4 bg-transparent">
          <v-list-subheader>Resultados Clave</v-list-subheader>
          <v-list-item v-for="(kr, i) in activeGoal.keyResults" :key="i" class="px-0">
            <v-list-item-title class="font-weight-medium">{{ kr.name }}</v-list-item-title>
            <v-list-item-subtitle class="d-flex align-center">
              <v-progress-linear :model-value="progress[kr.metric]" color="success" height="10" rounded class="flex-grow-1"></v-progress-linear>
              <span class="ml-4 font-weight-bold">{{ getCurrentValueForKR(kr.metric) }} / {{ kr.target }}</span>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-text v-else class="text-center text-grey py-8">
        <v-icon size="48">mdi-flag-plus-outline</v-icon>
        <p class="mt-4">No has definido un objetivo para el período actual. ¡Establecé uno para empezar!</p>
      </v-card-text>
    </v-card>

    <v-card flat>
      <v-card-title>Simulador y Contexto</v-card-title>
      <v-card-text>
        <v-row>
            <v-col cols="12" md="6">
              <v-card class="pa-4" variant="outlined" height="100%">
                <label class="text-overline">Simular Crecimiento (si no hay objetivo)</label>
                <v-slider v-model="growthPercentage" :step="5" thumb-label color="primary" class="mt-2" :disabled="!!salesGoalFromOKR"></v-slider>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="pa-4" variant="outlined" height="100%">
                <label class="text-overline">Simular Mejora en Tasa de Cierre</label>
                <v-slider v-model="targetConversionRate" :step="1" thumb-label color="secondary" class="mt-2" :max="100"></v-slider>
                <div class="text-caption text-center text-grey">Tu tasa de cierre por demo histórica es: {{ demoToSaleRate }}%</div>
              </v-card>
            </v-col>
        </v-row>
        <v-divider class="my-6"></v-divider>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-center">
              <div class="text-h6">Mes Actual ({{ currentMonthName }})</div>
              <v-card class="mt-4 pa-5 elevation-2">
                <div class="text-overline">Ventas Realizadas</div>
                <div class="text-h4 font-weight-bold text-success">{{ formatAsArs(currentMonthStats.totalSales) }}</div>
                <div class="text-caption mb-3">en {{ currentMonthStats.salesCount }} operaciones</div>
              </v-card>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <v-card flat variant="outlined" class="mt-10">
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
                    <v-list-item-title>No hay ventas registradas en el período base para generar una proyección.</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <v-dialog v-model="dialog.show" persistent max-width="700px">
      <v-card>
        <v-card-title>{{ isEditingGoal ? 'Editar' : 'Definir' }} Objetivo</v-card-title>
        <v-card-text>
          <v-text-field v-model="dialog.data.objective" label="Mi Objetivo Principal es..." hint="Ej: Convertirme en el mejor vendedor del trimestre"></v-text-field>
          <v-select v-model="dialog.data.timeframe" :items="['Mensual', 'Trimestral', 'Anual']" label="Período del Objetivo" class="mt-4"></v-select>
          <v-divider class="my-4"></v-divider>
          <v-list-subheader>Resultados Clave (Metas Medibles)</v-list-subheader>
          <div v-for="(kr, index) in dialog.data.keyResults" :key="index" class="d-flex align-center ga-2 mb-2">
            <v-text-field v-model="kr.name" label="Nombre de la Métrica" density="compact" hide-details></v-text-field>
            <v-select v-model="kr.metric" :items="metricOptions" item-title="title" item-value="value" label="Tipo de Métrica" density="compact" hide-details style="max-width: 220px;"></v-select>
            <v-text-field v-model.number="kr.target" label="Objetivo Numérico" type="number" density="compact" hide-details style="max-width: 150px;"></v-text-field>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeKeyResult(index)"></v-btn>
          </div>
          <v-btn text prepend-icon="mdi-plus" @click="addKeyResult" class="mt-2">Añadir Resultado Clave</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog.show = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveGoal">Guardar Objetivo</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useReferrals } from '~/composables/useReferrals';
import { useFormatters } from '~/composables/useFormatters';
import { useGoals, type IGoal, type IKeyResult } from '~/composables/useGoals';
import { useSnackbar } from '~/composables/useSnackbar';
import { useProducts } from '~/composables/useProducts';

// --- COMPOSABLES ---
const { getRecords, savedRecords, isLoading: isLoadingSales } = useSavedQuotes();
const { getReferrals, referrals, isLoading: isLoadingReferrals } = useReferrals();
const { goals, isLoading: isLoadingGoals, addGoal, getGoals, updateGoal } = useGoals();
const { list: productList, getProducts, isLoading: isLoadingProducts } = useProducts();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle();
const { showSnackbar } = useSnackbar();

// --- ESTADO LOCAL ---
const growthPercentage = ref(10);
const targetConversionRate = ref(0);
const dialog = reactive({ show: false, data: { keyResults: [] } as Partial<IGoal> & { keyResults: IKeyResult[] } });
const isEditingGoal = computed(() => !!dialog.data.$id);
const metricOptions = [
  { title: 'N° de Ventas', value: 'salesCount' },
  { title: 'N° de Demos', value: 'demoCount' },
  { title: 'N° de Seguimientos Completados', value: 'followUpCompletedCount' },
];

// --- LÓGICA DE FECHAS ---
const now = new Date();
const currentMonthName = now.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
const currentMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 7);

// --- LÓGICA DE OBJETIVOS (OKRs) ---
const activeGoal = computed(() => {
  const now = new Date();
  return goals.value.find(g => new Date(g.startDate) <= now && new Date(g.endDate) >= now);
});
const getCurrentValueForKR = (metric: IKeyResult['metric']) => {
  if (!activeGoal.value) return 0;
  const startDate = new Date(activeGoal.value.startDate);
  switch (metric) {
    case 'salesCount': return savedRecords.value.filter(r => r.type === 'VENTA' && new Date(r.quoteDate) >= startDate).length;
    case 'demoCount': return referrals.value.filter(r => r.status === 'Demo' && new Date(r.loadDate) >= startDate).length;
    case 'followUpCompletedCount': return referrals.value.filter(r => r.followUpCompleted === true && r.nextFollowUp && new Date(r.nextFollowUp) >= startDate).length;
    default: return 0;
  }
};
const progress = computed(() => {
  if (!activeGoal.value) return {};
  const progressMap: Record<string, number> = {};
  for (const kr of activeGoal.value.keyResults) {
    const currentValue = getCurrentValueForKR(kr.metric);
    progressMap[kr.metric] = kr.target > 0 ? (currentValue / kr.target) * 100 : 0;
  }
  return progressMap;
});
const openGoalDialog = () => {
  dialog.data = activeGoal.value ? JSON.parse(JSON.stringify(activeGoal.value)) : {
    objective: '', timeframe: 'Trimestral', keyResults: [{ name: 'Cerrar Ventas', metric: 'salesCount', target: 10 }]
  };
  dialog.show = true;
};
const addKeyResult = () => { if(dialog.data.keyResults) dialog.data.keyResults.push({ name: '', metric: 'salesCount', target: 0 }); };
const removeKeyResult = (index: number) => { if(dialog.data.keyResults) dialog.data.keyResults.splice(index, 1); };
const saveGoal = async () => {
  let startDate, endDate;
  const now = new Date();
  if (dialog.data.timeframe === 'Mensual') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (dialog.data.timeframe === 'Trimestral') {
    const quarter = Math.floor(now.getMonth() / 3);
    startDate = new Date(now.getFullYear(), quarter * 3, 1);
    endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
  } else { // Anual
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  }
  dialog.data.startDate = startDate.toISOString();
  dialog.data.endDate = endDate.toISOString();
  try {
    if (isEditingGoal.value) {
      await updateGoal(dialog.data.$id!, dialog.data);
      showSnackbar({ text: 'Objetivo actualizado.' });
    } else {
      await addGoal(dialog.data as Omit<IGoal, '$id' | 'userId'>);
      showSnackbar({ text: 'Objetivo guardado.' });
    }
  } catch (e) { showSnackbar({ text: 'Error al guardar.', color: 'error' }); } 
  finally { dialog.show = false; }
};

// --- LÓGICA DE ESTADÍSTICAS Y PROYECCIÓN ---
const currentMonthStats = computed(() => {
  const recordsOfThisMonth = savedRecords.value.filter(r => r.quoteDate.startsWith(currentMonthStr));
  const sales = recordsOfThisMonth.filter(r => r.type === 'VENTA');
  return { salesCount: sales.length, totalSales: sales.reduce((sum, r) => sum + r.totalAmount, 0), salesRecords: sales };
});
const averageTicket = computed(() => {
  const allSales = savedRecords.value.filter(r => r.type === 'VENTA');
  if (allSales.length === 0) return 0;
  return allSales.reduce((sum, r) => sum + r.totalAmount, 0) / allSales.length;
});
const demoToSaleRate = computed(() => {
  const demoReferrals = referrals.value.filter(r => r.status === 'Demo');
  if (demoReferrals.length === 0) return 0;
  const clientsWhoBought = new Set(savedRecords.value.filter(r => r.type === 'VENTA').map(r => r.clientName.toLowerCase().trim()));
  const successfulDemos = demoReferrals.filter(r => clientsWhoBought.has(r.referralName.toLowerCase().trim())).length;
  return Math.round((successfulDemos / demoReferrals.length) * 100);
});
const leadToDemoRate = computed(() => {
  const totalDemos = referrals.value.filter(r => r.status === 'Demo').length;
  const contactedReferrals = referrals.value.filter(r => r.status !== 'Pendiente').length;
  if (contactedReferrals === 0) return 0;
  return Math.round((totalDemos / contactedReferrals) * 100);
});
const salesGoalFromOKR = computed(() => activeGoal.value?.keyResults.find(kr => kr.metric === 'salesCount'));

const projection = computed(() => {
  let projectedSalesCount: number;
  if (salesGoalFromOKR.value) {
    projectedSalesCount = salesGoalFromOKR.value.target;
  } else {
    projectedSalesCount = Math.ceil(currentMonthStats.value.salesCount * (1 + (growthPercentage.value / 100)));
  }
  const conversionRateToUse = (targetConversionRate.value > 0 ? targetConversionRate.value : demoToSaleRate.value) / 100;
  const projectedDemosNeeded = conversionRateToUse > 0 ? Math.ceil(projectedSalesCount / conversionRateToUse) : 0;
  const leadRate = leadToDemoRate.value / 100;
  const projectedReferralsToContact = leadRate > 0 ? Math.ceil(projectedDemosNeeded / leadRate) : 0;
  return {
    projectedSalesAmount: projectedSalesCount * averageTicket.value,
    projectedSalesCount,
    projectedDemosNeeded,
    projectedReferralsToContact,
  };
});
const projectedProductFocus = computed(() => {
  let salesRecordsForRanking = currentMonthStats.value.salesRecords;
  let subtitle = "Para alcanzar tu objetivo, basado en la facturación de este mes.";
  if (salesRecordsForRanking.length === 0) {
    salesRecordsForRanking = savedRecords.value.filter(r => r.type === 'VENTA');
    subtitle = "No hay ventas este mes. Sugerencia basada en tu historial completo.";
  }
  const baseTotalSales = salesRecordsForRanking.reduce((sum, r) => sum + r.totalAmount, 0);
  if (baseTotalSales === 0) return { subtitle: "No hay ventas en el período base para proyectar.", products: [] };
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
  const totalProductValueInSales = Array.from(productValueMap.values()).reduce((a, b) => a + b, 0);
  if(totalProductValueInSales === 0) return { subtitle: "No se pudo calcular el valor de los productos vendidos.", products: [] };
  const productContributions = Array.from(productValueMap.entries()).map(([name, totalValue]) => ({ name, totalValue, contributionPercentage: Math.round((totalValue / totalProductValueInSales) * 100) }));
  const projectedSalesAmount = projection.value.projectedSalesAmount;
  const additionalSalesAmountNeeded = projectedSalesAmount > currentMonthStats.value.totalSales ? projectedSalesAmount - currentMonthStats.value.totalSales : 0;
  const productFocus = productContributions.map(product => {
    const productInfo = productList.value.find(p => p.detail === product.name);
    const productPrice = productInfo ? productInfo.price : 1;
    const projectedAdditionalAmount = additionalSalesAmountNeeded * (product.contributionPercentage / 100);
    const projectedAdditionalUnits = productPrice > 0 ? Math.ceil(projectedAdditionalAmount / productPrice) : 0;
    return { name: product.name, contributionPercentage: product.contributionPercentage, projectedAdditionalAmount, projectedAdditionalUnits, currentCount: Math.round(product.totalValue / (productPrice || 1)) };
  });
  productFocus.sort((a, b) => b.projectedAdditionalAmount - a.projectedAdditionalAmount);
  return { subtitle, products: productFocus.filter(p => p.projectedAdditionalUnits > 0).slice(0, 5) };
});

onMounted(async () => {
  setTitle('Objetivos y Proyección');
  await Promise.all([getRecords(), getReferrals(), getGoals(), getProducts()]);
  targetConversionRate.value = demoToSaleRate.value;
});
</script>
