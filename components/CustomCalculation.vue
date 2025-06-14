<template>
  <div class="custom-calc-container">
    <div class="setup-wrapper">
      </div>
    <br /><br />
    <div v-if="showQuotes" class="custom-calculations-wrapper">
      </div>
    <div v-else class="text-center no-quotes-message">
      Indique un depósito para calcular las cuotas
    </div>
  </div>

  <v-dialog v-model="dialogs.typeSelection" persistent max-width="400">
    <v-card class="pa-4 text-center">
      <v-card-title class="text-h5">Guardar Registro</v-card-title>
      <v-card-text>
        La información de la cotización se ha copiado. ¿Deseas guardar este registro como Venta o como Cotización?
      </v-card-text>
      <v-card-actions class="d-flex justify-center ga-3">
        <v-btn color="grey" @click="dialogs.typeSelection = false">Cancelar</v-btn>
        <v-btn color="secondary" variant="tonal" @click="handleTypeSelected('COTIZACIÓN')">Guardar Cotización</v-btn>
        <v-btn color="success" variant="flat" @click="handleTypeSelected('VENTA')">Confirmar Venta</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogs.clientForm" persistent max-width="600">
    <v-card>
      <v-card-title>
        <span class="text-h5">Datos del Cliente para {{ transactionType }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="clientData.name"
                label="Nombre y Apellido*"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="clientData.address"
                label="Dirección"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="clientData.phone"
                label="Celular"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <small>*indica campo requerido</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeAndResetForms">Cancelar</v-btn>
        <v-btn 
          color="blue-darken-1" 
          variant="flat" 
          @click="handleSaveTransaction" 
          :disabled="!clientData.name"
          :loading="isSaving"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  </template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { useClipboard } from "@vueuse/core";
import type { ISavedRecord } from '~/composables/useSavedQuotes'; // Importamos la interfaz

// --- PROPS E INTERFACES ---
interface Product {
  $id: string;
  detail: string;
  price: number;
}
interface ICalculatedQuote {
  $id: string;
  quantity: number;
  percentage: number;
  amount: string;
}
const props = defineProps<{
  products: Product[];
  total: number;
}>();
const emit = defineEmits<{ (e: 'deselect-product', product: Product): void; }>();


// --- COMPOSABLES Y ESTADO ---
const { formatAsArs } = useFormatters();
const { quotes } = useQuote();
const { deposits } = useDeposit();
const { saveRecord, isLoading: isSaving } = useSavedQuotes(); // ✅ Usamos el nuevo composable

const customTotal = ref<number>();
const customDeposit = ref<number>();

// ✅ --- INICIO: NUEVO ESTADO PARA DIÁLOGOS Y FORMULARIO --- ✅
const dialogs = reactive({
  typeSelection: false,
  clientForm: false,
});
const clientData = reactive({
  name: '',
  address: '',
  phone: '',
});
const transactionType = ref<'VENTA' | 'COTIZACIÓN'>('COTIZACIÓN');
const lastQuoteCopied = ref<ICalculatedQuote | null>(null);
// ✅ --- FIN: NUEVO ESTADO --- ✅


// --- LÓGICA DE CÁLCULO (sin cambios) ---
const depositOptions = computed(() => {/* ... */});
const toFinance = computed(() => {/* ... */});
const calculatedQuotes = computed<ICalculatedQuote[]>(() => {/* ... */});
const showQuotes = computed(() => calculatedQuotes.value.length > 0);

// --- MÉTODOS ---
const handleDeselect = (productToDeselect: Product) => {
  emit('deselect-product', productToDeselect);
};
const selectDeposit = (amount: number) => { /* ... */ };
const parseNumericInput = (value: string): number | undefined => { /* ... */ };
const setCustomTotal = (value: string) => { /* ... */ };
const setCustomDeposit = (value: string) => { /* ... */ };

const source = ref("");
const { copy } = useClipboard({ source });

// ✅ --- LÓGICA MODIFICADA Y NUEVA PARA GUARDAR --- ✅
const handleCopyClick = (quote: ICalculatedQuote) => {
  lastQuoteCopied.value = quote; // Guardamos la info de la cuota seleccionada
  const productNames = props.products.map(p => p.detail);
  const depositStr = formatAsArs(customDeposit.value || 0);
  const quoteAmount = quote.amount;

  source.value = `... tu texto a copiar ...`; // Tu texto largo va aquí

  copy(source.value);

  // En lugar de solo copiar, ahora abrimos el primer diálogo.
  dialogs.typeSelection = true;
};

const handleTypeSelected = (type: 'VENTA' | 'COTIZACIÓN') => {
  transactionType.value = type;
  dialogs.typeSelection = false;
  dialogs.clientForm = true;
};

const closeAndResetForms = () => {
  dialogs.clientForm = false;
  clientData.name = '';
  clientData.address = '';
  clientData.phone = '';
};

const handleSaveTransaction = async () => {
  if (!clientData.name || !lastQuoteCopied.value) return;

  const recordToSave: ISavedRecord = {
    clientName: clientData.name,
    clientAddress: clientData.address,
    clientPhone: clientData.phone,
    type: transactionType.value,
    quoteDate: new Date().toISOString(),
    products: props.products.map(p => p.detail),
    totalAmount: customTotal.value ?? props.total,
    depositAmount: customDeposit.value || 0,
    installmentsInfo: `${lastQuoteCopied.value.quantity} cuotas de ${lastQuoteCopied.value.amount}`
  };

  try {
    await saveRecord(recordToSave);
    // Aquí podrías mostrar un snackbar/toast de "Guardado con éxito"
  } finally {
    closeAndResetForms();
  }
};

</script>

<style>
/* Tus estilos CSS no necesitan cambios */
</style>
