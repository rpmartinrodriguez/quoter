<template>
  <v-card flat>
    <v-card-title class="d-flex align-center">
        <v-icon start>mdi-cog</v-icon>
        Configuración General
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4" class="pa-4">
          <v-sheet variant="outlined" rounded="lg" class="pa-4 fill-height">
            <h3 class="text-center mb-4">Gestión de Productos</h3>
            <div v-if="!isVerified">
              <p class="text-caption text-medium-emphasis mb-2">
                Para actualizar la lista de precios, ingresá la contraseña de administrador.
              </p>
              <v-text-field v-model="passwordInput" label="Contraseña" type="password" @keydown.enter="checkPassword"></v-text-field>
              <v-alert v-if="errorMsg" type="error" density="compact" class="mt-2 text-left">{{ errorMsg }}</-alert>
              <v-btn @click="checkPassword" :loading="isLoadingPassword" block class="mt-4">Verificar</v-btn>
            </div>
            <div v-else>
              <v-file-input v-model="selectedFile" label="Seleccionar archivo .xlsx" show-size></v-file-input>
              <v-btn @click="handleUpload" :loading="isLoadingUpload" :disabled="selectedFile.length === 0" color="success" block class="mt-4">Cargar Nueva Lista</v-btn>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="4" class="pa-4">
          <v-sheet variant="outlined" rounded="lg" class="pa-4 fill-height">
            <h3 class="text-center mb-4">Opciones de Depósito</h3>
            <div class="d-flex flex-column ga-4">
              <div v-for="deposit in deposits" :key="deposit.$id" class="d-flex align-center ga-2">
                <v-text-field :model-value="deposit.percentage" label="Porcentaje" readonly suffix="%"></v-text-field>
                <v-btn icon="mdi-delete" size="small" variant="tonal" color="error" @click="deleteDeposit(deposit.$id)"></v-btn>
              </div>
              <v-divider></v-divider>
              <div class="d-flex align-center ga-2">
                <v-text-field v-model.number="newDepositPercentage" label="Nuevo Porcentaje" type="number" suffix="%"></v-text-field>
                <v-btn icon="mdi-plus" size="small" color="primary" @click="addDeposit" :disabled="!newDepositPercentage"></v-btn>
              </div>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="4" class="pa-4">
          <v-sheet variant="outlined" rounded="lg" class="pa-4 fill-height">
            <h3 class="text-center mb-4">Opciones de Cuotas</h3>
            <div class="d-flex flex-column ga-4">
              <div v-for="quote in quotes" :key="quote.$id" class="d-flex align-center ga-2">
                <v-text-field :model-value="quote.quantity" label="Cuotas" readonly></v-text-field>
                <v-text-field :model-value="quote.percentage" label="Porcentaje" readonly suffix="%"></v-text-field>
                <v-btn icon="mdi-delete" size="small" variant="tonal" color="error" @click="deleteQuote(quote.$id)"></v-btn>
              </div>
              <v-divider></v-divider>
              <div class="d-flex align-center ga-2">
                <v-text-field v-model.number="newQuote.quantity" label="Nuevas Cuotas" type="number"></v-text-field>
                <v-text-field v-model.number="newQuote.percentage" label="Nuevo %" type="number" suffix="%"></v-text-field>
                <v-btn icon="mdi-plus" size="small" color="primary" @click="addQuote" :disabled="!newQuote.quantity || !newQuote.percentage"></v-btn>
              </div>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useProducts } from '~/composables/useProducts';
import { useDeposit } from '~/composables/useDeposit';
import { useQuote } from '~/composables/useQuote';
import { useSnackbar } from '~/composables/useSnackbar';

// --- COMPOSABLES ---
const { deposits, getDeposits, createDeposit, deleteDeposit } = useDeposit();
const { quotes, getQuotes, createQuote, deleteQuote } = useQuote();
const { updateProducts, isLoading: isLoadingUpload } = useProducts();
const { showSnackbar } = useSnackbar();
const { setTitle } = usePageTitle();

// --- LÓGICA PARA PRODUCTOS (EXCEL) ---
const isVerified = ref(false);
const passwordInput = ref('');
const isLoadingPassword = ref(false);
const errorMsg = ref('');
const selectedFile = ref<File[]>([]);

const checkPassword = async () => {
  if (!passwordInput.value) { errorMsg.value = 'Ingresá una contraseña.'; return; }
  isLoadingPassword.value = true;
  errorMsg.value = '';
  try {
    const { verified } = await $fetch('/api/auth/verify-password', {
      method: 'POST',
      body: { password: passwordInput.value, type: 'uploads' }
    });
    if (verified) { isVerified.value = true; showSnackbar({ text: 'Verificación exitosa.' }); }
    else { errorMsg.value = 'Contraseña incorrecta.'; }
  } catch (err) { errorMsg.value = 'Ocurrió un error al verificar.'; }
  finally { isLoadingPassword.value = false; }
};

const handleUpload = async () => {
  if (selectedFile.value.length === 0) return;
  try {
    await updateProducts(selectedFile.value[0]);
    showSnackbar({ text: '¡Lista de productos actualizada!', color: 'success' });
    selectedFile.value = [];
  } catch (error) { showSnackbar({ text: 'Error al cargar el archivo.', color: 'error' }); }
};

// --- LÓGICA PARA DEPÓSITOS ---
const newDepositPercentage = ref<number | null>(null);
const addDeposit = async () => {
  if (!newDepositPercentage.value) return;
  await createDeposit(newDepositPercentage.value);
  newDepositPercentage.value = null;
};

// --- LÓGICA PARA CUOTAS ---
const newQuote = reactive({ quantity: null as number | null, percentage: null as number | null });
const addQuote = async () => {
  if (!newQuote.quantity || !newQuote.percentage) return;
  await createQuote(newQuote.quantity, newQuote.percentage);
  newQuote.quantity = null;
  newQuote.percentage = null;
};

onMounted(() => {
  setTitle('Configuración');
  getDeposits();
  getQuotes();
});
</script>
