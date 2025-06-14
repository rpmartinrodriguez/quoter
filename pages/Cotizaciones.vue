<template>
  <v-card flat>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="savedRecords"
        :loading="isLoading"
        item-value="$id"
        hover
        class="mt-6"
        no-data-text="No hay registros guardados todavía."
      >
        <template v-slot:item.actions="{ item }">
          <div v-if="item.type === 'COTIZACIÓN'">
            <v-btn
              color="success"
              variant="tonal"
              size="small"
              @click="handleConversion(item)"
              :loading="isConverting && selectedRecordId === item.$id"
            >
              Convertir a Venta
            </v-btn>
          </div>
          <div v-else-if="item.isConverted">
             <v-chip color="grey" size="small" label variant="outlined">
                <v-icon start>mdi-check-decagram</v-icon>
                Convertida
             </v-chip>
          </div>
        </template>
        </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { ISavedRecord } from '~/composables/useSavedQuotes'; // Importamos la interfaz

// ✅ Usamos la nueva función del composable
const { getRecords, savedRecords, isLoading, convertQuoteToSale } = useSavedQuotes();
const { formatAsArs, formatSimpleDate } = useFormatters();

// ✅ Nuevo estado para manejar la carga de la conversión
const isConverting = ref(false);
const selectedRecordId = ref<string | null>(null);

// ✅ Se actualizan los encabezados para incluir la nueva columna "Acciones"
const headers = [
  { title: 'Fecha', key: 'quoteDate', sortable: true },
  { title: 'Cliente', key: 'clientName', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Total', key: 'totalAmount', sortable: true, align: 'end' },
  { title: 'Depósito', key: 'depositAmount', sortable: true, align: 'end' },
  { title: 'Cuotas', key: 'installmentsInfo', sortable: false },
  { title: 'Productos', key: 'products', sortable: false, width: '200px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }, // <-- NUEVA
];

// ... (tus computed para totalSales y totalQuotes no cambian) ...

// ✅ Nueva función para manejar el clic del botón
const handleConversion = async (record: ISavedRecord) => {
  selectedRecordId.value = record.$id;
  isConverting.value = true;
  try {
    await convertQuoteToSale(record.$id);
  } catch (error) {
    // Aquí podrías mostrar una alerta de error si falla la conversión
    console.error("Fallo la conversión", error);
  } finally {
    isConverting.value = false;
    selectedRecordId.value = null;
  }
};

onMounted(() => {
  if (savedRecords.value.length === 0) {
    getRecords();
  }
});
</script>
