<template>
  <div class="custom-calc-container">
    <div class="setup-wrapper">
      <div class="setup-item">
        <div v-if="props.products.length > 0" class="product-details-wrapper">
          <b class="product-list-title">Artículos Seleccionados:</b>
          <ul class="product-list">
            <li v-for="(product, index) in props.products" :key="index">
              {{ product }}
            </li>
          </ul>
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

    <br /><br />

    <div v-if="showQuotes" class="custom-calculations-wrapper">
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
            Copiar {{ cq.quantity }} cuotas ({{ cq.percentage }}%)
          </v-tooltip>
        </p>
      </div>
    </div>

    <div v-else class="text-center no-quotes-message">
      Indique un depósito para calcular las cuotas
    </div>
  </div>
</template>

<script lang="ts" setup>
// El script no necesita cambios, solo el template y el style.
import { ref, computed } from 'vue';
import { useClipboard } from "@vueuse/core";
// ... (el resto de tu script setup se mantiene igual) ...
// --- PROPS E INTERFACES ---
const props = defineProps<{
  products: string[];
  total: number;
}>();
interface ICalculatedQuote {
  $id: string;
  quantity: number;
  percentage: number;
  amount: string;
}
// --- COMPOSABLES Y ESTADO ---
const { formatAsArs } = useFormatters();
const { quotes } = useQuote();
const { deposits } = useDeposit();
const customTotal = ref<number>();
const customDeposit = ref<number>();
// --- LÓGICA DE CÁLCULO ---
const depositOptions = computed(() => {
  const baseTotal = customTotal.value ?? props.total;
  if (!baseTotal || deposits.value.length === 0) return [];
  
  return deposits.value.map(dep => {
    const amount = (baseTotal * dep.percentage) / 100;
    return {
      percentage: dep.percentage,
      amount,
      label: `${dep.percentage}%`
    };
  }).sort((a, b) => b.percentage - a.percentage);
});
const toFinance = computed(() => {
  if (!customDeposit.value) return 0;
  const baseTotal = customTotal.value ?? props.total;
  if (customDeposit.value > baseTotal) return 0;
  return baseTotal - customDeposit.value;
});
const calculatedQuotes = computed<ICalculatedQuote[]>(() => {
  if (toFinance.value <= 0) return [];
  return quotes.value.map((q) => {
    const amount = (toFinance.value * q.percentage) / 100;
    return {
      $id: q.$id,
      quantity: q.quantity,
      percentage: q.percentage,
      amount: formatAsArs(Math.round(amount)),
    };
  });
});
const showQuotes = computed(() => calculatedQuotes.value.length > 0);
// --- MÉTODOS ---
const selectDeposit = (amount: number) => {
  customDeposit.value = Math.round(amount);
};
const parseNumericInput = (value: string): number | undefined => {
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
};
const setCustomTotal = (value: string) => {
  customTotal.value = parseNumericInput(value);
};
const setCustomDeposit = (value: string) => {
  customDeposit.value = parseNumericInput(value);
};
const source = ref("");
const { copy } = useClipboard({ source });
const handleCopyClick = (quote: ICalculatedQuote) => {
  const depositStr = formatAsArs(customDeposit.value || 0);
  const quoteAmount = quote.amount;
  source.value = `Hola!!
Quería agradecerte por la excelente decisión que tomaste. Te hacemos un breve resumen para que tengas toda la información a mano:

\t•\t*Pieza${props.products.length > 1 ? `s: ${props.products.join(", ")}` : `: ${props.products[0]}`}*
\t•\tDepósito inicial: ${depositStr}
\t•\tCantidad de cuotas: ${quote.quantity}
\t•\tValor de cada cuota: ${quoteAmount}

Estamos seguros de que esta decisión cumplirá con todas tus expectativas. Cualquier consulta o duda que tengas, no dudes en contactarnos. ¡Gracias por confiar en nosotros! Royal Prestige!

A continuación, unos links de interés:

\t•\tCurado de Ollas: https://www.youtube.com/watch?v=m0SAopwbgxc
\t•\tRecetas: https://www.royalprestige.com/ar/inspiracion/recetas
\t•\tInstagram: https://www.instagram.com/royalprestigeargoficial`;
  copy(source.value);
};
</script>

<style>
/* --- 1. Definición de la Paleta de Colores y Tipografía --- */
.custom-calc-container {
  font-family: 'Inter', sans-serif;
  --blue-primary: #0d6efd;
  --blue-light-bg: #f4f8ff;
  --blue-dark-text: #212529;
  --blue-secondary-text: #6c757d;
  --blue-border: #dee2e6;
  --white: #ffffff;
  --shadow-color: rgba(13, 110, 253, 0.1);
}
/* --- 2. Estilos para la Sección de Configuración (Arriba) --- */
.setup-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  color: var(--blue-dark-text);
}
.setup-item {
  background-color: var(--white);
  border: 1px solid var(--blue-border);
  border-radius: 12px;
  padding: 1.25rem;
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}
.setup-item:focus-within {
  box-shadow: 0 4px 15px var(--shadow-color);
  border-color: var(--blue-primary);
}
.setup-item b {
  font-weight: 500;
  color: var(--blue-secondary-text);
  font-size: 0.85rem;
}
.price-display {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--blue-dark-text);
}
.v-chip {
  transition: all 0.2s ease-in-out;
}
.v-chip:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* ✅ --- INICIO: ESTILOS PARA LA NUEVA LISTA DE PRODUCTOS --- ✅ */
.product-details-wrapper {
  margin-bottom: 1rem;
  flex-grow: 1; /* Hace que esta sección ocupe el espacio disponible */
}
.product-list-title {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--blue-primary) !important;
  font-weight: 700 !important;
  font-size: 0.9rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.product-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--blue-primary) var(--blue-light-bg);
}
.product-list li {
  font-size: 0.9rem;
  padding: 0.35rem 0.25rem;
  border-bottom: 1px solid var(--blue-border);
}
.product-list li:last-child {
  border-bottom: none;
}
.divider {
  border: none;
  border-top: 1px solid var(--blue-border);
  margin: 0 0 1rem 0;
}
/* ✅ --- FIN: ESTILOS PARA LA NUEVA LISTA DE PRODUCTOS --- ✅ */

/* --- 3. Estilos para la Sección de Resultados (Abajo) --- */
.custom-calculations-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}
.result-card {
  background-color: var(--blue-light-bg);
  border: 1px solid var(--blue-border);
  border-radius: 12px;
  padding: 1.25rem 1rem;
  text-align: center;
  transition: all 0.3s ease;
}
.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow-color);
  border-color: var(--blue-primary);
}
.result-card.amount-to-finance {
  background-color: var(--blue-dark-text);
  color: var(--white);
}
.result-card.amount-to-finance p, 
.result-card.amount-to-finance strong {
  color: var(--white);
}
.result-card p {
  margin: 0;
  color: var(--blue-dark-text);
}
.result-card p strong {
  color: var(--blue-secondary-text);
  font-weight: 500;
  font-size: 0.9rem;
}
.result-card .mt-2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 0.5rem !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.no-quotes-message {
  color: var(--blue-secondary-text);
  font-style: italic;
}
/* Media queries se mantienen */
@media (max-width: 768px) {
  .setup-wrapper, .custom-calculations-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
