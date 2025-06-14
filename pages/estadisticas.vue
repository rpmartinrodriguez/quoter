<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-chart-bar</v-icon>
      Mi Estadística
    </v-card-title>
    
    <v-card-text>
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
      </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';

const { getRecords, savedRecords, isLoading } = useSavedQuotes();
const { formatAsArs } = useFormatters();

// --- LÓGICA PARA ESTADÍSTICAS GLOBALES (he renombrado las variables para mayor claridad) ---
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

// ✅ --- INICIO: NUEVA LÓGICA PARA ANÁLISIS MENSUAL ---

// Estado para guardar el mes seleccionado por el usuario (ej: '2025-06')
const selectedMonth = ref<string | null>(null);

// Computada para generar la lista de meses para el menú desplegable
const availableMonths = computed(() => {
  // 1. Creamos un Set para guardar los meses únicos (ej: '2025-06')
  const months = new Set<string>();
  savedRecords.value.forEach(record => {
    // 2. Extraemos el año y el mes de la fecha
    const month = record.quoteDate.substring(0, 7); // Extrae 'YYYY-MM'
    months.add(month);
  });
  
  // 3. Convertimos el Set a un array, lo ordenamos del más nuevo al más viejo
  return Array.from(months).sort().reverse().map(monthStr => {
    // 4. Le damos un formato legible para el usuario (ej: "Junio 2025")
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    const label = date.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
    return {
      title: `${label.charAt(0).toUpperCase()}${label.slice(1)}`, // Capitalizamos el mes
      value: monthStr
    };
  });
});

// Computada que calcula las estadísticas SÓLO para el mes seleccionado
const statsForSelectedMonth = computed(() => {
  // Si no hay un mes seleccionado, mostramos las estadísticas globales
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

onMounted(async () => {
  if (savedRecords.value.length === 0) {
    await getRecords();
  }
  // ✅ Hacemos que el mes más reciente se seleccione automáticamente al cargar
  if (availableMonths.value.length > 0) {
    selectedMonth.value = availableMonths.value[0].value;
  }
});

// ✅ FIN: NUEVA LÓGICA PARA ANÁLISIS MENSUAL ---
</script>
