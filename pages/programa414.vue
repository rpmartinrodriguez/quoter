// pages/programa414.vue
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
          <v-btn @click="addReferralForm" prepend-icon="mdi-plus" color="secondary" variant="outlined">
            Añadir Otro Referido
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            @click="handleSaveAllReferrals" 
            color="success" 
            size="large" 
            prepend-icon="mdi-content-save-all"
            :disabled="!isFormValid"
            :loading="isSaving"
          >
            Guardar Todos
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    
    <v-card>
      <v-card-title>Listado de Referidos Cargados</v-card-title>
      <v-data-table
        :headers="headers"
        :items="referrals"
        :loading="isLoading"
        item-value="$id"
        hover
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
            :color="getStatusColor(item.status)"
          ></v-select>
        </template>
      </v-data-table>
    </v-card>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useReferrals, type IReferral } from '~/composables/useReferrals';

const { referrals, isLoading, addReferral, updateReferralStatus } = useReferrals();
const { showSnackbar } = useSnackbar();

const sponsor = ref('');
const isSaving = ref(false);
const newReferralsList = ref([{ referralName: '', phone: '', occupation: '', peopleCount: undefined }]);

const headers = [
  { title: 'Fecha de Carga', key: 'loadDate' },
  { title: 'Sponsor', key: 'sponsor' },
  { title: 'Referido', key: 'referralName' },
  { title: 'Teléfono', key: 'phone' },
  { title: 'Ocupación', key: 'occupation' },
  { title: 'Estado', key: 'status', width: '200px' },
];
const statusOptions = ['Pendiente', 'Demo', 'No Acepta', 'No Contesta'];

const isFormValid = computed(() => {
  return sponsor.value.trim() !== '' && newReferralsList.value.every(r => r.referralName.trim() !== '');
});

const addReferralForm = () => {
  newReferralsList.value.push({ referralName: '', phone: '', occupation: '', peopleCount: undefined });
};

const removeReferralForm = (index: number) => {
  newReferralsList.value.splice(index, 1);
};

const handleSaveAllReferrals = async () => {
  if (!isFormValid.value) return;

  isSaving.value = true;
  const sponsorName = sponsor.value;
  let successfulSaves = 0;
  
  for (const referral of newReferralsList.value) {
    try {
      await addReferral({ ...referral, sponsor: sponsorName });
      successfulSaves++;
    } catch (error) {
      showSnackbar({ text: `Error al guardar a ${referral.referralName}`, color: 'error' });
    }
  }

  isSaving.value = false;
  if (successfulSaves > 0) {
    showSnackbar({ text: `${successfulSaves} referidos guardados con éxito.` });
  }
  
  // Limpiamos el formulario para la próxima carga
  newReferralsList.value = [{ referralName: '', phone: '', occupation: '', peopleCount: undefined }];
  sponsor.value = ''; // Opcional: limpiar el sponsor también
};

const getStatusColor = (status: IReferral['status']) => {
  switch (status) {
    case 'Demo': return 'success';
    case 'No Acepta': return 'error';
    case 'No Contesta': return 'warning';
    default: return 'info';
  }
};
</script>
