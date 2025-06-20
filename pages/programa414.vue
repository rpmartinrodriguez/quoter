<template>
  <div>
    <v-card class="mb-8">
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-account-plus</v-icon>
        Cargar Referidos del Programa 4/14
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="sponsor"
          label="Nombre del Sponsor (Cliente que refiere)*"
          variant="outlined"
          class="mb-4"
        ></v-text-field>
        <v-divider></v-divider>
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
        <div class="d-flex ga-4 mt-4">
          <v-btn @click="addReferralForm" prepend-icon="mdi-plus" color="secondary" variant="outlined">Añadir Otro Referido</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="handleSaveAllReferrals" color="success" size="large" prepend-icon="mdi-content-save-all" :disabled="!isFormValid" :loading="isSaving">Guardar Todos</v-btn>
        </div>
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
      <v-data-table
        :headers="headers"
        :items="filteredReferrals"
        :loading="isLoading"
        item-value="$id"
        hover
        no-data-text="Aún no hay referidos cargados."
      >
        <template v-slot:header.sponsor="{ column }">
          <v-menu offset-y><template v-slot:activator="{ props: menuProps }"><v-btn v-bind="menuProps" variant="text" size="small">{{ column.title }}<v-icon end :color="selectedSponsor ? 'primary' : ''">mdi-filter-variant</v-icon></v-btn></template><v-list dense><v-list-item @click="selectedSponsor = null" title="Mostrar Todos"></v-list-item><v-divider></v-divider><v-list-item v-for="sponsorName in uniqueSponsors" :key="sponsorName" @click="selectedSponsor = sponsorName" :title="sponsorName"></v-list-item></v-list></v-menu>
        </template>
        <template v-slot:header.status="{ column }">
          <v-menu offset-y><template v-slot:activator="{ props: menuProps }"><v-btn v-bind="menuProps" variant="text" size="small">{{ column.title }}<v-icon end :color="selectedStatus ? 'primary' : ''">mdi-filter-variant</v-icon></v-btn></template><v-list dense><v-list-item @click="selectedStatus = null" title="Mostrar Todos"></v-list-item><v-divider></v-divider><v-list-item v-for="statusName in statusOptions" :key="statusName" @click="selectedStatus = statusName" :title="statusName"></v-list-item></v-list></v-menu>
        </template>
        <template v-slot:item.loadDate="{ item }"><span>{{ new Date(item.loadDate).toLocaleDateString('es-AR') }}</span></template>
        <template v-slot:item.status="{ item }">
          <v-select
            v-model="item.status"
            :items="statusOptions"
            @update:modelValue="(newStatus) => updateReferralStatus(item.$id, newStatus as IReferral['status'])"
            density="compact"
            hide-details
            variant="outlined"
            :bg-color="getStatusColor(item.status)"
            class="status-select"
          ></v-select>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" title="Editar Referido"></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <EditReferralDialog
      :show="editDialog"
      :referral="recordToEdit"
      @close="editDialog = false"
      @save="handleUpdateReferral"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useReferrals, type IReferral } from '~/composables/useReferrals';
import { useSnackbar } from '~/composables/useSnackbar';
// ✅ Importamos el nuevo componente de diálogo
import EditReferralDialog from '~/components/EditReferralDialog.vue';

// ✅ Usamos la nueva función 'updateReferralData'
const { referrals, isLoading, addReferral, updateReferralStatus, getReferrals, updateReferralData } = useReferrals();
const { showSnackbar } = useSnackbar();
const { setTitle } = usePageTitle();

const sponsor = ref('');
const isSaving = ref(false);
const newReferralsList = ref([{ referralName: '', phone: '', occupation: '', peopleCount: undefined as number | undefined }]);
const selectedSponsor = ref<string | null>(null);
const selectedStatus = ref<string | null>(null);

// ✅ Nuevo estado y funciones para el diálogo de edición
const editDialog = ref(false);
const recordToEdit = ref<IReferral | null>(null);

const openEditDialog = (referral: IReferral) => {
  recordToEdit.value = referral;
  editDialog.value = true;
};

const handleUpdateReferral = async (updatedData: Partial<IReferral>) => {
  if (!recordToEdit.value) return;
  try {
    // La lógica de actualización ahora llama a la nueva función
    await updateReferralData(recordToEdit.value.$id, updatedData);
    showSnackbar({text: 'Referido actualizado con éxito', color: 'success'});
  } catch (error) {
    showSnackbar({text: 'Error al actualizar el referido', color: 'error'});
    console.error("Fallo al actualizar", error);
  } finally {
    editDialog.value = false;
  }
};
// ✅ FIN de la nueva lógica de edición

const uniqueSponsors = computed(() => { /* ... sin cambios ... */ });
const filteredReferrals = computed(() => { /* ... sin cambios ... */ });

// ✅ Se añade la nueva columna de 'Acciones'
const headers = [
  { title: 'Fecha de Carga', key: 'loadDate' },
  { title: 'Sponsor', key: 'sponsor' },
  { title: 'Referido', key: 'referralName' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Ocupación', key: 'occupation' },
  { title: 'Estado', key: 'status', width: '200px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
];
const statusOptions = ['Pendiente', 'Demo', 'No Acepta', 'No Contesta'];

const isFormValid = computed(() => sponsor.value.trim() !== '' && newReferralsList.value.every(r => r.referralName.trim() !== ''));
const addReferralForm = () => { newReferralsList.value.push({ referralName: '', phone: '', occupation: '', peopleCount: undefined }); };
const removeReferralForm = (index: number) => { newReferralsList.value.splice(index, 1); };
const handleSaveAllReferrals = async () => { /* ... sin cambios ... */ };
const getStatusColor = (status: IReferral['status']) => { /* ... sin cambios ... */ };

onMounted(() => {
  setTitle('Programa 4/14');
  getReferrals();
});
</script>

<style scoped>
.referral-form-item { border-color: rgba(0,0,0,0.12) !important; }
.status-select { border-radius: 4px; }
</style>
