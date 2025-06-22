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
          <v-select v-model="selectedClient" :items="uniqueClients" label="Filtrar por Cliente" variant="outlined" density="compact" clearable hide-details></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="selectedType" :items="['VENTA', 'COTIZACIÓN']" label="Filtrar por Tipo" variant="outlined" density="compact" clearable hide-details></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="selectedAction" :items="actionOptions" label="Filtrar por Acción" variant="outlined" density="compact" clearable hide-details></v-select>
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
        <template v-slot:item.type="{ item }"><v-chip :color="item.type === 'VENTA' ? 'success' : 'info'" size="small" label>{{ item.type }}</v-chip></template>
        <template v-slot:item.totalAmount="{ item }"><span class="font-weight-bold">{{ formatAsArs(item.totalAmount) }}</span></template>
        <template v-slot:item.depositAmount="{ item }"><span>{{ formatAsArs(item.depositAmount) }}</span></template>
        <template v-slot:item.installmentsInfo="{ item }"><span>{{ item.installmentsInfo }}</span></template>
        <template v-slot:item.products="{ item }"><span>{{ item.products.join(', ') }}</span></template>
        <template v-slot:item.followUpDate="{ item }">
          <v-chip v-if="item.followUpDate" :color="getFollowUpColor(item.followUpDate)" size="small" variant="tonal">
            <v-icon start size="small">mdi-calendar-clock</v-icon>
            {{ new Date(item.followUpDate).toLocaleDateString('es-AR', {timeZone: 'UTC'}) }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center justify-end ga-1">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" title="Editar Cliente"></v-btn>
            <v-btn v-if="item.type === 'COTIZACIÓN'" icon="mdi-calendar-clock" size="small" variant="text" @click="openFollowUpDialog(item)" title="Agendar Seguimiento" :color="item.followUpDate ? 'primary' : 'default'"></v-btn>
            <v-btn v-if="item.type === 'COTIZACIÓN'" icon="mdi-swap-horizontal-bold" color="success" size="small" variant="text" @click="handleConversion(item)" :loading="isConverting && selectedRecordId === item.$id" :disabled="isConverting" title="Convertir a Venta"></v-btn>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="openDeleteDialog(item)" title="Eliminar Registro"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <EditRecordDialog :show="editDialog" :record="recordToEdit" @close="editDialog = false" @save="handleUpdateRecord" />
  <v-dialog v-model="deleteDialog.show" persistent max-width="400">
    <v-card class="text-center pa-4"><v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon><h3 class="text-h5 font-weight-bold mb-2">Confirmar Eliminación</h3>
      <p v-if="deleteDialog.record" class="body-1 text-medium-emphasis">¿Estás seguro de que querés eliminar el registro de <strong>{{ deleteDialog.record.clientName }}</strong>? Esta acción no se puede deshacer.</p>
      <v-card-actions class="d-flex justify-center ga-3 mt-4"><v-btn color="grey" variant="tonal" @click="deleteDialog.show = false">Cancelar</v-btn><v-btn color="error" variant="flat" @click="confirmDelete">Sí, Eliminar</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="followUpDialog.show" persistent max-width="500px">
    <v-card>
      <v-card-title><span class="text-h5">Agendar Seguimiento</span></v-card-title>
      <v-card-subtitle v-if="followUpDialog.record">Para la cotización de: {{ followUpDialog.record.clientName }}</v-card-subtitle>
      <v-card-text class="py-4">
        <v-container>
          <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom">
            <template v-slot:activator="{ props }">
              <v-text-field :model-value="formattedFollowUpDate" label="Fecha de Próximo Contacto*" prepend-inner-icon="mdi-calendar" readonly v-bind="props" variant="outlined"></v-text-field>
            </template>
            <v-date-picker v-model="followUpDialog.date" @update:model-value="dateMenu = false" hide-actions title=""></v-date-picker>
          </v-menu>
          <v-textarea v-model="followUpDialog.notes" label="Notas para el seguimiento" rows="4" hint="Ej: Cliente pidió que lo llame para confirmar." variant="outlined" class="mt-4"></v-textarea>
        </v-container>
        <small>*indica campo requerido</small>
      </v-card-text>
      <v-card-actions><v-spacer></v-spacer><v-btn text @click="followUpDialog.show = false">Cancelar</v-btn><v-btn color="primary" variant="flat" @click="saveFollowUp" :disabled="!followUpDialog.date">Guardar Seguimiento</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import type { ISavedRecord } from '~/composables/useSavedQuotes';
import { usePageTitle } from '~/composables/usePageTitle';
import { useSavedQuotes } from '~/composables/useSavedQuotes';
import { useFormatters } from '~/composables/useFormatters';
import { useSnackbar } from '~/composables/useSnackbar';
import EditRecordDialog from '~/components/EditRecordDialog.vue';

const { getRecords, savedRecords, isLoading, convertQuoteToSale, updateRecord, deleteRecord } = useSavedQuotes();
const { formatAsArs } = useFormatters();
const { setTitle } = usePageTitle();
const { showSnackbar } = useSnackbar();

const isConverting = ref(false);
const selectedRecordId = ref<string | null>(null);
const editDialog = ref(false);
const recordToEdit = ref<ISavedRecord | null>(null);
const deleteDialog = reactive({ show: false, record: null as ISavedRecord | null });
const dateMenu = ref(false);
const followUpDialog = reactive<{
  show: boolean; record: ISavedRecord | null; date: Date | null; notes: string;
}>({ show: false, record: null, date: null, notes: '' });

const selectedClient = ref<string | null>(null);
const selectedType = ref<'VENTA' | 'COTIZACIÓN' | null>(null);
const selectedAction = ref<'Convertible' | 'Ya Convertida' | null>(null);
const actionOptions = ['Convertible', 'Ya Convertida'];
const uniqueClients = computed(() => { const clients = new Set(savedRecords.value.map(r => r.clientName)); return Array.from(clients).sort(); });
const filteredRecords = computed(() => {
  let items = savedRecords.value;
  if (selectedClient.value) items = items.filter(r => r.clientName === selectedClient.value);
  if (selectedType.value) items = items.filter(r => r.type === selectedType.value);
  if (selectedAction.value) {
    if (selectedAction.value === 'Convertible') { items = items.filter(r => r.type === 'COTIZACIÓN' && !r.isConverted); } 
    else if (selectedAction.value === 'Ya Convertida') { items = items.filter(r => r.isConverted === true); }
  }
  return items;
});

// ✅ LISTA DE CABECERAS COMPLETA Y CORREGIDA
const headers = [
  { title: 'Fecha', key: 'quoteDate', sortable: true },
  { title: 'Cliente', key: 'clientName', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Próximo Seguimiento', key: 'followUpDate', sortable: true },
  { title: 'Total', key: 'totalAmount', sortable: true, align: 'end' },
  { title: 'Depósito', key: 'depositAmount', sortable: false, align: 'end' },
  { title: 'Cuotas', key: 'installmentsInfo', sortable: false },
  { title: 'Productos', key: 'products', sortable: false, width: '200px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
];

const totalSales = computed(() => savedRecords.value.filter(r => r.type === 'VENTA').reduce((sum, r) => sum + r.totalAmount, 0));
const totalQuotes = computed(() => savedRecords.value.filter(r => r.type === 'COTIZACIÓN').reduce((sum, r) => sum + r.totalAmount, 0));

const handleConversion = async (record: ISavedRecord) => {
  selectedRecordId.value = record.$id; isConverting.value = true;
  try {
    await convertQuoteToSale(record.$id);
    showSnackbar({text: '¡Convertido a Venta con éxito!', color: 'success'});
  } catch (error) { showSnackbar({text: 'Error al convertir el registro', color: 'error'}); }
  finally { isConverting.value = false; selectedRecordId.value = null; }
};

const openEditDialog = (record: ISavedRecord) => { recordToEdit.value = record; editDialog.value = true; };
const handleUpdateRecord = async (updatedData: Partial<ISavedRecord>) => {
  if (!recordToEdit.value) return;
  try {
    await updateRecord(recordToEdit.value.$id, updatedData);
    showSnackbar({text: 'Registro actualizado con éxito', color: 'success'});
  } catch (error) { showSnackbar({text: 'Error al actualizar el registro', color: 'error'}); }
  finally { editDialog.value = false; }
};

const openDeleteDialog = (record: ISavedRecord) => { deleteDialog.record = record; deleteDialog.show = true; };
const confirmDelete = async () => {
  if (!deleteDialog.record) return;
  try {
    await deleteRecord(deleteDialog.record.$id);
    showSnackbar({text: 'Registro eliminado.'});
  } catch (error) { showSnackbar({text: 'Error al eliminar.', color: 'error'}); }
  finally { deleteDialog.show = false; }
};

const openFollowUpDialog = (record: ISavedRecord) => {
  followUpDialog.record = record;
  followUpDialog.date = record.followUpDate ? new Date(record.followUpDate) : null;
  followUpDialog.notes = record.followUpNotes || '';
  followUpDialog.show = true;
};
const formattedFollowUpDate = computed(() => {
  return followUpDialog.date ? followUpDialog.date.toLocaleDateString('es-AR', {timeZone: 'UTC'}) : '';
});
const saveFollowUp = async () => {
  if (!followUpDialog.record || !followUpDialog.date) return;
  try {
    const dataToUpdate = {
      followUpDate: followUpDialog.date.toISOString(),
      followUpNotes: followUpDialog.notes,
    };
    await updateRecord(followUpDialog.record.$id, dataToUpdate);
    showSnackbar({ text: 'Seguimiento guardado con éxito.' });
  } catch (error) { showSnackbar({ text: 'Error al guardar el seguimiento.', color: 'error' }); }
  finally { followUpDialog.show = false; }
};

const getFollowUpColor = (dateString?: string) => {
  if (!dateString) return undefined;
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const followUpDate = new Date(dateString); followUpDate.setUTCHours(0, 0, 0, 0);
  if (followUpDate < today) return 'error';
  if (followUpDate.getTime() === today.getTime()) return 'warning';
  return 'primary';
};

onMounted(() => {
  setTitle('Registros de Ventas y Cotizaciones');
  getRecords();
});
</script>
