<template>
  <div class="custom-calc-container">
    <div class="setup-wrapper">
      <div class="setup-item">
        <div v-if="props.products.length > 0" class="product-details-wrapper">
          <b class="product-list-title">Artículos Seleccionados:</b>
          <ul class="product-list">
            <li v-for="product in props.products" :key="product.$id">
              <span>{{ product.detail }}</span>
              <v-btn
                variant="text"
                density="compact"
                icon
                @click="handleDeselect(product)"
                title="Quitar este producto"
              >
                <v-icon size="small" color="error">mdi-close-circle-outline</v-icon>
              </v-btn>
            </li>
          </ul>
        </div>
        
        <div v-else class="product-details-wrapper">
           <b class="product-list-title">Ningún artículo seleccionado</b>
        </div>

        <hr v-if="props.products.length > 0" class="divider">

        <b>Precio Total:</b>
        <div class="mt-2 price-display">
          {{ formatAsArs(props.total || 0) }}
        </div>
      </div>

      <div class="setup-item">
        <b>Precio Total Personalizado:</b>
        <v-text-field
          :model-value="customTotal"
          variant="outlined"
          density="compact"
          hide-details
          single-line
          @update:model-value="setCustomTotal"
        ></v-text-field>
      </div>

      <div class="setup-item">
        <b>Depósito Personalizado:</b>
        <v-text-field
          :model-value="customDeposit"
          variant="outlined"
          density="compact"
          hide-details
          single-line
          @update:model-value="setCustomDeposit"
        ></v-text-field>
        
        <div v-if="depositOptions.length > 0" class="mt-3 d-flex flex-wrap ga-2">
          <v-chip
            v-for="option in depositOptions"
            :key="option.percentage"
            @click="selectDeposit(option.amount)"
            color="primary"
            variant="tonal"
            label
            style="cursor: pointer;"
            title="Clic para usar este depósito"
          >
            {{ option.label }}
          </v-chip>
        </div>
      </div>
    </div>

    <div class="text-right mt-4" v-if="showQuotes">
      <v-btn
        @click="exportToPDF"
        color="primary"
        prepend-icon="mdi-file-pdf-box"
        :loading="isExporting"
      >
        Exportar a PDF
      </v-btn>
    </div>

    <br />

    <div
      id="quote-results"
      v-if="showQuotes"
      class="custom-calculations-wrapper"
    >
      <div class="result-card amount-to-finance">
        <p><strong>Monto a financiar</strong></p>
        <p class="mt-2">{{ formatAsArs(toFinance || 0) }}</p>
      </div>
      <div v-for="cq in calculatedQuotes" :key="cq.$id" class="result-card">
        <p>
          <strong>{{ `${cq.quantity} cuotas (${cq.percentage}%)` }}</strong>
        </p>
        <p class="mt-2">
          {{ cq.amount }}
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props: tooltipProps }">
              <v-btn
                variant="text"
                density="compact"
                icon
                v-bind="tooltipProps"
                @click="handleCopyClick(cq)"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
            </template>
            Copiar y Guardar Registro
          </v-tooltip>
        </p>
      </div>
    </div>

    <div v-else class="text-center no-quotes-message">
      Indique un depósito para calcular las cuotas
    </div>
  </div>

  <v-dialog v-model="dialogs.typeSelection" persistent max-width="450">
    <v-card class="text-center pa-5" rounded="lg">
      <v-icon size="64" color="primary" class="mb-4">mdi-content-save-question-outline</v-icon>
      <h3 class="text-h5 font-weight-bold mb-2">Guardar Registro</h3>
      <p class="body-1 text-medium-emphasis mb-6 px-4">
        La información se copió al portapapeles. ¿Cómo deseas guardar este registro?
      </p>
      <div class="d-flex flex-column ga-3">
        <v-btn color="success" size="large" variant="flat" @click="handleTypeSelected('VENTA')" prepend-icon="mdi-check-decagram" block>
          Confirmar como Venta
        </v-btn>
        <v-btn color="info" size="large" variant="tonal" @click="handleTypeSelected('COTIZACIÓN')" prepend-icon="mdi-file-document-outline" block>
          Guardar como Cotización
        </v-btn>
        <v-btn variant="text" size="small" @click="dialogs.typeSelection = false" class="mt-2">
          No Guardar
        </v-btn>
      </div>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogs.clientForm" persistent max-width="600">
    </v-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, nextTick } from 'vue';
import { useClipboard } from "@vueuse/core";
import type { ISavedRecord } from '~/composables/useSavedQuotes';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- PROPS E INTERFACES ---
interface Product {
  $id: string;
  detail: string;
  price: number;
  color?: string;
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
const { saveRecord, isLoading: isSaving } = useSavedQuotes();
const { showSnackbar } = useSnackbar(); // ✅ Se importa el hook para usar las notificaciones

const customTotal = ref<number>();
const customDeposit = ref<number>();
const isExporting = ref(false);
const dialogs = reactive({
  typeSelection: false,
  clientForm: false,
});
const clientData = reactive({ name: '', address: '', phone: '' });
const transactionType = ref<'VENTA' | 'COTIZACIÓN'>('COTIZACIÓN');
const lastQuoteCopied = ref<ICalculatedQuote | null>(null);

// --- LÓGICA DE CÁLCULO ---
const depositOptions = computed(() => {
  const baseTotal = customTotal.value ?? props.total;
  if (!baseTotal || !deposits.value || deposits.value.length === 0) return [];
  return deposits.value.map(dep => ({
    percentage: dep.percentage,
    amount: (baseTotal * dep.percentage) / 100,
    label: `${dep.percentage}%`
  })).sort((a, b) => b.percentage - a.percentage);
});
const toFinance = computed(() => {
  if (!customDeposit.value) return 0;
  const baseTotal = customTotal.value ?? props.total;
  if (customDeposit.value > baseTotal) return 0;
  return baseTotal - customDeposit.value;
});
const calculatedQuotes = computed<ICalculatedQuote[]>(() => {
  if (toFinance.value <= 0 || !quotes.value) return [];
  return quotes.value.map((q) => ({
    $id: q.$id,
    quantity: q.quantity,
    percentage: q.percentage,
    amount: formatAsArs(Math.round((toFinance.value * q.percentage) / 100)),
  }));
});
const showQuotes = computed(() => calculatedQuotes.value.length > 0);

// --- MÉTODOS ---
const handleDeselect = (productToDeselect: Product) => { emit('deselect-product', productToDeselect); };
const selectDeposit = (amount: number) => { customDeposit.value = Math.round(amount); };
const parseNumericInput = (value: string): number | undefined => {
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
};
const setCustomTotal = (value: string) => { customTotal.value = parseNumericInput(value); };
const setCustomDeposit = (value: string) => { customDeposit.value = parseNumericInput(value); };

// --- LÓGICA DE COPIADO Y GUARDADO ---
const source = ref("");
const { copy } = useClipboard({ source });
const handleCopyClick = (quote: ICalculatedQuote) => {
  lastQuoteCopied.value = quote;
  const productNames = props.products.map(p => p.detail);
  const depositStr = formatAsArs(customDeposit.value || 0);
  const quoteAmount = quote.amount;
  source.value = `... tu texto a copiar ...`; // Texto largo
  copy(source.value);

  // ✅ Mostramos la notificación de copiado
  showSnackbar({ text: '¡Texto copiado al portapapeles!', color: 'info' });

  dialogs.typeSelection = true;
};
const handleTypeSelected = (type: 'VENTA' | 'COTIZACIÓN') => {
  transactionType.value = type;
  dialogs.typeSelection = false;
  dialogs.clientForm = true;
};
const closeAndResetForms = () => {
  dialogs.clientForm = false;
  dialogs.typeSelection = false;
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
    // ✅ Mostramos la notificación de éxito
    showSnackbar({ text: 'Registro guardado con éxito', color: 'success' });
  } catch(e: any) {
    // ✅ Mostramos la notificación de error
    showSnackbar({ text: `Error al guardar: ${e.message}`, color: 'error' });
  } finally {
    closeAndResetForms();
  }
};

// --- LÓGICA DE EXPORTACIÓN A PDF ---
const exportToPDF = async () => {
  isExporting.value = true;
  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    await nextTick();
    const elementToCapture = document.getElementById('quote-results');
    if (!elementToCapture) throw new Error("Elemento a exportar no encontrado");
    const canvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`cotizacion-${new Date().toLocaleDateString('es-AR')}.pdf`);
    // ✅ Notificación de éxito para el PDF
    showSnackbar({ text: 'PDF generado con éxito', color: 'success' });
  } catch (error: any) {
    console.error("Error al generar el PDF:", error);
    // ✅ Notificación de error para el PDF
    showSnackbar({ text: `Error al generar PDF: ${error.message}`, color: 'error' });
  } finally {
    isExporting.value = false;
  }
};
</script>

<style>
/* Los estilos no necesitan cambios */
</style>
