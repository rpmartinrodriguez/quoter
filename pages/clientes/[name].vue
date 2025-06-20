<template>
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

    <v-row>
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
      <v-col cols="12" lg="6">
        <v-card flat>
          <v-card-title>Historial de Operaciones</v-card-title>
          <v-data-table :headers="historyHeaders" :items="clientHistory" density="compact" no-data-text="Sin operaciones registradas."></v-data-table>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-card flat>
          <v-card-title>Referidos Aportados por este Cliente</v-card-title>
          <v-data-table :headers="referralsHeaders" :items="clientReferrals" density="compact" no-data-text="Sin referidos aportados."></v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>

  <div v-else class="text-center pa-8">
    <p>Cliente no encontrado o cargando datos...</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useReferrals } from '~/composables/useReferrals';
import { useFormatters } from '~/composables/useFormatters';

// Obtenemos los datos globales de la aplicación
const { savedRecords } = useSavedQuotes();
const { referrals } = useReferrals();
const { setTitle } = usePageTitle();
const { formatAsArs } = useFormatters();
const route = useRoute();

// Leemos el nombre del cliente desde la URL
const clientNameFromUrl = ref(decodeURIComponent(route.params.name as string));

// Filtramos el historial de operaciones para este cliente específico
const clientHistory = computed(() => 
  savedRecords.value.filter(r => r.clientName === clientNameFromUrl.value)
);

// Filtramos la lista de referidos para encontrar los que este cliente nos dio
const clientReferrals = computed(() =>
  referrals.value.filter(r => r.sponsor === clientNameFromUrl.value)
);

// Calculamos las estadísticas solo para este cliente
const clientStats = computed(() => {
  const sales = clientHistory.value.filter(r => r.type === 'VENTA');
  return {
    totalSold: sales.reduce((sum, r) => sum + r.totalAmount, 0),
    salesCount: sales.length,
    quotesCount: clientHistory.value.length - sales.length,
  };
});

// Definimos las cabeceras para las tablas de la página
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

// Actualizamos el título de la página
onMounted(() => {
  setTitle(`Perfil de: ${clientNameFromUrl.value}`);
});
</script>
