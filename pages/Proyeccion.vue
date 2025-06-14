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
        <v-col cols="12">
          <v-card class="pa-4" variant="outlined">
            <label for="growth-slider" class="text-overline">
              Establecer Objetivo de Crecimiento para el Próximo Mes
            </label>
            <v-slider
              id="growth-slider"
              v-model="growthPercentage"
              :step="5"
              thumb-label
              color="primary"
              class="mt-2"
            >
              <template v-slot:append>
                <v-text-field
                  v-model="growthPercentage"
                  type="number"
                  style="width: 80px"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-text-field>
                <span class="ml-2">%</span>
              </template>
            </v-slider>
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
              <div class="text-caption">en {{ currentMonthStats.salesCount }} operaciones</div>
            </v-card>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <div class="text-center">
            <div class="text-h6">Objetivo Próximo Mes ({{ nextMonthName }})</div>
            <v-card class="mt-4 pa-5 elevation-4" color="primary">
              <div class="text-overline">Objetivo de Ventas</div>
              <div class="text-h4 font-weight-bold">{{ formatAsArs(projection.projectedSalesAmount) }}</div>
              <div class="text-caption">Crecimiento del {{ growthPercentage }}%</div>
            </v-card>
          </div>
        </v-col>
        
        <v-col cols="12" md="4">
           <div class="text-center">
            <div class="text-h6">Esfuerzo Estimado</div>
            <v-card class="mt-4 pa-5 elevation-4">
              <div class="text-overline">Nuevas Ventas a Cerrar</div>
              <div class="text-h4 font-weight-bold text-info">{{ projection.projectedSalesCount }}</div>
              <v-divider class="my-3"></v-divider>
              <div class="text-overline">Cotizaciones a Realizar</div>
              <div class="text-h4 font-weight-bold text-info">{{ projection.projectedQuotesNeeded }}</div>
              <div class="text-caption">(basado en tu tasa de conversión del {{ totalTasaDeConversion }}%)</div>
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
                <v-list-item
                  v-for="product in projectedProductFocus"
                  :key="product.name"
                  :title="product.name"
                >
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

const { getRecords, savedRecords, isLoading } = useSavedQuotes();
const { formatAsArs } = useFormatters();

// --- ESTADO ---
const growthPercentage = ref(10); // Objetivo de crecimiento por defecto: 10%

// --- LÓGICA DE FECHAS Y NOMBRES DE MESES ---
const now = new Date();
const currentMonthStr = now.toISOString().substring(0, 7); // Formato 'YYYY-MM'
const currentMonthName = now.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });
const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const nextMonthName = nextMonthDate.toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });


// --- CÁLCULOS BASE (DATOS HISTÓRICOS Y DEL MES ACTUAL) ---
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

// --- CÁLCULOS DE PROYECCIÓN ---
const projection = computed(() => {
  const growthFactor = 1 + (growthPercentage.value / 100);
  
  const projectedSalesAmount = currentMonthStats.value.totalSales > 0
    ? currentMonthStats.value.totalSales * growthFactor
    : 0;
  
  const projectedSalesCount = Math.ceil(currentMonthStats.value.salesCount * growthFactor);
  
  const additionalSalesNeeded = Math.max(0, projectedSalesCount - currentMonthStats.value.salesCount);
  
  const conversionRate = totalTasaDeConversion.value / 100;
  const projectedQuotesNeeded = conversionRate > 0 
    ? Math.ceil(projectedSalesCount / conversionRate)
    : projectedSalesCount;

  return {
    projectedSalesAmount,
    projectedSalesCount,
    projectedQuotesNeeded,
    additionalSalesNeeded,
  };
});

// --- RANKING DE PRODUCTOS DINÁMICO ---
const projectedProductFocus = computed(() => {
  const currentSalesCount = currentMonthStats.value.salesCount;
  if (currentSalesCount === 0) {
    return [];
  }

  const productCounts = new Map<string, number>();
  for (const record of currentMonthStats.value.salesRecords) {
    for (const productName of record.products) {
      const currentCount = productCounts.get(productName) || 0;
      productCounts.set(productName, currentCount + 1);
    }
  }

  const productContributions = Array.from(productCounts.entries()).map(([name, count]) => ({
    name,
    currentCount: count,
    contribution: count / currentSalesCount,
  }));

  const productFocus = productContributions.map(product => ({
    ...product,
    projectedAdditional: Math.round(projection.value.additionalSalesNeeded * product.contribution),
  }));

  productFocus.sort((a, b) => b.projectedAdditional - a.projectedAdditional || b.currentCount - a.currentCount);
  
  return productFocus;
});


// --- CARGA DE DATOS ---
onMounted(() => {
  getRecords();
});
</script>
