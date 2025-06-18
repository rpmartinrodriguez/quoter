<template>
  <v-card flat>
    <v-tabs v-model="tab" align-tabs="start" color="primary">
      <v-tab value="load">
        <v-icon start>mdi-account-plus</v-icon>
        Cargar Referidos
      </v-tab>
      <v-tab value="list">
        <v-icon start>mdi-account-details</v-icon>
        Ver Listado
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="load">
        <v-card-text class="pa-md-6">
          <v-text-field
            v-model="sponsor"
            label="Nombre del Sponsor (Cliente que refiere)*"
            variant="outlined"
            class="mb-6"
            hide-details
          ></v-text-field>
          
          <div v-for="(referral, index) in newReferralsList" :key="index" class="referral-form-item mb-4">
            <v-sheet class="pa-4" rounded="lg" border>
              <div class="d-flex justify-space-between align-center mb-2">
                <h4 class="text-h6 font-weight-medium">Referido #{{ index + 1 }}</h4>
                <v-btn v-if="newReferralsList.length > 1" icon="mdi-delete" size="small" variant="tonal" color="error" @click="removeReferralForm(index)"></v-btn>
              </div>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="referral.referralName" label="Nombre y Apellido*" density="compact" variant="outlined" hide-details></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="referral.phone" label="Teléfono" density="compact" variant="outlined" hide-details></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="referral.occupation" label="Ocupación" density="compact" variant="outlined" hide-details></v-text-field></v-col>
                <v-col cols="12" md="6"><v-text-field v-model.number="referral.peopleCount" label="Cantidad de Personas" type="number" density="compact" variant="outlined" hide-details></v-text-field></v-col>
              </v-row>
            </v-sheet>
          </div>

          <div class="d-flex ga-4 mt-6">
            <v-btn @click="addReferralForm" prepend-icon="mdi-plus" color="secondary" variant="outlined">
              Añadir Otro Referido
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="handleSaveAllReferrals" color="success" size="large" prepend-icon="mdi-content-save-all" :disabled="!isFormValid" :loading="isSaving">
              Guardar Todos
            </v-btn>
          </div>
        </v-card-text>
      </v-window-item>

      <v-window-item value="list">
        <v-card-text class="pa-md-6">
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
        </v-card-text>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useReferrals, type IReferral } from '~/composables/useReferrals';
import { useSnackbar } from '~/composables/useSnackbar';

const { referrals, isLoading, addReferral, updateReferralStatus, getReferrals } = useReferrals();
const { showSnackbar } = useSnackbar();
const { setTitle } = usePageTitle();

// ✅ Nuevo estado para controlar la pestaña activa
const tab = ref('load');

const sponsor = ref('');
const isSaving = ref(false);
const newReferralsList = ref([{ referralName: '', phone: '', occupation: '', peopleCount: undefined as number | undefined }]);

const selectedSponsor = ref<string | null>(null);
const selectedStatus = ref<string | null>(null);

const uniqueSponsors = computed(() => {
  const sponsors = new Set(referrals.value.map(r => r.sponsor));
  return Array.from(sponsors).sort();
});

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
  // Opcional: limpiar el sponsor también
  // sponsor.value = '';
  // ✅ Cambiamos a la pestaña del listado para ver el resultado
  tab.value = 'list';
};

const getStatusColor = (status: IReferral['status']) => {
  switch (status) {
    case 'Demo': return 'green-lighten-5';
    case 'No Acepta': return 'red-lighten-5';
    case 'No Contesta': return 'orange-lighten-5';
    default: return 'blue-lighten-5';
  }
};

onMounted(() => {
  setTitle('Programa 4/14');
});
</script>

<style scoped>
.referral-form-item {
  background-color: #FAFAFA; /* Un color de fondo muy sutil para cada item */
}
.status-select {
  border-radius: 4px;
}
</style>
