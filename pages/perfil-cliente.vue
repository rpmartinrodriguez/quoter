<template>
  <div v-if="isDataLoading" class="text-center pa-16">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    <div class="mt-4 text-grey">Cargando perfil del cliente...</div>
  </div>

  <div v-else>
    <div v-if="clientHistory.length > 0">
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
            <v-data-table
              :headers="historyHeaders"
              :items="clientHistory"
              density="compact"
              no-data-text="Sin operaciones registradas."
            >
              <template v-slot:item.quoteDate="{ item }">
                <span>{{ new Date(item.quoteDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span>
              </template>
              <template v-slot:item.type="{ item }">
                <v-chip :color="item.type === 'VENTA' ? 'success' : 'info'" size="small" label>{{ item.type }}</v-chip>
              </template>
              <template v-slot:item.totalAmount="{ item }">
                <span class="font-weight-bold">{{ formatAsArs(item.totalAmount) }}</span>
              </template>
              <template v-slot:item.products="{ item }">
                <span>{{ item.products.join(', ') }}</span>
              </template>
              </v-data-table>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card flat class="mt-4">
            <v-card-title>Referidos Aportados por este Cliente</v-card-title>
            <v-data-table
              :headers="referralsHeaders"
              :items="clientReferrals"
              density="compact"
              no-data-text="Sin referidos aportados."
            >
              <template v-slot:item.loadDate="{ item }">
                <span>{{ new Date(item.loadDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <div v-else class="text-center pa-16">
      <v-icon size="64" color="grey-lighten-1">mdi-text-box-search-outline</v-icon>
      <h2 class="text-h6 text-grey mt-4">No se encontraron operaciones para</h2>
      <p class="text-h5 text-grey-darken-2 font-weight-bold">{{ clientName }}</p>
      <v-btn to="/clientes" variant="text" prepend-icon="mdi-arrow-left" class="mt-8">
        Volver al Directorio
      </v-btn>
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

const { savedRecords, isLoading: isLoadingQuotes, getRecords } = useSavedQuotes();
const { referrals, isLoading: isLoadingReferrals, getReferrals } = useReferrals();
const { setTitle } = usePageTitle();
const { formatAsArs } = useFormatters();
const route = useRoute();

const isDataLoading = computed(() => isLoadingQuotes.value || isLoadingReferrals.value);

const clientName = ref(decodeURIComponent(route.query.name as string || ''));

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
  { title: 'Total', key: 'totalAmount', align: 'end' },
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
  getRecords();
  getReferrals();
});
</script>
