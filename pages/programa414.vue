<template>
  <div>
    <v-card class="mb-8">
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-account-plus</v-icon>
        Cargar Referidos del Programa 4/14
      </v-card-title>
      <v-card-text>
        <v-autocomplete
          v-model="sponsor"
          :items="uniqueClientNames"
          label="Buscar o escribir nombre del Sponsor*"
          variant="outlined"
          class="mb-4"
          hide-details
        >
          <template v-slot:no-data>
            <v-list-item>
              <v-list-item-title>
                Escribí un nombre para usarlo como Sponsor.
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-autocomplete>
        <v-divider class="mt-6"></v-divider>
        <div class="text-overline my-4">Añadir Referidos</div>
        <div v-for="(referral, index) in newReferralsList" :key="index" class="referral-form-item my-4 pa-4 border rounded">
          <div class="d-flex justify-space-between align-center mb-2">
            <h4 class="text-h6">Referido #{{ index + 1 }}</h4>
            <v-btn v-if="newReferralsList.length > 1" icon="mdi-delete" size="small" variant="tonal" color="error" @click="removeReferralForm(index)"></v-btn>
          </div>
          <v-row>
            <v-col cols="12" md="6"><v-text-field v-model="referral.referralName" label="Nombre y Apellido*" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="referral.phone" label="Teléfono" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="referral.occupation" label="Ocupación" density="compact" variant="outlined"></v-text-field></v-col>
            <v-col cols="12" md="6"><v-text-field v-model.number="referral.peopleCount" label="Cantidad de Personas" type="number" density="compact" variant="outlined"></v-text-field></v-col>
          </v-row>
        </div>
        <v-card-actions class="pa-0 mt-4">
          <v-btn @click="addReferralForm" prepend-icon="mdi-plus" color="secondary" variant="text">Añadir Otro Referido</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="handleSaveAllReferrals" color="success" size="large" variant="flat" prepend-icon="mdi-content-save-all" :disabled="!isFormValid" :loading="isSaving">Guardar Todos</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
    
    <v-card>
      <v-card-title>Listado de Referidos Cargados</v-card-title>
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" md="4"><v-select v-model="selectedSponsor" :items="uniqueSponsors" label="Filtrar por Sponsor" variant="outlined" density="compact" clearable hide-details></v-select></v-col>
          <v-col cols="12" md="4"><v-select v-model="selectedStatus" :items="statusOptions" label="Filtrar por Estado" variant="outlined" density="compact" clearable hide-details></v-select></v-col>
        </v-row>
      </v-card-text>
      <v-data-table :headers="headers" :items="filteredReferrals" :loading="isLoading" item-value="$id" hover no-data-text="Aún no hay referidos cargados.">
        <template v-slot:header.sponsor="{ column }"><v-menu offset-y><template v-slot:activator="{ props: menuProps }"><v-btn v-bind="menuProps" variant="text" size="small">{{ column.title }}<v-icon end :color="selectedSponsor ? 'primary' : ''">mdi-filter-variant</v-icon></v-btn></template><v-list dense><v-list-item @click="selectedSponsor = null" title="Mostrar Todos"></v-list-item><v-divider></v-divider><v-list-item v-for="sponsorName in uniqueSponsors" :key="sponsorName" @click="selectedSponsor = sponsorName" :title="sponsorName"></v-list-item></v-list></v-menu></template>
        <template v-slot:header.status="{ column }"><v-menu offset-y><template v-slot:activator="{ props: menuProps }"><v-btn v-bind="menuProps" variant="text" size="small">{{ column.title }}<v-icon end :color="selectedStatus ? 'primary' : ''">mdi-filter-variant</v-icon></v-btn></template><v-list dense><v-list-item @click="selectedStatus = null" title="Mostrar Todos"></v-list-item><v-divider></v-divider><v-list-item v-for="statusName in statusOptions" :key="statusName" @click="selectedStatus = statusName" :title="statusName"></v-list-item></v-list></v-menu></template>
        <template v-slot:item.loadDate="{ item }"><span>{{ new Date(item.loadDate).toLocaleDateString('es-AR') }}</span></template>
        <template v-slot:item.status="{ item }"><v-select v-model="item.status" :items="statusOptions" @update:modelValue="(newStatus) => updateReferralStatus(item.$id, newStatus as IReferral['status'])" density="compact" hide-details variant="outlined" :bg-color="getStatusColor(item.status)" class="status-select"></v-select></template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center justify-center ga-1">
            <v-btn icon="mdi-note-text-outline" size="small" variant="text" @click="openFollowUpDialog(item)" title="Ver/Editar Notas y Seguimiento"></v-btn>
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" title="Editar Referido"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <EditReferralDialog :show="editDialog" :referral="recordToEdit" @close="editDialog = false" @save="handleUpdateReferral" />
    <v-dialog v-model="followUpDialog.show" persistent max-width="500px">
      <v-card>
        <v-card-title><span class="text-h5">Seguimiento de: {{ followUpDialog.referral?.referralName }}</span></v-card-title>
        <v-card-text class="py-4">
          <v-container>
            <v-textarea v-model="followUpDialog.notes" label="Notas de seguimiento" rows="10" variant="outlined" hint="Escribí acá los detalles de tus conversaciones."></v-textarea>
            <v-text-field v-model="followUpDialog.date" label="Próximo Contacto" type="date" class="mt-2"></v-text-field>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="followUpDialog.show = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="saveFollowUp">Guardar Seguimiento</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useReferrals, type IReferral } from '~/composables/useReferrals';
import { useSnackbar } from '~/composables/useSnackbar';
import EditReferralDialog from '~/components/EditReferralDialog.vue';
import { useSavedQuotes } from '~/composables/useSavedQuotes';

const { referrals, isLoading, addReferral, updateReferralStatus, getReferrals, updateReferralData } = useReferrals();
const { savedRecords } = useSavedQuotes();
const { showSnackbar } = useSnackbar();
const { setTitle } = usePageTitle();

const sponsor = ref('');
const isSaving = ref(false);
const newReferralsList = ref([{ referralName: '', phone: '', occupation: '', peopleCount: undefined as number | undefined }]);
const selectedSponsor = ref<string | null>(null);
const selectedStatus = ref<string | null>(null);
const editDialog = ref(false);
const recordToEdit = ref<IReferral | null>(null);
const followUpDialog = reactive({ show: false, referral: null as IReferral | null, date: '', notes: '' });

const openEditDialog = (referral: IReferral) => { recordToEdit.value = referral; editDialog.value = true; };
const handleUpdateReferral = async (updatedData: Partial<IReferral>) => {
  if (!recordToEdit.value) return;
  try {
    await updateReferralData(recordToEdit.value.$id, updatedData);
    showSnackbar({text: 'Referido actualizado con éxito', color: 'success'});
  } catch (error) {
    showSnackbar({text: 'Error al actualizar el referido', color: 'error'});
  } finally {
    editDialog.value = false;
  }
};

const openFollowUpDialog = (referral: IReferral) => {
  followUpDialog.referral = referral;
  followUpDialog.date = referral.followUpDate ? new Date(referral.followUpDate).toISOString().substr(0, 10) : '';
  followUpDialog.notes = referral.followUpNotes || '';
  followUpDialog.show = true;
};

// ✅ --- FUNCIÓN DE GUARDADO DE SEGUIMIENTO CON ALERTA DE DIAGNÓSTICO ---
const saveFollowUp = async () => {
  if (!followUpDialog.referral) return;
  try {
    const dataToUpdate = {
      followUpDate: followUpDialog.date ? new Date(followUpDialog.date).toISOString() : undefined,
      followUpNotes: followUpDialog.notes
    };
    await updateReferralData(followUpDialog.referral.$id, dataToUpdate);
    showSnackbar({ text: 'Seguimiento guardado.' });
  } catch (error: any) {
    console.error("Fallo al guardar seguimiento", error);
    // Esta alerta nos dirá el error exacto que devuelve Appwrite
    alert(`ERROR AL GUARDAR EL SEGUIMIENTO:\n\n${error.message}`);
  } finally {
    followUpDialog.show = false;
  }
};

const uniqueClientNames = computed(() => { const clientNames = new Set(savedRecords.value.map(r => r.clientName)); return Array.from(clientNames).sort(); });
const uniqueSponsors = computed(() => { const sponsors = new Set(referrals.value.map(r => r.sponsor)); return Array.from(sponsors).sort(); });
const filteredReferrals = computed(() => {
  let items = referrals.value;
  if (selectedSponsor.value) { items = items.filter(r => r.sponsor === selectedSponsor.value); }
  if (selectedStatus.value) { items = items.filter(r => r.status === selectedStatus.value); }
  return items;
});
const headers = [ { title: 'Fecha de Carga', key: 'loadDate' }, { title: 'Sponsor', key: 'sponsor' }, { title: 'Referido', key: 'referralName' }, { title: 'Teléfono', key: 'phone' }, { title: 'Ocupación', key: 'occupation' }, { title: 'Estado', key: 'status', width: '200px' }, { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }, ];
const statusOptions = ['Pendiente', 'Demo', 'No Acepta', 'No Contesta'];
const isFormValid = computed(() => sponsor.value.trim() !== '' && newReferralsList.value.every(r => r.referralName.trim() !== ''));
const addReferralForm = () => { newReferralsList.value.push({ referralName: '', phone: '', occupation: '', peopleCount: undefined }); };
const removeReferralForm = (index: number) => { newReferralsList.value.splice(index, 1); };
const handleSaveAllReferrals = async () => {
  if (!isFormValid.value) return;
  isSaving.value = true;
  const sponsorName = sponsor.value;
  let successfulSaves = 0;
  for (const referral of newReferralsList.value) {
    try {
      await addReferral({ ...referral, sponsor: sponsorName });
      successfulSaves++;
    } catch (error: any) {
      showSnackbar({ text: `Error al guardar a "${referral.referralName}": ${error.message}`, color: 'error' });
    }
  }
  if (successfulSaves > 0) {
    await getReferrals();
    showSnackbar({ text: `${successfulSaves} referidos guardados con éxito.` });
  }
  isSaving.value = false;
  newReferralsList.value = [{ referralName: '', phone: '', occupation: '', peopleCount: undefined }];
  sponsor.value = '';
};
const getStatusColor = (status: IReferral['status']) => {
  switch (status) {
    case 'Demo': return 'green-lighten-4';
    case 'No Acepta': return 'red-lighten-4';
    case 'No Contesta': return 'orange-lighten-4';
    default: return 'blue-lighten-4';
  }
};
onMounted(() => {
  setTitle('Programa 4/14');
  getReferrals();
});
</script>

<style scoped>
.referral-form-item { border-color: rgba(0,0,0,0.12) !important; }
.status-select { border-radius: 4px; }
</style>
