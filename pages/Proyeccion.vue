<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-finance</v-icon>
      Proyección de Ventas
    </v-card-title>
    
    <v-card-text>
      <div v-if="isLoading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <div class="mt-4 text-grey">Cargando datos históricos...</div>
      </div>

      <div v-else>
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
      </div>
    </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
// En el script, los cambios son mínimos, ya que la lógica es la misma.
// Solo nos aseguramos de que el onMounted llame a la función y ya.
import { ref, computed, onMounted } from 'vue';

const { getRecords, savedRecords, isLoading } = useSavedQuotes();
const { formatAsArs } = useFormatters();

// ... (toda tu lógica de 'computed' para las estadísticas no cambia) ...
// He omitido la lógica de los computed aquí para no hacer el bloque gigante,
// pero debe ser la misma que te pasé en el mensaje sobre la página de estadísticas.
// Si no la tenés a mano, avisame y te paso este archivo 100% completo.

onMounted(() => {
  // Ya no necesitamos el if, porque el composable es inteligente y no recargará datos innecesariamente.
  // Simplemente nos aseguramos de que la carga se inicie si es necesario.
  getRecords();
});
</script>
