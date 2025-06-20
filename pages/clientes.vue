<template>
  <v-card flat>
    <v-card-title class="d-flex align-center">
      <v-icon start>mdi-account-box-multiple-outline</v-icon>
      Directorio de Clientes
    </v-card-title>
    
    <v-card-text>
      <v-text-field
        v-model="search"
        label="Buscar cliente..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-4"
      ></v-text-field>

      <v-data-table
        :headers="headers"
        :items="clientSummary"
        :loading="isLoading"
        :search="search"
        item-value="clientName"
        hover
        no-data-text="No hay datos de ventas o cotizaciones para mostrar."
      >
        <template v-slot:item.totalSold="{ item }">
          <span class="font-weight-bold">{{ formatAsArs(item.totalSold) }}</span>
        </template>
         <template v-slot:item.lastActivity="{ item }">
          <span>{{ new Date(item.lastActivity).toLocaleDateString('es-AR') }}</span>
        </template>
        <template v-slot:item.recordCount="{ item }">
          <v-chip size="small">{{ item.recordCount }}</v-chip>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useFormatters } from '~/composables/useFormatters';

// Usamos el composable que ya tiene los datos de ventas y cotizaciones
const { savedRecords, isLoading, getRecords } = useSavedQuotes();
const { setTitle } = usePageTitle();
const { formatAsArs } = useFormatters();

const search = ref('');

// ✅ El corazón de la nueva página: una computada que procesa los datos
const clientSummary = computed(() => {
  // 1. Creamos un objeto para agrupar los registros por nombre de cliente
  const clientsData: Record<string, {
    totalSold: number;
    recordCount: number;
    lastActivity: Date;
  }> = {};

  // 2. Recorremos todos los registros guardados
  for (const record of savedRecords.value) {
    const name = record.clientName;
    // Si es la primera vez que vemos a este cliente, lo inicializamos
    if (!clientsData[name]) {
      clientsData[name] = {
        totalSold: 0,
        recordCount: 0,
        lastActivity: new Date(record.quoteDate),
      };
    }

    // 3. Acumulamos los datos
    clientsData[name].recordCount++;
    if (record.type === 'VENTA') {
      clientsData[name].totalSold += record.totalAmount;
    }

    // Actualizamos la fecha de última actividad si la actual es más reciente
    const recordDate = new Date(record.quoteDate);
    if (recordDate > clientsData[name].lastActivity) {
      clientsData[name].lastActivity = recordDate;
    }
  }

  // 4. Convertimos el objeto a un array para la tabla y lo ordenamos
  return Object.entries(clientsData).map(([clientName, data]) => ({
    clientName,
    ...data
  })).sort((a, b) => b.totalSold - a.totalSold); // Ordenar por los que más compraron
});

const headers = [
  { title: 'Nombre del Cliente', key: 'clientName' },
  { title: 'Total Comprado', key: 'totalSold', align: 'end' },
  { title: 'Operaciones', key: 'recordCount', align: 'center' },
  { title: 'Última Actividad', key: 'lastActivity' },
];

onMounted(() => {
  setTitle('Clientes');
  getRecords(); // Nos aseguramos de tener los datos más frescos
});
</script>
