Ya cree el editor, te paso ahora el código de programa 414.vue, pásamelo completo y con las modificaciones 


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
        
        <template v-slot:item.loadDate="{ item }">
          <span>{{ new Date(item.loadDate).toLocaleDateString('es-AR') }}</span>
        </template>
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
      // ✅ Se reemplaza la alerta por una notificación snackbar
      showSnackbar({ text: `Error al guardar a "${referral.referralName}": ${error.message}`, color: 'error' });
      isSaving.value = false;
      return; 
    }
  }
  
  if (successfulSaves > 0) {
    await getReferrals();
    // ✅ Se reemplaza la alerta por una notificación snackbar
    showSnackbar({ text: `${successfulSaves} referidos guardados con éxito.`, color: 'success' });
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
