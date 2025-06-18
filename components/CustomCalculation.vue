<template>
  <div class="custom-calc-container">
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, nextTick } from 'vue';
import { useClipboard } from "@vueuse/core";
import type { ISavedRecord } from '~/composables/useSavedQuotes';
// ✅ Se quitan los imports estáticos de jspdf y html2canvas de aquí
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

// ✅ ¡AQUÍ ESTÁ LA LÍNEA QUE FALTABA!
import { useSnackbar } from '~/composables/useSnackbar';

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
const { showSnackbar } = useSnackbar(); // Esta línea ahora funciona gracias al import

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


// --- LÓGICA DE CÁLCULO (sin cambios) ---
const depositOptions = computed(() => {
    // ...
});
const toFinance = computed(() => {
    // ...
});
const calculatedQuotes = computed<ICalculatedQuote[]>(() => {
    // ...
});
const showQuotes = computed(() => calculatedQuotes.value.length > 0);


// --- MÉTODOS (sin cambios en la lógica interna, solo en el llamado al snackbar) ---
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

  source.value = `... tu texto ...`; // Texto largo
  
  copy(source.value);
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
    showSnackbar({ text: 'Registro guardado con éxito', color: 'success' });
  } catch(e: any) {
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
    showSnackbar({ text: 'PDF generado con éxito', color: 'success' });
  } catch (error: any) {
    console.error("Error al generar el PDF:", error);
    showSnackbar({ text: `Error al generar PDF: ${error.message}`, color: 'error' });
  } finally {
    isExporting.value = false;
  }
};
</script>

<style>
/* Tus estilos no necesitan cambios */
</style>
