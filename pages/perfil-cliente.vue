<template>
  <div v-if="isDataLoading" class="text-center pa-16">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    <div class="mt-4 text-grey">Cargando perfil del cliente...</div>
  </div>

  <div v-else>
    <div v-if="clientName">
      <v-row>
        <v-col>
          <v-btn to="/clientes" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">
            Volver al Directorio
          </v-btn>
          <h1 class="text-h4 font-weight-bold d-flex align-center">
            <v-icon size="large" start color="primary">mdi-account-circle</v-icon>
            {{ clientName }}
          </h1>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="success" variant="tonal">
            <div class="text-subtitle-1">VALOR TOTAL DEL CLIENTE</div>
            <div class="text-h4 font-weight-bold mt-2">{{ formatAsArs(clientStats.totalSold) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="info" variant="tonal">
            <div class="text-subtitle-1">OPERACIONES TOTALES</div>
            <div class="text-h4 font-weight-bold mt-2">{{ clientHistory.length }}</div>
            <span class="text-caption">({{ clientStats.salesCount }} Ventas, {{ clientStats.quotesCount }} Cotizaciones)</span>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="warning" variant="tonal">
            <div class="text-subtitle-1">REFERIDOS APORTADOS</div>
            <div class="text-h4 font-weight-bold mt-2">{{ clientReferrals.length }}</div>
          </v-card>
        </v-col>
      </v-row>
      
      <v-divider class="my-8"></v-divider>

      <v-row>
        <v-col cols="12">
          <v-card flat>
            <v-card-title>Historial de Operaciones</v-card-title>
            <v-data-table :headers="historyHeaders" :items="clientHistory" density="compact" no-data-text="Sin operaciones registradas."></v-data-table>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card flat class="mt-4">
            <v-card-title>Referidos Aportados por este Cliente</v-card-title>
            <v-data-table :headers="referralsHeaders" :items="clientReferrals" density="compact" no-data-text="Sin referidos aportados."></v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="text-center pa-8 text-grey">
      No se encontraron operaciones para el cliente "{{ clientNameFromUrl }}".
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useReferrals } from '~/composables/useReferrals';
import { useFormatters } from '~/composables/useFormatters';

// ✅ Obtenemos los estados de carga de AMBOS composables
const { savedRecords, isLoading: isLoadingQuotes, getRecords } = useSavedQuotes();
const { referrals, isLoading: isLoadingReferrals, getReferrals } = useReferrals();
const { setTitle } = usePageTitle();
const { formatAsArs } = useFormatters();
const route = useRoute();

// ✅ Creamos una computada que nos dice si CUALQUIERA de los dos está cargando
const isDataLoading = computed(() => isLoadingQuotes.value || isLoadingReferrals.value);

// Se obtiene el nombre desde el parámetro de consulta '?name=...'
const clientNameFromUrl = ref(decodeURIComponent(route.query.name as string || ''));
const clientName = clientNameFromUrl;

// El resto de la lógica de la página es la misma
const clientHistory = computed(() => 
  savedRecords.value.filter(r => r.clientName === clientName.value)
);

const clientReferrals = computed(() =>
  referrals.value.filter(r => r.sponsor === clientName.value)
);

const clientStats = computed(() => {
  const sales = clientHistory.value.filter(r => r.type === 'VENTA');
  return {
    totalSold: sales.reduce((sum, r) => sum + r.totalAmount, 0),
    salesCount: sales.length,
    quotesCount: clientHistory.value.length - sales.length,
  };
});

const historyHeaders = [
  { title: 'Fecha', key: 'quoteDate' },
  { title: 'Tipo', key: 'type' },
  { title: 'Total', key: 'totalAmount' },
  { title: 'Productos', key: 'products' },
];

const referralsHeaders = [
  { title: 'Fecha de Carga', key: 'loadDate' },
  { title: 'Referido', key: 'referralName' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Estado', key: 'status' },
];

onMounted(() => {
  setTitle(`Perfil de: ${clientName.value}`);
  // Nos aseguramos de pedir los datos al cargar esta página
  getRecords();
  getReferrals();
});
</script>
