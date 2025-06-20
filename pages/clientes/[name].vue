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

    </div>
  <div v-else class="text-center pa-8">
    <p>Cliente no encontrado o cargando...</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
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

// ✅ Se obtiene el nombre desde el parámetro 'name' y se decodifica
const clientNameParam = route.params.name as string;
const clientName = ref(decodeURIComponent(clientNameParam));

// ✅ El resto de la lógica ahora usa el nombre decodificado y encontrará la coincidencia exacta
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

const historyHeaders = [ /* ... sin cambios ... */ ];
const referralsHeaders = [ /* ... sin cambios ... */ ];

onMounted(() => {
  setTitle(`Perfil de: ${clientName.value}`);
});
</script>
