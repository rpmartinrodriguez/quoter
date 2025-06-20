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
      <v-col cols="12">
        <v-card flat>
          <v-card-title>Historial de Operaciones</v-card-title>
          <v-data-table :headers="historyHeaders" :items="clientHistory" density="compact"></v-data-table>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card flat>
          <v-card-title>Referidos Aportados por este Cliente</v-card-title>
          <v-data-table :headers="referralsHeaders" :items="clientReferrals" density="compact"></v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
  <div v-else class="text-center pa-8">
    <p>Cliente no encontrado o cargando...</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useReferrals } from '~/composables/useReferrals';
import { useFormatters } from '~/composables/useFormatters';

const { savedRecords } = useSavedQuotes();
const { referrals } = useReferrals();
const { setTitle } = usePageTitle();
const { formatAsArs } = useFormatters();
const route = useRoute();

const unslugify = (slug: string) => {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const clientName = ref(unslugify(route.params.slug as string));

const clientHistory = computed(() => 
  savedRecords.value.filter(r => r.clientName.toLowerCase() === clientName.value.toLowerCase())
);

const clientReferrals = computed(() =>
  referrals.value.filter(r => r.sponsor.toLowerCase() === clientName.value.toLowerCase())
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
});
</script>
