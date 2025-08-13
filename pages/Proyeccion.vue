<template>
  <div>
    <v-card class="mb-8">
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-target-account</v-icon>
        Mis Objetivos (OKRs)
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="openGoalDialog()">
          {{ activeGoal ? 'Editar Objetivo Actual' : 'Definir Nuevo Objetivo' }}
        </v-btn>
      </v-card-title>

      <div v-if="isLoadingGoals" class="text-center pa-4">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
      
      <v-card-text v-else-if="activeGoal">
        <h3 class="text-h6 font-weight-regular mb-1">
          <span class="font-weight-bold">Objetivo:</span> {{ activeGoal.objective }}
        </h3>
        <p class="text-caption text-grey">
          Período: {{ new Date(activeGoal.startDate).toLocaleDateString('es-AR') }} - {{ new Date(activeGoal.endDate).toLocaleDateString('es-AR') }}
        </p>
        
        <v-list class="mt-4 bg-transparent">
          <v-list-subheader>Resultados Clave</v-list-subheader>
          <v-list-item v-for="(kr, i) in activeGoal.keyResults" :key="i" class="px-0">
            <v-list-item-title class="font-weight-medium">{{ kr.name }}</v-list-item-title>
            <v-list-item-subtitle class="d-flex align-center">
              <v-progress-linear
                :model-value="progress[kr.metric]"
                color="success"
                height="10"
                rounded
                class="flex-grow-1"
              ></v-progress-linear>
              <span class="ml-4 font-weight-bold">{{ getCurrentValueForKR(kr.metric) }} / {{ kr.target }}</span>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
      
      <v-card-text v-else class="text-center text-grey py-8">
        <v-icon size="48">mdi-flag-plus-outline</v-icon>
        <p class="mt-4">No has definido un objetivo para el período actual. ¡Establecé uno para empezar a medir tu progreso!</p>
      </v-card-text>
    </v-card>
    <v-card flat>
      <v-card-title class="d-flex align-center mb-4">
        <v-icon start>mdi-finance</v-icon>
        Simulador de Proyección y Plan de Acción
      </v-card-title>
      
      <div v-if="isLoadingSales || isLoadingReferrals" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
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
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog.show" persistent max-width="700px">
      <v-card>
        <v-card-title>Definir Objetivo</v-card-title>
        <v-card-text>
          <v-text-field v-model="dialog.data.objective" label="Mi Objetivo Principal es..." hint="Ej: Convertirme en el mejor vendedor del trimestre"></v-text-field>
          <v-select v-model="dialog.data.timeframe" :items="['Mensual', 'Trimestral', 'Anual']" label="Período del Objetivo" class="mt-4"></v-select>
          <v-divider class="my-4"></v-divider>
          <v-list-subheader>Resultados Clave (Metas Medibles)</v-list-subheader>
          <div v-for="(kr, index) in dialog.data.keyResults" :key="index" class="d-flex align-center ga-2 mb-2">
            <v-text-field v-model="kr.name" label="Nombre de la Métrica" density="compact" hide-details></v-text-field>
            <v-select v-model="kr.metric" :items="metricOptions" label="Tipo de Métrica" density="compact" hide-details style="max-width: 220px;"></v-select>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useReferrals, type IReferral } from '~/composables/useReferrals';
import { useFormatters } from '~/composables/useFormatters';
import { useGoals, type IGoal, type IKeyResult } from '~/composables/useGoals';
import { useSnackbar } from '~/composables/useSnackbar';
import { useProducts } from '~/composables/useProducts';

// --- COMPOSABLES ---
const { getRecords, savedRecords, isLoading: isLoadingSales } = useSavedQuotes();
const { getReferrals, referrals, isLoading: isLoadingReferrals } = useReferrals();
const { goals, isLoading: isLoadingGoals, addGoal, getGoals } = useGoals();
const { list: productList, getProducts, isLoading: isLoadingProducts } = useProducts();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle();
const { showSnackbar } = useSnackbar();

// --- ESTADO LOCAL ---
const growthPercentage = ref(10);
const targetConversionRate = ref(0);
const dialog = reactive({ show: false, data: {} as Partial<IGoal> & { keyResults: IKeyResult[] } });
const metricOptions = [
  { title: 'N° de Ventas', value: 'salesCount' },
  { title: 'N° de Demos', value: 'demoCount' },
  { title: 'N° de Seguimientos Completados', value: 'followUpCompletedCount' },
];

// --- LÓGICA DE FECHAS ---
const now = new Date();
const currentMonthStr = now.toISOString().substring(0, 7);
const currentMonthName = now.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });
const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const nextMonthName = nextMonthDate.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });

// --- LÓGICA DE OBJETIVOS (OKRs) ---
const activeGoal = computed(() => {
  const now = new Date();
  return goals.value.find(g => new Date(g.startDate) <= now && new Date(g.endDate) >= now);
});

const getCurrentValueForKR = (metric: IKeyResult['metric']) => {
  if (!activeGoal.value) return 0;
  const startDate = new Date(activeGoal.value.startDate);
  switch (metric) {
    case 'salesCount':
      return savedRecords.value.filter(r => r.type === 'VENTA' && new Date(r.quoteDate) >= startDate).length;
    case 'demoCount':
      return referrals.value.filter(r => r.status === 'Demo' && new Date(r.loadDate) >= startDate).length;
    case 'followUpCompletedCount':
      return referrals.value.filter(r => r.followUpCompleted === true && r.nextFollowUp && new Date(r.nextFollowUp) >= startDate).length;
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
    objective: '',
    timeframe: 'Trimestral',
    keyResults: [{ name: 'Cerrar Ventas', metric: 'salesCount', target: 10 }]
  };
  dialog.show = true;
};

const addKeyResult = () => { dialog.data.keyResults.push({ name: '', metric: 'salesCount', target: 0 }); };
const removeKeyResult = (index: number) => { dialog.data.keyResults.splice(index, 1); };

const saveGoal = async () => {
  const now = new Date();
  let startDate, endDate;
  if(dialog.data.timeframe === 'Mensual') {
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
    // Aquí iría la lógica para editar (updateGoal) si ya existe un objetivo
    await addGoal(dialog.data as Omit<IGoal, '$id' | 'userId'>);
    showSnackbar({ text: 'Objetivo guardado con éxito.' });
  } catch (e) {
    showSnackbar({ text: 'Error al guardar el objetivo.', color: 'error' });
  } finally {
    dialog.show = false;
  }
};

// --- LÓGICA DE ESTADÍSTICAS Y PROYECCIÓN ---
const currentMonthStats = computed(() => { /* ... */ });
const averageTicket = computed(() => { /* ... */ });
const demoToSaleRate = computed(() => { /* ... */ });
const leadToDemoRate = computed(() => { /* ... */ });

const projection = computed(() => {
  const salesGoalFromOKR = activeGoal.value?.keyResults.find(kr => kr.metric === 'salesCount');
  const baseSalesCount = salesGoalFromOKR ? currentMonthStats.value.salesCount : currentMonthStats.value.salesCount * (1 + (growthPercentage.value / 100));
  const projectedSalesCount = Math.ceil(baseSalesCount);

  const demoRate = (targetConversionRate.value > 0 ? targetConversionRate.value : demoToSaleRate.value) / 100;
  const projectedDemosNeeded = demoRate > 0 ? Math.ceil(projectedSalesCount / demoRate) : projectedSalesCount;

  const leadRate = leadToDemoRate.value / 100;
  const projectedReferralsToContact = leadRate > 0 ? Math.ceil(projectedDemosNeeded / leadRate) : 0;
  
  return {
    projectedSalesAmount: projectedSalesCount * averageTicket.value,
    projectedSalesCount,
    projectedDemosNeeded,
    projectedReferralsToContact,
  };
});

onMounted(async () => {
  setTitle('Objetivos y Proyección');
  await Promise.all([getRecords(), getReferrals(), getGoals()]);
  targetConversionRate.value = demoToSaleRate.value;
});
</script>
