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
          </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
// ✅ Ya no necesitamos `onMounted` aquí, por lo que el código es más simple.
import { computed } from 'vue';
import type { ISavedRecord } from '~/composables/useSavedQuotes';

// Usamos nuestros composables. `getRecords` se llama automáticamente desde el composable.
const { savedRecords, isLoading } = useSavedQuotes();
const { formatAsArs } = useFormatters();

// Encabezados para la tabla de datos
const headers = [
  { title: 'Fecha', key: 'quoteDate', sortable: true },
  { title: 'Cliente', key: 'clientName', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Total', key: 'totalAmount', sortable: true, align: 'end' },
  { title: 'Depósito', key: 'depositAmount', sortable: true, align: 'end' },
  { title: 'Cuotas', key: 'installmentsInfo', sortable: false },
  { title: 'Productos', key: 'products', sortable: false, width: '250px' },
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

// El hook onMounted se ha eliminado, ya que el composable ahora maneja la carga inicial.
</script>
