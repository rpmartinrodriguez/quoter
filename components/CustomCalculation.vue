<template>
  <!-- Calculations Setup -->
  <div class="setup-wrapper">
    <!-- Real total -->
    <div>
      <b>Precio Total:</b>
      <div class="mt-2">
        {{ formatAsArs(props.total || 0) }}
      </div>
    </div>

    <!-- Custom Total -->
    <div>
      <b>Precio Total Personalizado:</b>
      <br />
      <v-text-field
        :model-value="customTotal"
        variant="outlined"
        density="compact"
        hide-details
        single-line
        @update:model-value="setCustomTotal"
      ></v-text-field>
    </div>

    <!-- Custom Depósito -->
    <div>
      <b>Depósito Personalizado:</b>
      <br />
      <div class="d-flex align-center ga-3">
        <v-text-field
          :model-value="customDeposit"
          variant="outlined"
          density="compact"
          hide-details
          single-line
          @update:model-value="setCustomDeposit"
        ></v-text-field>
        <v-btn
          variant="text"
          density="compact"
          icon
          :disabled="disableCalculate"
          @click="calculate"
        >
          <v-tooltip activator="parent" location="bottom"> Calcular </v-tooltip>
          <v-icon>mdi-calculator-variant</v-icon>
        </v-btn>
      </div>
    </div>
  </div>

  <br /><br />

  <!-- Calculated Quotes -->
  <div v-if="showQuotes" class="custom-calculations-wrapper">
    <div class="text-center">
      <p><strong>Monto a financiar</strong></p>
      <p class="mt-2">{{ formatAsArs(toFinance || 0) }}</p>
    </div>

    <div v-for="cq in calculatedQuotes" :key="cq.$id" class="text-center">
      <p>
        <strong>{{ `${cq.quantity} cuotas (${cq.percentage})` }}</strong>
      </p>
      <p class="mt-2">
        {{ cq.amount }}
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              density="compact"
              icon
              v-bind="props"
              @click="handleCopyClick(cq)"
            >
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          Copiar {{ cq.quantity }} cuotas ({{ cq.percentage }})
        </v-tooltip>
      </p>
    </div>
  </div>

  <div v-else class="text-center">
    Indique un depósito personalizado para calcular las cuotas
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";

const props = defineProps<{
  products: string[];
  total: number;
}>();

const { formatAsArs } = useFormatters();
const { quotes } = useQuote();

const calculatedQuotes = ref<any[]>([]);
const customQuotes = ref<any[]>([]);
const showQuotes = computed(() => calculatedQuotes.value.length > 0);
const toFinance = ref<number>(0);
const customTotal = ref<number>();
const customDeposit = ref<number>();

const disableCalculate = computed(() => {
  if (!customDeposit.value) return true;
  if (customTotal.value && customDeposit.value > customTotal.value) return true;
  if (!customTotal.value && customDeposit.value > props.total) return true;
  return false;
});

const setCustomTotal = (value: string) => {
  const num = parseFloat(value);
  customTotal.value = isNaN(num) ? undefined : num;
};

const setCustomDeposit = (value: string) => {
  const num = parseFloat(value);
  customDeposit.value = isNaN(num) ? undefined : num;
};

const calculate = () => {
  if (!customDeposit.value) return;

  toFinance.value = customTotal.value
    ? customTotal.value - customDeposit.value
    : props.total - customDeposit.value;

  calculatedQuotes.value = quotes.value.map((q) => {
    const amount = (toFinance.value * q.percentage) / 100;
    return {
      $id: q.$id,
      quantity: q.quantity,
      percentage: q.percentage,
      amount: formatAsArs(amount),
    };
  });
};

const source = ref("");
const { copy } = useClipboard({ source });

const handleCopyClick = (quote: any) => {
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
.setup-wrapper {
  column-gap: 3em;
  display: grid;
  grid-template-columns: auto repeat(2, 1fr);
  justify-content: center;
}

.custom-calculations-wrapper {
  column-gap: 1em;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-content: center;
  row-gap: 1em;
}

@media (max-width: 768px) {
  .setup-wrapper {
    grid-template-columns: 1fr;
    row-gap: 1em;
  }

  .custom-calculations-wrapper {
    column-gap: 1em;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    justify-content: center;
    row-gap: 1em;
  }
}

@media (max-width: 430px) {
  .custom-calculations-wrapper {
    column-gap: 1em;
    display: grid;
    grid-template-columns: 1fr;
    justify-content: center;
    row-gap: 1em;
  }
}
</style>
