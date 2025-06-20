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
        <template v-slot:item.clientName="{ item }">
          <NuxtLink :to="`/clientes/${slugify(item.clientName)}`" class="client-link">
            {{ item.clientName }}
          </NuxtLink>
        </template>

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

const { savedRecords, isLoading, getRecords } = useSavedQuotes();
const { setTitle } = usePageTitle();
const { formatAsArs } = useFormatters();

const search = ref('');

// ✅ Nueva función para convertir un nombre en una URL amigable
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Reemplaza espacios con -
    .replace(/[^\w\-]+/g, '')       // Quita caracteres no alfanuméricos
    .replace(/\-\-+/g, '-')         // Reemplaza múltiples - con uno solo
    .replace(/^-+/, '')             // Quita - del principio
    .replace(/-+$/, '');            // Quita - del final
};

const clientSummary = computed(() => {
  const clientsData: Record<string, {
    totalSold: number;
    recordCount: number;
    lastActivity: Date;
  }> = {};

  for (const record of savedRecords.value) {
    const name = record.clientName;
    if (!clientsData[name]) {
      clientsData[name] = { totalSold: 0, recordCount: 0, lastActivity: new Date(record.quoteDate) };
    }
    clientsData[name].recordCount++;
    if (record.type === 'VENTA') {
      clientsData[name].totalSold += record.totalAmount;
    }
    const recordDate = new Date(record.quoteDate);
    if (recordDate > clientsData[name].lastActivity) {
      clientsData[name].lastActivity = recordDate;
    }
  }
  return Object.entries(clientsData).map(([clientName, data]) => ({
    clientName, ...data
  })).sort((a, b) => b.totalSold - a.totalSold);
});

const headers = [
  { title: 'Nombre del Cliente', key: 'clientName' },
  { title: 'Total Comprado', key: 'totalSold', align: 'end' },
  { title: 'Operaciones', key: 'recordCount', align: 'center' },
  { title: 'Última Actividad', key: 'lastActivity' },
];

onMounted(() => {
  setTitle('Clientes');
  getRecords();
});
</script>

<style scoped>
.client-link {
  font-weight: 500;
  text-decoration: none;
  color: inherit;
}
.client-link:hover {
  color: rgb(var(--v-theme-primary));
}
</style>
