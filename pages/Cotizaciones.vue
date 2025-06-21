<template>
  <v-card flat>
    <v-card-title class="d-flex align-center mb-4">
      <v-icon start>mdi-format-list-checks</v-icon>
      Registros de Ventas y Cotizaciones
    </v-card-title>
    
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="filteredRecords"
        :loading="isLoading"
        item-value="$id"
        hover
        class="mt-2"
        no-data-text="No hay registros que coincidan con los filtros."
      >
        <template v-slot:item.quoteDate="{ item }">
          <span>{{ new Date(item.quoteDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</span>
        </template>
        <template v-slot:item.followUpDate="{ item }">
          <v-chip v-if="item.followUpDate" :color="getFollowUpColor(item.followUpDate)" size="small" variant="tonal">
            <v-icon start size="small">mdi-calendar-clock</v-icon>
            {{ new Date(item.followUpDate).toLocaleDateString('es-AR') }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center justify-center ga-1">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" title="Editar Cliente"></v-btn>
            <v-btn
              v-if="item.type === 'COTIZACIÓN'"
              icon="mdi-calendar-clock"
              size="small"
              variant="text"
              @click="openFollowUpDialog(item)"
              title="Agendar Seguimiento"
              :color="item.followUpDate ? 'primary' : 'default'"
            ></v-btn>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="openDeleteDialog(item)" title="Eliminar Registro"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <v-dialog v-model="followUpDialog.show" persistent max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Agendar Seguimiento</span>
      </v-card-title>
      <v-card-subtitle v-if="followUpDialog.record">
        Para la cotización de: {{ followUpDialog.record.clientName }}
      </v-card-subtitle>
      <v-card-text>
        <v-container>
          <v-text-field
            v-model="followUpDialog.date"
            label="Fecha de Próximo Contacto"
            type="date"
            required
          ></v-text-field>
          <v-textarea
            v-model="followUpDialog.notes"
            label="Notas para el seguimiento"
            rows="4"
            hint="Ej: Cliente pidió que lo llame para confirmar."
          ></v-textarea>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="followUpDialog.show = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="saveFollowUp" :disabled="!followUpDialog.date">Guardar Seguimiento</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import type { ISavedRecord } from '~/composables/useSavedQuotes';
// ... (Tus otros imports no cambian)
import { useSnackbar } from '~/composables/useSnackbar';
import EditRecordDialog from '~/components/EditRecordDialog.vue'; // Asumimos que sigue existiendo

// ✅ La llamada al composable no cambia, ya que usamos la misma función 'updateRecord'
const { getRecords, savedRecords, isLoading, convertQuoteToSale, updateRecord, deleteRecord } = useSavedQuotes();
const { showSnackbar } = useSnackbar();
// ... (El resto de tus composables y estado)

// ✅ Se añade una nueva columna 'followUpDate' a los headers
const headers = [
  { title: 'Fecha', key: 'quoteDate', sortable: true },
  { title: 'Cliente', key: 'clientName', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Próximo Seguimiento', key: 'followUpDate', sortable: true },
  { title: 'Total', key: 'totalAmount', sortable: true, align: 'end' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
];

// ✅ Nuevo estado y funciones para el diálogo de seguimiento
const followUpDialog = reactive({
  show: false,
  record: null as ISavedRecord | null,
  date: '',
  notes: '',
});

const openFollowUpDialog = (record: ISavedRecord) => {
  followUpDialog.record = record;
  // Pre-rellena el form si ya existen datos de seguimiento
  followUpDialog.date = record.followUpDate ? new Date(record.followUpDate).toISOString().substr(0, 10) : '';
  followUpDialog.notes = record.followUpNotes || '';
  followUpDialog.show = true;
};

const saveFollowUp = async () => {
  if (!followUpDialog.record || !followUpDialog.date) return;
  
  try {
    const dataToUpdate = {
      // Convertimos la fecha a formato ISO para guardarla en Appwrite
      followUpDate: new Date(followUpDialog.date).toISOString(),
      followUpNotes: followUpDialog.notes,
    };
    await updateRecord(followUpDialog.record.$id, dataToUpdate);
    showSnackbar({ text: 'Seguimiento guardado con éxito.' });
  } catch (error) {
    showSnackbar({ text: 'Error al guardar el seguimiento.', color: 'error' });
  } finally {
    followUpDialog.show = false;
  }
};

const getFollowUpColor = (dateString: string) => {
  if (!dateString) return 'default';
  const today = new Date();
  const followUpDate = new Date(dateString);
  today.setHours(0, 0, 0, 0);
  followUpDate.setHours(0, 0, 0, 0);

  if (followUpDate < today) return 'error'; // Vencido
  if (followUpDate.getTime() === today.getTime()) return 'warning'; // Es hoy
  return 'primary'; // A futuro
};

// ... (El resto de tu script no necesita cambios)
</script>
