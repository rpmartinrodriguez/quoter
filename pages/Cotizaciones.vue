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
        :items="savedRecords"
        :loading="isLoading"
        item-value="$id"
        hover
        class="mt-6"
        no-data-text="No hay registros guardados todavía."
      >
        <template v-slot:item.quoteDate="{ item }">
          <span>
            {{ new Date(item.quoteDate).toLocaleDateString('es-AR', {
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            }) }}
          </span>
        </template>
        <template v-slot:item.clientName="{ item }">
          <span>{{ item.clientName }}</span>
        </template>
        <template v-slot:item.type="{ item }">
          <v-chip :color="item.type === 'VENTA' ? 'success' : 'info'" size="small" label>
            {{ item.type }}
          </v-chip>
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
            <v-btn
              color="success"
              variant="tonal"
              size="small"
              @click="handleConversion(item)"
              :loading="isConverting && selectedRecordId === item.$id"
              :disabled="isConverting"
            >
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
              <span v-if="item.conversionDate">
                Convertida el: {{ new Date(item.conversionDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
              </span>
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

// Usamos nuestros composables
const { getRecords, savedRecords, isLoading, convertQuoteToSale } = useSavedQuotes();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle(); // ✅ Se importa el gestor de títulos

// Estado para manejar la carga de la conversión
const isConverting = ref(false);
const selectedRecordId = ref<string | null>(null);

// Encabezados para la tabla de datos
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

// Propiedades computadas para calcular los totales
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

// Función para manejar el clic del botón de conversión
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

// Cuando la página se carga, se actualiza el título
onMounted(() => {
  setTitle('Registros de Ventas y Cotizaciones');
});
</script>
