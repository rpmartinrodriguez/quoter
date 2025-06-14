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
import { ref, computed } from 'vue';

const { getRecords, savedRecords, isLoading } = useSavedQuotes();
const { formatAsArs } = useFormatters();

// --- ESTADO ---
const growthPercentage = ref(10);

// --- LÓGICA DE FECHAS ---
const now = new Date();
const currentMonthStr = now.toISOString().substring(0, 7);
const currentMonthName = now.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const nextMonthName = nextMonthDate.toLocaleString('es-AR', { month: 'long', year: 'numeric' });


// --- CÁLCULOS BASE ---
const totalTasaDeConversion = computed(() => { /* ... */ });
const currentMonthStats = computed(() => {
  const recordsOfThisMonth = savedRecords.value.filter(r => r.quoteDate.startsWith(currentMonthStr));
  const sales = recordsOfThisMonth.filter(r => r.type === 'VENTA');
  return {
    salesCount: sales.length,
    totalSales: sales.reduce((sum, record) => sum + record.totalAmount, 0),
    salesRecords: sales, // Exponemos los registros de venta para usarlos después
  };
});

// --- CÁLCULOS DE PROYECCIÓN ---
const projection = computed(() => {
  const growthFactor = 1 + (growthPercentage.value / 100);
  const projectedSalesCount = Math.ceil(currentMonthStats.value.salesCount * growthFactor);
  
  // Si el objetivo es menor o igual a las ventas actuales, no se necesitan ventas adicionales.
  const additionalSalesNeeded = Math.max(0, projectedSalesCount - currentMonthStats.value.salesCount);
  
  const projectedSalesAmount = currentMonthStats.value.totalSales > 0
    ? currentMonthStats.value.totalSales * growthFactor
    : 0;
  
  const conversionRate = totalTasaDeConversion.value / 100;
  const projectedQuotesNeeded = conversionRate > 0 
    ? Math.ceil(projectedSalesCount / conversionRate)
    : projectedSalesCount;

  return {
    projectedSalesAmount,
    projectedSalesCount,
    projectedQuotesNeeded,
    additionalSalesNeeded, // Exponemos este dato clave
  };
});

// ✅ --- INICIO: NUEVA LÓGICA DINÁMICA PARA EL RANKING/FOCO ---
const projectedProductFocus = computed(() => {
  const currentSalesCount = currentMonthStats.value.salesCount;
  // Si no hay ventas este mes, no podemos hacer una proyección proporcional.
  if (currentSalesCount === 0) {
    return [];
  }

  // 1. Contamos los productos vendidos este mes (como antes).
  const productCounts = new Map<string, number>();
  for (const record of currentMonthStats.value.salesRecords) {
    for (const productName of record.products) {
      const currentCount = productCounts.get(productName) || 0;
      productCounts.set(productName, currentCount + 1);
    }
  }

  // 2. Calculamos el "peso" o contribución de cada producto a las ventas totales.
  const productContributions = Array.from(productCounts.entries()).map(([name, count]) => ({
    name,
    currentCount: count,
    contribution: count / currentSalesCount, // ej: 0.5 si es el 50% de las ventas
  }));

  // 3. Distribuimos las ventas adicionales necesarias según esa contribución.
  const productFocus = productContributions.map(product => ({
    ...product,
    projectedAdditional: Math.round(projection.value.additionalSalesNeeded * product.contribution),
  }));

  // 4. Ordenamos por la proyección de ventas adicionales y devolvemos el resultado.
  productFocus.sort((a, b) => b.projectedAdditional - a.projectedAdditional);
  
  return productFocus;
});
// ✅ --- FIN: NUEVA LÓGICA DINÁMICA ---

// --- CARGA DE DATOS ---
onMounted(() => {
  getRecords();
});
</script>
