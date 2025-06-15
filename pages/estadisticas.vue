<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-chart-bar</v-icon>
      Mi Estadística
    </v-card-title>
    
    <div v-if="isLoading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4 text-grey">Cargando datos históricos...</div>
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
          <div class="text-overline">Análisis Mensual</div>
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
        <v-col>
           <div class="text-overline mb-2">Ranking de Productos (Histórico)</div>
          <v-card flat variant="outlined">
            <v-card-title>Productos Más Populares</v-card-title>
            <v-card-subtitle>Basado en todas las ventas y cotizaciones guardadas.</v-card-subtitle>
            <v-card-text>
              <v-list lines="one">
                <v-list-item
                  v-for="(product, index) in rankingDeProductos"
                  :key="product.name"
                >
                  <template v-slot:prepend>
                    <span class="font-weight-bold mr-4 text-h6 text-primary">#{{ index + 1 }}</span>
                  </template>
                  
                  <v-list-item-title>{{ product.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Incluido en {{ product.count }} registros
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="rankingDeProductos.length === 0">
                  <v-list-item-title>Aún no hay suficientes datos para generar un ranking.</v-list-item-title>
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

// --- LÓGICA PARA ESTADÍSTICAS GLOBALES ---
const totalNumeroDeVentas = computed(() => 
  savedRecords.value.filter(r => r.type === 'VENTA').length
);
const totalNumeroDeCotizaciones = computed(() => 
  savedRecords.value.filter(r => r.type === 'COTIZACIÓN').length
);
const totalTasaDeConversion = computed(() => {
  const totalRegistros = totalNumeroDeVentas.value + totalNumeroDeCotizaciones.value;
  if (totalRegistros === 0) return 0;
  const rate = (totalNumeroDeVentas.value / totalRegistros) * 100;
  return Math.round(rate * 10) / 10;
});

// --- LÓGICA PARA ANÁLISIS MENSUAL ---
const selectedMonth = ref<string | null>(null);

const availableMonths = computed(() => {
  const months = new Set<string>();
  savedRecords.value.forEach(record => {
    const month = record.quoteDate.substring(0, 7);
    months.add(month);
  });
  
  return Array.from(months).sort().reverse().map(monthStr => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    const label = date.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
    return {
      title: `${label.charAt(0).toUpperCase()}${label.slice(1)}`,
      value: monthStr
    };
  });
});

const statsForSelectedMonth = computed(() => {
  const recordsToAnalyze = selectedMonth.value
    ? savedRecords.value.filter(r => r.quoteDate.startsWith(selectedMonth.value!))
    : savedRecords.value;

  const sales = recordsToAnalyze.filter(r => r.type === 'VENTA');
  const quotes = recordsToAnalyze.filter(r => r.type === 'COTIZACIÓN');

  return {
    salesCount: sales.length,
    totalSales: sales.reduce((sum, record) => sum + record.totalAmount, 0),
    quotesCount: quotes.length,
    totalQuotes: quotes.reduce((sum, record) => sum + record.totalAmount, 0),
  };
});


// ✅ --- INICIO: LÓGICA PARA EL RANKING DE PRODUCTOS RESTAURADA ---
const rankingDeProductos = computed(() => {
  // 1. Creamos un mapa para contar cuántas veces aparece cada producto.
  const productCounts = new Map<string, number>();

  // 2. Recorremos todos los registros guardados (ventas y cotizaciones).
  for (const record of savedRecords.value) {
    for (const productName of record.products) {
      const currentCount = productCounts.get(productName) || 0;
      productCounts.set(productName, currentCount + 1);
    }
  }

  // 3. Convertimos el mapa a un array para poder ordenarlo.
  const sortedProducts = Array.from(productCounts.entries()).map(([name, count]) => ({
    name,
    count
  }));

  // 4. Ordenamos el array de mayor a menor.
  sortedProducts.sort((a, b) => b.count - a.count);

  // 5. Devolvemos los 10 productos más populares.
  return sortedProducts.slice(0, 10);
});
// ✅ --- FIN: LÓGICA PARA EL RANKING DE PRODUCTOS RESTAURADA ---


onMounted(async () => {
  if (savedRecords.value.length === 0) {
    await getRecords();
  }
  // Hacemos que el mes más reciente se seleccione automáticamente al cargar
  if (availableMonths.value.length > 0) {
    selectedMonth.value = availableMonths.value[0].value;
  }
});
</script>
