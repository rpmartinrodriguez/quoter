<template>
  <v-card flat>
    <v-card-title class="d-flex align-center">
      <v-icon start>mdi-format-list-checks</v-icon>
      Registros de Ventas y Cotizaciones
    </v-card-title>
    
    <v-card-text>
      <v-tabs v-model="tab" align-tabs="start" color="primary">
        <v-tab value="sales">Ventas</v-tab>
        <v-tab value="quotes">Cotizaciones</v-tab>
      </v-tabs>
      
      <v-window v-model="tab" class="mt-5">
        <v-window-item value="sales">
          <v-data-table
            :headers="headers"
            :items="sales"
            :loading="isLoading"
            item-value="$id"
            hover
            density="compact"
          >
            <template v-slot:item.quoteDate="{ item }">
              <span>{{ formatSimpleDate(item.quoteDate) }}</span>
            </template>
            <template v-slot:item.totalAmount="{ item }">
              <span>{{ formatAsArs(item.totalAmount) }}</span>
            </template>
            <template v-slot:item.depositAmount="{ item }">
              <span>{{ formatAsArs(item.depositAmount) }}</span>
            </template>
          </v-data-table>
        </v-window-item>

        <v-window-item value="quotes">
          <v-data-table
            :headers="headers"
            :items="quotes"
            :loading="isLoading"
            item-value="$id"
            hover
            density="compact"
          >
            <template v-slot:item.quoteDate="{ item }">
              <span>{{ formatSimpleDate(item.quoteDate) }}</span>
            </template>
            <template v-slot:item.totalAmount="{ item }">
              <span>{{ formatAsArs(item.totalAmount) }}</span>
            </template>
             <template v-slot:item.depositAmount="{ item }">
              <span>{{ formatAsArs(item.depositAmount) }}</span>
            </template>
          </v-data-table>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';

// Usamos nuestros composables
const { getRecords, savedRecords, isLoading } = useSavedQuotes();
const { formatAsArs, formatSimpleDate } = useFormatters();

// Estado para manejar la pestaña activa
const tab = ref('sales');

// Encabezados para la tabla de datos
const headers = [
  { title: 'Fecha', key: 'quoteDate', sortable: true },
  { title: 'Cliente', key: 'clientName', sortable: true },
  { title: 'Total', key: 'totalAmount', sortable: true },
  { title: 'Depósito', key: 'depositAmount', sortable: true },
  { title: 'Cuotas', key: 'installmentsInfo', sortable: false },
  { title: 'Productos', key: 'products', sortable: false },
];

// Propiedades computadas para filtrar los registros
const sales = computed(() => 
  savedRecords.value.filter(r => r.type === 'VENTA')
);

const quotes = computed(() => 
  savedRecords.value.filter(r => r.type === 'COTIZACIÓN')
);

// Cuando la página se carga, llamamos a la función para obtener los registros
onMounted(() => {
  // Solo cargamos los datos si no han sido cargados antes
  if (savedRecords.value.length === 0) {
    getRecords();
  }
});
</script>
