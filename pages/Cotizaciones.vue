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

      <v-divider class="my-8"></v-divider>
      
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedClient"
            :items="uniqueClients"
            label="Filtrar por Cliente"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedType"
            :items="['VENTA', 'COTIZACIÓN']"
            label="Filtrar por Tipo"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedAction"
            :items="actionOptions"
            label="Filtrar por Acción"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          ></v-select>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredRecords"
        :loading="isLoading"
        item-value="$id"
        hover
        class="mt-2"
        no-data-text="No hay registros que coincidan con los filtros."
      >
        <template v-slot:header.clientName="{ column }">
          <v-menu offset-y><template v-slot:activator="{ props: menuProps }"><v-btn v-bind="menuProps" variant="text" size="small">{{ column.title }}<v-icon end :color="selectedClient ? 'primary' : ''">mdi-filter-variant</v-icon></v-btn></template><v-list dense><v-list-item @click="selectedClient = null" title="Mostrar Todos"></v-list-item><v-divider></v-divider><v-list-item v-for="client in uniqueClients" :key="client" :title="client" @click="selectedClient = client"></v-list-item></v-list></v-menu>
        </template>
        <template v-slot:header.type="{ column }">
          <v-menu offset-y><template v-slot:activator="{ props: menuProps }"><v-btn v-bind="menuProps" variant="text" size="small">{{ column.title }}<v-icon end :color="selectedType ? 'primary' : ''">mdi-filter-variant</v-icon></v-btn></template><v-list dense><v-list-item @click="selectedType = null" title="Mostrar Todos"></v-list-item><v-divider></v-divider><v-list-item v-for="typeOption in ['VENTA', 'COTIZACIÓN']" :key="typeOption" :title="typeOption" @click="selectedType = typeOption"></v-list-item></v-list></v-menu>
        </template>
        <template v-slot:header.actions="{ column }">
           <v-menu offset-y><template v-slot:activator="{ props: menuProps }"><v-btn v-bind="menuProps" variant="text" size="small">{{ column.title }}<v-icon end :color="selectedAction ? 'primary' : ''">mdi-filter-variant</v-icon></v-btn></template><v-list dense><v-list-item @click="selectedAction = null" title="Todas las Acciones"></v-list-item><v-divider></v-divider><v-list-item v-for="action in actionOptions" :key="action" :title="action" @click="selectedAction = action"></v-list-item></v-list></v-menu>
        </template>
        
        <template v-slot:item.quoteDate="{ item }"><span>{{ new Date(item.quoteDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span></template>
        <template v-slot:item.type="{ item }">
          <v-chip :color="item.type === 'VENTA' ? 'success' : 'info'" size="small" label>{{ item.type }}</v-chip>
        </template>
        <template v-slot:item.totalAmount="{ item }"><span class="font-weight-bold">{{ formatAsArs(item.totalAmount) }}</span></template>
        <template v-slot:item.depositAmount="{ item }"><span>{{ formatAsArs(item.depositAmount) }}</span></template>
        <template v-slot:item.installmentsInfo="{ item }"><span>{{ item.installmentsInfo }}</span></template>
        <template v-slot:item.products="{ item }"><span>{{ item.products.join(', ') }}</span></template>
        
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center justify-center ga-1">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" title="Editar Cliente"></v-btn>

            <div v-if="item.type === 'COTIZACIÓN'">
              <v-btn color="success" variant="text" size="small" @click="handleConversion(item)" :loading="isConverting && selectedRecordId === item.$id" :disabled="isConverting" title="Convertir a Venta">Convertir</v-btn>
            </div>
            <div v-else-if="item.isConverted">
              <v-tooltip location="top">
                <template v-slot:activator="{ props: tooltipProps }">
                  <v-chip v-bind="tooltipProps" color="grey" size="small" label variant="outlined"><v-icon start>mdi-check-decagram</v-icon>Convertida</v-chip>
                </template>
                <span v-if="item.conversionDate">Convertida el: {{ new Date(item.conversionDate).toLocaleDateString('es-AR') }}</span>
              </v-tooltip>
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <EditRecordDialog
    :show="editDialog"
    :record="recordToEdit"
    @close="editDialog = false"
    @save="handleUpdateRecord"
  />
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { ISavedRecord } from '~/composables/useSavedQuotes';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useFormatters } from '~/composables/useFormatters';
import { useSnackbar } from '~/composables/useSnackbar';
// ✅ Importamos el nuevo componente de diálogo
import EditRecordDialog from '~/components/EditRecordDialog.vue';

// ✅ Usamos la nueva función 'updateRecord' del composable
const { getRecords, savedRecords, isLoading, convertQuoteToSale, updateRecord } = useSavedQuotes();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle();
const { showSnackbar } = useSnackbar();

// --- ESTADO ---
const isConverting = ref(false);
const selectedRecordId = ref<string | null>(null);

// ✅ Nuevo estado para controlar el diálogo de edición
const editDialog = ref(false);
const recordToEdit = ref<ISavedRecord | null>(null);

// --- LÓGICA DE FILTROS ---
const selectedClient = ref<string | null>(null);
const selectedType = ref<'VENTA' | 'COTIZACIÓN' | null>(null);
const selectedAction = ref<'Convertible' | 'Ya Convertida' | null>(null);
const actionOptions = ['Convertible', 'Ya Convertida'];
const uniqueClients = computed(() => { const clients = new Set(savedRecords.value.map(r => r.clientName)); return Array.from(clients).sort(); });
const filteredRecords = computed(() => {
  let items = savedRecords.value;
  if (selectedClient.value) { items = items.filter(r => r.clientName === selectedClient.value); }
  if (selectedType.value) { items = items.filter(r => r.type === selectedType.value); }
  if (selectedAction.value) {
    if (selectedAction.value === 'Convertible') { items = items.filter(r => r.type === 'COTIZACIÓN'); } 
    else if (selectedAction.value === 'Ya Convertida') { items = items.filter(r => r.isConverted === true); }
  }
  return items;
});

// --- CONFIGURACIÓN DE LA TABLA ---
const headers = [
  { title: 'Fecha', key: 'quoteDate', sortable: true }, { title: 'Cliente', key: 'clientName', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true }, { title: 'Total', key: 'totalAmount', sortable: true, align: 'end' },
  { title: 'Depósito', key: 'depositAmount', sortable: true, align: 'end' }, { title: 'Cuotas', key: 'installmentsInfo', sortable: false },
  { title: 'Productos', key: 'products', sortable: false, width: '200px' }, { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
];

// --- CÁLCULOS Y MÉTODOS ---
const totalSales = computed(() => savedRecords.value.filter(r => r.type === 'VENTA').reduce((sum, record) => sum + record.totalAmount, 0));
const totalQuotes = computed(() => savedRecords.value.filter(r => r.type === 'COTIZACIÓN').reduce((sum, record) => sum + record.totalAmount, 0));

const handleConversion = async (record: ISavedRecord) => {
  selectedRecordId.value = record.$id;
  isConverting.value = true;
  try {
    await convertQuoteToSale(record.$id);
    showSnackbar({text: '¡Convertido a Venta con éxito!', color: 'success'});
  } catch (error) {
    console.error("Fallo la conversión", error);
    showSnackbar({text: 'Error al convertir el registro', color: 'error'});
  } finally {
    isConverting.value = false;
    selectedRecordId.value = null;
  }
};

// ✅ Nuevas funciones para el diálogo de edición
const openEditDialog = (record: ISavedRecord) => {
  recordToEdit.value = record;
  editDialog.value = true;
};

const handleUpdateRecord = async (updatedData: Partial<ISavedRecord>) => {
  if (!recordToEdit.value) return;
  try {
    await updateRecord(recordToEdit.value.$id, updatedData);
    showSnackbar({text: 'Registro actualizado con éxito', color: 'success'});
  } catch (error) {
    console.error("Fallo al actualizar", error);
    showSnackbar({text: 'Error al actualizar el registro', color: 'error'});
  } finally {
    editDialog.value = false;
  }
};

onMounted(() => {
  setTitle('Registros de Ventas y Cotizaciones');
  getRecords();
});
</script>
