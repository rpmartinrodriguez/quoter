<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-format-list-checks</v-icon>
      Registros de Ventas y Cotizaciones
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-alert color="success" variant="tonal" border="start" prominent>
            <h3 class="mb-2">Total de Ventas</h3>
            <div class="text-h4 font-weight-bold">{{ formatAsArs(totalSales) }}</div>
          </v-alert>
        </v-col>
        <v-col cols="12" md="6">
          <v-alert color="info" variant="tonal" border="start" prominent>
            <h3 class="mb-2">Total de Cotizaciones</h3>
            <div class="text-h4 font-weight-bold">{{ formatAsArs(totalQuotes) }}</div>
          </v-alert>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredRecords"
        :loading="isLoading"
        item-value="$id"
        hover
        class="mt-6"
        no-data-text="No hay registros que coincidan con los filtros."
      >
        <template v-slot:header.clientName="{ column }">
          <v-menu offset-y>
            <template v-slot:activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" variant="text" size="small">
                {{ column.title }}
                <v-icon end :color="selectedClient ? 'primary' : ''">mdi-filter-variant</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="selectedClient = null">
                <v-list-item-title>Mostrar Todos</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item v-for="client in uniqueClients" :key="client" @click="selectedClient = client">
                <v-list-item-title>{{ client }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template v-slot:header.type="{ column }">
          <v-menu offset-y>
            <template v-slot:activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" variant="text" size="small">
                {{ column.title }}
                <v-icon end :color="selectedType ? 'primary' : ''">mdi-filter-variant</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="selectedType = null">
                <v-list-item-title>Mostrar Todos</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item v-for="typeOption in ['VENTA', 'COTIZACIÓN']" :key="typeOption" @click="selectedType = typeOption">
                <v-list-item-title>{{ typeOption }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        
        <template v-slot:item.quoteDate="{ item }">
          <span>{{ new Date(item.quoteDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span>
        </template>
        <template v-slot:item.type="{ item }">
          <v-chip :color="item.type === 'VENTA' ? 'success' : 'info'" size="small" label>{{ item.type }}</v-chip>
        </template>
        <template v-slot:item.totalAmount="{ item }">
          <span class="font-weight-bold">{{ formatAsArs(item.totalAmount) }}</span>
        </template>
        <template v-slot:item.depositAmount="{ item }">
          <span>{{ formatAsArs(item.depositAmount) }}</span>
        </template>
        <template v-slot:item.installmentsInfo="{ item }">
          <span>{{ item.installmentsInfo }}</span>
        </template>
        <template v-slot:item.products="{ item }">
          <span>{{ item.products.join(', ') }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <div v-if="item.type === 'COTIZACIÓN'">
            <v-btn color="success" variant="tonal" size="small" @click="handleConversion(item)" :loading="isConverting && selectedRecordId === item.$id" :disabled="isConverting">
              Convertir a Venta
            </v-btn>
          </div>
          <div v-else-if="item.isConverted">
            <v-tooltip location="top">
              <template v-slot:activator="{ props: tooltipProps }">
                <v-chip v-bind="tooltipProps" color="grey" size="small" label variant="outlined">
                  <v-icon start>mdi-check-decagram</v-icon>
                  Convertida
                </v-chip>
              </template>
              <span v-if="item.conversionDate">Convertida el: {{ new Date(item.conversionDate).toLocaleDateString('es-AR') }}</span>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { ISavedRecord } from '~/composables/useSavedQuotes';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useFormatters } from '~/composables/useFormatters';

const { getRecords, savedRecords, isLoading, convertQuoteToSale } = useSavedQuotes();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle();

const isConverting = ref(false);
const selectedRecordId = ref<string | null>(null);

// ✅ INICIO: LÓGICA Y ESTADO PARA LOS FILTROS
const selectedClient = ref<string | null>(null);
const selectedType = ref<'VENTA' | 'COTIZACIÓN' | null>(null);

const uniqueClients = computed(() => {
  const clients = new Set(savedRecords.value.map(r => r.clientName));
  return Array.from(clients).sort();
});

const filteredRecords = computed(() => {
  let items = savedRecords.value;
  if (selectedClient.value) {
    items = items.filter(r => r.clientName === selectedClient.value);
  }
  if (selectedType.value) {
    items = items.filter(r => r.type === selectedType.value);
  }
  return items;
});
// ✅ FIN: LÓGICA Y ESTADO PARA LOS FILTROS

const headers = [
  { title: 'Fecha', key: 'quoteDate', sortable: true },
  { title: 'Cliente', key: 'clientName', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Total', key: 'totalAmount', sortable: true, align: 'end' },
  { title: 'Depósito', key: 'depositAmount', sortable: true, align: 'end' },
  { title: 'Cuotas', key: 'installmentsInfo', sortable: false },
  { title: 'Productos', key: 'products', sortable: false, width: '200px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
];

const totalSales = computed(() => 
  savedRecords.value
    .filter(r => r.type === 'VENTA')
    .reduce((sum, record) => sum + record.totalAmount, 0)
);

const totalQuotes = computed(() => 
  savedRecords.value
    .filter(r => r.type === 'COTIZACIÓN')
    .reduce((sum, record) => sum + record.totalAmount, 0)
);

const handleConversion = async (record: ISavedRecord) => {
  selectedRecordId.value = record.$id;
  isConverting.value = true;
  try {
    await convertQuoteToSale(record.$id);
  } catch (error) {
    console.error("Fallo la conversión", error);
  } finally {
    isConverting.value = false;
    selectedRecordId.value = null;
  }
};

onMounted(() => {
  setTitle('Registros de Ventas y Cotizaciones');
});
</script>
