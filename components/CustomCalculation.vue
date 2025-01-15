<template>
  <!-- Calculations Setup -->
  <div class="setup-wrapper">
    <!-- Real total -->
    <div>
      <b>Precio Total:</b>
      <div class="mt-2">
        {{ formatAsArs(total) }}
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

    <!-- Custom Deposito -->
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
  <br />
  <br />
  <!-- Calculated Quotes -->
  <div v-if="showQuotes" class="custom-calculations-wrapper">
    <div class="text-center">
      <p><strong>Monto a financiar</strong></p>
      <p class="mt-2">{{ formatAsArs(toFinance) }}</p>
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
          Copiar 3 cuotas (39.07%)
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

const { products, total } = defineProps<{
  products: string[];
  total: number;
}>();

const { formatAsArs } = useFormatters();

const calculatedQuotes = ref<any>([]);
const showQuotes = computed<boolean>(() => calculatedQuotes.value.length > 0);
const toFinance = ref<number>(0);

const { quotes } = useQuote();
const customQuotes = ref([]);
const customTotal = ref<number>();
const customDeposit = ref<number>();
const disableCalculate = computed(() => {
  if (!customDeposit.value) return true;
  else if (
    customDeposit.value &&
    !customTotal.value &&
    customDeposit.value > total
  )
    return true;
  else if (
    customDeposit.value &&
    customTotal.value &&
    customDeposit.value > customTotal.value
  )
    return true;
  else return false;
});
const setCustomTotal = (event: string) => {
  if (
    isNaN(event as unknown as number) &&
    !isFinite(event as unknown as number)
  )
    return;
  if (event.length === 0) {
    customTotal.value = undefined;
    return;
  }
  customTotal.value = event as unknown as number;
};
const setCustomDeposit = (event: string) => {
  if (
    isNaN(event as unknown as number) &&
    !isFinite(event as unknown as number)
  )
    return;
  if (event.length === 0) {
    customDeposit.value = undefined;
    return;
  }
  customDeposit.value = event as unknown as number;
};
const calculate = () => {
  const qcs = quotes.value.map((q) => {
    let amount = 0;
    toFinance.value = 0;
    if (!customTotal.value) {
      toFinance.value = total - customDeposit.value!;
    } else {
      toFinance.value = customTotal.value - customDeposit.value!;
    }
    amount = (toFinance.value * q.percentage) / 100;

    return {
      $id: q.$id,
      quantity: q.quantity,
      percentage: q.percentage,
      amount: formatAsArs(amount),
    };
  });
  calculatedQuotes.value = qcs;
};

const source = ref("");
const { copy } = useClipboard({ source });
const handleCopyClick = (quotes: any) => {
  source.value = `Hola!!
Quería agradecerte por la excelente decisión que tomaste. Te hacemos un breve resumen para que tengas toda la información a mano:

\t•\t*Pieza${
    products.length > 1 ? `s: ${products.join(", ")}` : `: ${products[0]}`
  }*
\t•\tDepósito inicial: ${formatAsArs(customDeposit.value!)}
\t•\tCantidad de cuotas: ${quotes.quantity}
\t•\tValor de cada cuota: ${quotes.amount}

Estamos seguros de que esta decisión cumplirá con todas tus expectativas. Cualquier consulta o duda que tengas, no dudes en contactarnos. ¡Gracias por confiar en nosotros! Royal Prestige!

A continuación, unos links de interés:

\t•\Curado de Ollas: https://www.youtube.com/watch?app=desktop&v=m0SAopwbgxc
\t•\Recetas: https://www.royalprestige.com/ar/inspiracion/recetas

Seguinos en Instagram ➡️ https://www.instagram.com/royalprestigeargoficial?igsh=MXI0ZDN4ZWR1OXlyaA==`;
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
