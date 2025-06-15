<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-chart-bar</v-icon>
      Mi Estadística
    </v-card-title>
    
    <div v-if="isLoading || isLoadingReferrals" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4 text-grey">Cargando datos...</div>
    </div>

    <v-card-text v-else>
      <v-divider class="my-8"></v-divider>

      <v-divider class="my-8"></v-divider>

      <v-row>
        <v-col>
           <div class="text-overline mb-2">Evaluación del Programa 4/14</div>
          <v-card flat variant="outlined">
            <v-card-title>Estadísticas de Referidos</v-card-title>
            <v-card-subtitle>Total de Referidos Cargados: {{ referralStats.total }}</v-card-subtitle>
            <v-card-text>
              <div v-if="referralStats.total > 0">
                <div class="my-4">
                  <div class="d-flex justify-space-between mb-1">
                    <span class="font-weight-bold">Demos Realizadas</span>
                    <span>{{ referralStats.demo }} / {{ referralStats.total }} ({{ Math.round((referralStats.demo / referralStats.total) * 100) }}%)</span>
                  </div>
                  <v-progress-linear :model-value="(referralStats.demo / referralStats.total) * 100" color="success" height="10" rounded></v-progress-linear>
                </div>
                
                <div class="my-4">
                  <div class="d-flex justify-space-between mb-1">
                    <span class="font-weight-bold">Pendientes de Contacto</span>
                    <span>{{ referralStats.pendiente }} / {{ referralStats.total }} ({{ Math.round((referralStats.pendiente / referralStats.total) * 100) }}%)</span>
                  </div>
                  <v-progress-linear :model-value="(referralStats.pendiente / referralStats.total) * 100" color="info" height="10" rounded></v-progress-linear>
                </div>

                <div class="my-4">
                  <div class="d-flex justify-space-between mb-1">
                    <span class="font-weight-bold">No Contestaron</span>
                    <span>{{ referralStats.noContesta }} / {{ referralStats.total }} ({{ Math.round((referralStats.noContesta / referralStats.total) * 100) }}%)</span>
                  </div>
                  <v-progress-linear :model-value="(referralStats.noContesta / referralStats.total) * 100" color="warning" height="10" rounded></v-progress-linear>
                </div>

                <div class="my-4">
                  <div class="d-flex justify-space-between mb-1">
                    <span class="font-weight-bold">No Aceptaron</span>
                    <span>{{ referralStats.noAcepta }} / {{ referralStats.total }} ({{ Math.round((referralStats.noAcepta / referralStats.total) * 100) }}%)</span>
                  </div>
                  <v-progress-linear :model-value="(referralStats.noAcepta / referralStats.total) * 100" color="error" height="10" rounded></v-progress-linear>
                </div>
              </div>
              <div v-else class="text-center text-grey pa-4">
                No hay datos de referidos para mostrar estadísticas.
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
       </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';

// ✅ Importamos AMBOS composables
const { getRecords, savedRecords, isLoading } = useSavedQuotes();
const { getReferrals, referrals, isLoading: isLoadingReferrals } = useReferrals();
const { formatAsArs } = useFormatters();

// ... (toda la lógica para 'totalSales', 'totalQuotes', 'selectedMonth', 'availableMonths', 'statsForSelectedMonth', y 'rankingDeProductos' se mantiene igual) ...

// ✅ NUEVA LÓGICA PARA LAS ESTADÍSTICAS DE REFERIDOS
const referralStats = computed(() => {
  const stats = {
    demo: 0,
    noAcepta: 0,
    noContesta: 0,
    pendiente: 0,
    total: referrals.value.length
  };
  for (const referral of referrals.value) {
    switch (referral.status) {
      case 'Demo': stats.demo++; break;
      case 'No Acepta': stats.noAcepta++; break;
      case 'No Contesta': stats.noContesta++; break;
      case 'Pendiente': default: stats.pendiente++; break;
    }
  }
  return stats;
});

// ✅ Actualizamos `onMounted` para que cargue AMBOS tipos de datos
onMounted(async () => {
  // El composable se encarga de no hacer llamadas duplicadas
  await getRecords();
  await getReferrals(); 
  
  if (availableMonths.value.length > 0) {
    selectedMonth.value = availableMonths.value[0].value;
  }
});
</script>
