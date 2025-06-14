<template>
  <div class="setup-wrapper">
    <div>
      <b>Precio Total:</b>
      <div class="mt-2">
        {{ formatAsArs(props.total || 0) }}
      </div>
    </div>

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
      </div>

      <div v-if="depositOptions.length > 0" class="mt-3 d-flex flex-wrap ga-2">
        <v-chip
          v-for="option in depositOptions"
          :key="option.percentage"
          @click="selectDeposit(option.amount)"
          color="primary"
          variant="outlined"
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
    <div class="text-center">
      <p><strong>Monto a financiar</strong></p>
      <p class="mt-2">{{ formatAsArs(toFinance || 0) }}</p>
    </div>

    <div v-for="cq in calculatedQuotes" :key="cq.$id" class="text-center">
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
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          Copiar {{ cq.quantity }} cuotas ({{ cq.percentage }}%)
        </v-tooltip>
      </p>
    </div>
  </div>

  <div v-else class="text-center">
    Indique un depósito para calcular las cuotas
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useClipboard } from "@vueuse/core";

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
const { deposits } = useDeposit(); // Se obtienen los depósitos

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
      label: `${dep.percentage}% (${formatAsArs(amount)})`
    };
  });
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
/* Los estilos no necesitan cambios */
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
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 430px) {
  .custom-calculations-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
