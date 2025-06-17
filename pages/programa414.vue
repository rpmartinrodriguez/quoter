<template>
  <div>
    <v-card class="mb-8">
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-account-plus</v-icon>
        Cargar Referidos del Programa 4/14
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="sponsor" label="Nombre del Sponsor (Cliente que refiere)*" variant="outlined" class="mb-4"></v-text-field>
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
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedSponsor"
              :items="uniqueSponsors"
              label="Filtrar por Sponsor"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="Filtrar por Estado"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
      <v-data-table
        :headers="headers"
        :items="filteredReferrals"
        :loading="isLoading"
        item-value="$id"
        hover
        no-data-text="No hay referidos que coincidan con los filtros."
      >
        <template v-slot:item.loadDate="{ item }">
          <span>{{ new Date(item.loadDate).toLocaleDateString('es-AR') }}</span>
        </template>
        <template v-slot:item.status="{ item }">
          <v-select
            v-model="item.status"
            :items="statusOptions"
            @update:modelValue="(newStatus) => updateReferralStatus(item.$id, newStatus)"
            density="compact"
            hide-details
            variant="outlined"
            :bg-color="getStatusColor(item.status)"
            class="status-select"
          ></v-select>
        </template>
      </v-data-table>
    </v-card>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useReferrals, type IReferral } from '~/composables/useReferrals';
import { useSnackbar } from '~/composables/useSnackbar';

const { referrals, isLoading, addReferral, updateReferralStatus, getReferrals } = useReferrals();
const { showSnackbar } = useSnackbar();
const { setTitle } = usePageTitle();

const sponsor = ref('');
const isSaving = ref(false);
const newReferralsList = ref([{ referralName: '', phone: '', occupation: '', peopleCount: undefined as number | undefined }]);

// ✅ INICIO: NUEVO ESTADO Y LÓGICA PARA LOS FILTROS
const selectedSponsor = ref<string | null>(null);
const selectedStatus = ref<string | null>(null);

// Computada para generar una lista de sponsors únicos para el dropdown
const uniqueSponsors = computed(() => {
  const sponsors = new Set(referrals.value.map(r => r.sponsor));
  return Array.from(sponsors).sort();
});

// La computada principal que filtra la lista de referidos
const filteredReferrals = computed(() => {
  let items = referrals.value;

  if (selectedSponsor.value) {
    items = items.filter(r => r.sponsor === selectedSponsor.value);
  }
  if (selectedStatus.value) {
    items = items.filter(r => r.status === selectedStatus.value);
  }

  return items;
});
// ✅ FIN: NUEVO ESTADO Y LÓGICA PARA LOS FILTROS

const headers = [
  { title: 'Fecha de Carga', key: 'loadDate' },
  { title: 'Sponsor', key: 'sponsor' },
  { title: 'Referido', key: 'referralName' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Ocupación', key: 'occupation' },
  { title: 'Estado', key: 'status', width: '200px' },
];
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
      showSnackbar({ text: `Error al guardar a ${referral.referralName}: ${error.message}`, color: 'error' });
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
  // Nos aseguramos de que los datos se carguen al visitar la página
  getReferrals();
});
</script>

<style scoped>
.referral-form-item { border-color: rgba(0,0,0,0.12) !important; }
.status-select { border-radius: 4px; }
</style>
