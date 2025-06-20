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

// ✅ Se obtiene el nombre desde el parámetro de consulta 'name'
const clientNameFromUrl = ref(decodeURIComponent(route.query.name as string || ''));
const clientName = clientNameFromUrl; // Para simplicidad en el template

// El resto de la lógica es la misma, ya que se basa en el 'clientName'
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
