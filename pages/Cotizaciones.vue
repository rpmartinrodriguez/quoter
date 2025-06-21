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
        
        <template v-slot:item.quoteDate="{ item }"><span>{{ new Date(item.quoteDate).toLocaleDateString('es-AR') }}</span></template>
        <template v-slot:item.type="{ item }"> <v-chip :color="item.type === 'VENTA' ? 'success' : 'info'" size="small" label>{{ item.type }}</v-chip></template>
        <template v-slot:item.totalAmount="{ item }"><span class="font-weight-bold">{{ formatAsArs(item.totalAmount) }}</span></template>
        <template v-slot:item.products="{ item }"><span>{{ item.products.join(', ') }}</span></template>
        <template v-slot:item.followUpDate="{ item }">
          <v-chip v-if="item.followUpDate" :color="getFollowUpColor(item.followUpDate)" size="small" variant="tonal">
            <v-icon start size="small">mdi-calendar-clock</v-icon>
            {{ new Date(item.followUpDate).toLocaleDateString('es-AR') }}
          </v-chip>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center justify-center ga-1">
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
      <v-card-actions class="d-flex justify-center ga-3 mt-4">
        <v-btn color="grey" variant="tonal" @click="deleteDialog.show = false">Cancelar</v-btn>
        <v-btn color="error" variant="flat" @click="confirmDelete">Sí, Eliminar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="followUpDialog.show" persistent max-width="500px">
    <v-card><v-card-title><span class="text-h5">Agendar Seguimiento</span></v-card-title>
      <v-card-subtitle v-if="followUpDialog.record">Para la cotización de: {{ followUpDialog.record.clientName }}</v-card-subtitle>
      <v-card-text><v-container><v-text-field v-model="followUpDialog.date" label="Fecha de Próximo Contacto" type="date" required></v-text-field><v-textarea v-model="followUpDialog.notes" label="Notas para el seguimiento" rows="4" hint="Ej: Cliente pidió que lo llame para confirmar."></v-textarea></v-container></v-card-text>
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
const followUpDialog = reactive({ show: false, record: null as ISavedRecord | null, date: '', notes: '' });

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
    if (selectedAction.value === 'Convertible') items = items.filter(r => r.type === 'COTIZACIÓN');
    else if (selectedAction.value === 'Ya Convertida') items = items.filter(r => r.isConverted === true);
  }
  return items;
});

const headers = [
  { title: 'Fecha', key: 'quoteDate' }, { title: 'Cliente', key: 'clientName' }, { title: 'Tipo', key: 'type' },
  { title: 'Próximo Seguimiento', key: 'followUpDate' }, { title: 'Total', key: 'totalAmount', align: 'end' },
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
  followUpDialog.date = record.followUpDate ? new Date(record.followUpDate).toISOString().substr(0, 10) : '';
  followUpDialog.notes = record.followUpNotes || '';
  followUpDialog.show = true;
};
const saveFollowUp = async () => {
  if (!followUpDialog.record || !followUpDialog.date) return;
  try {
    const dataToUpdate = {
      followUpDate: new Date(followUpDialog.date).toISOString(),
      followUpNotes: followUpDialog.notes,
    };
    await updateRecord(followUpDialog.record.$id, dataToUpdate);
    showSnackbar({ text: 'Seguimiento guardado con éxito.' });
  } catch (error) { showSnackbar({ text: 'Error al guardar el seguimiento.', color: 'error' }); }
  finally { followUpDialog.show = false; }
};
const getFollowUpColor = (dateString: string) => {
  if (!dateString) return 'default';
  const today = new Date(); const followUpDate = new Date(dateString);
  today.setHours(0, 0, 0, 0); followUpDate.setHours(0, 0, 0, 0);
  if (followUpDate < today) return 'error';
  if (followUpDate.getTime() === today.getTime()) return 'warning';
  return 'primary';
};

onMounted(() => {
  setTitle('Registros de Ventas y Cotizaciones');
  getRecords();
});
</script>
