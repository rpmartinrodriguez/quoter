<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-chart-bar</v-icon>
      Mi Estadística
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="success" variant="tonal">
            <div class="text-subtitle-1">NÚMERO DE VENTAS</div>
            <div class="text-h3 font-weight-bold mt-2">{{ numeroDeVentas }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="info" variant="tonal">
            <div class="text-subtitle-1">NÚMERO DE COTIZACIONES</div>
            <div class="text-h3 font-weight-bold mt-2">{{ numeroDeCotizaciones }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="primary" variant="tonal">
            <div class="text-subtitle-1">TASA DE CONVERSIÓN</div>
            <div class="text-h3 font-weight-bold mt-2">{{ tasaDeConversion }}%</div>
            <div class="text-caption mt-1">(Ventas / Total de Registros)</div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col>
          <p class="text-center text-grey">
            Próximamente: Gráficos de ventas por mes, productos más populares y más.
          </p>
        </v-col>
      </v-row>

    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';

// Usamos el mismo composable, ya que contiene todos los datos que necesitamos
const { getRecords, savedRecords, isLoading } = useSavedQuotes();

// --- LÓGICA PARA CALCULAR LAS ESTADÍSTICAS ---

// Calculamos el número de ventas simplemente contando los registros de ese tipo.
const numeroDeVentas = computed(() => 
  savedRecords.value.filter(r => r.type === 'VENTA').length
);

// Hacemos lo mismo para las cotizaciones.
const numeroDeCotizaciones = computed(() => 
  savedRecords.value.filter(r => r.type === 'COTIZACIÓN').length
);

// La tasa de conversión es una de las métricas más importantes.
const tasaDeConversion = computed(() => {
  const totalRegistros = numeroDeVentas.value + numeroDeCotizaciones.value;
  if (totalRegistros === 0) {
    return 0; // Para evitar la división por cero
  }
  // Calculamos el porcentaje y lo redondeamos a 1 decimal.
  const rate = (numeroDeVentas.value / totalRegistros) * 100;
  return Math.round(rate * 10) / 10;
});

// Cuando la página se carga por primera vez, nos aseguramos de tener los datos.
onMounted(() => {
  // Solo cargamos los datos si el array está vacío para no hacer llamadas innecesarias.
  if (savedRecords.value.length === 0) {
    getRecords();
  }
});
</script>
