<template>
  <div>
    <!-- ✅ Validación visual -->
    <v-alert
      v-if="quotes.length > 0 && deposits.length > 0 && selected.length > 0"
      type="success"
      variant="outlined"
      class="mb-4"
    >
      ✅ Productos seleccionados: {{ selected.length }} <br />
      ✅ Cuotas cargadas correctamente ({{ quotes.length }} opciones) <br />
      ✅ Depósitos cargados correctamente ({{ deposits.length }} opciones)
    </v-alert>

    <v-alert v-else type="warning" variant="outlined" class="mb-4">
      ⚠️ Aún faltan datos: <br />
      Productos seleccionados: {{ selected.length }} <br />
      Cuotas: {{ quotes.length }} <br />
      Depósitos: {{ deposits.length }}
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="withCalculations"
      item-value="product"
      hide-default-footer
      class="mt-2"
    >
      <template v-slot:item.deposit="{ item }">
        <div v-html="item.deposit"></div>
      </template>

      <template v-slot:item.rest="{ item }">
        <div v-html="item.rest"></div>
      </template>

      <template v-for="(q, i) in quotes" v-slot:[`item.quotes_${i}`]="{ item }">
        <div v-html="item.quotes[i]"></div>
      </template>

      <template v-slot:bottom>
        <tfoot>
          <tr class="font-weight-bold">
            <td style="background-color: #f0f0f0">TOTAL</td>
            <td style="background-color: #f0f0f0"></td>
            <td style="background-color: #f0f0f0" v-html="totalDeposits"></td>
            <td style="background-color: #f0f0f0" v-html="totalRests"></td>
            <td
              v-for="(qt, i) in totalQuotes"
              :key="i"
              style="background-color: #f0f0f0"
              v-html="qt"
            ></td>
          </tr>
        </tfoot>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";

interface IPCalculations {
  color: string;
  product: string;
  deposit: string;
  rest: string;
  quotes: string[];
}

const { formatAsArs } = useFormatters();
const { deposits } = useDeposit();
const { quotes } = useQuote();
const { products, selected, getProducts } = useProducts();

const parsedProducts = ref<IPCalculations[]>([]);
const withCalculations = computed(() => parsedProducts.value);

const isSelectedValid = computed(() =>
  Array.isArray(selected?.value) && selected.value.length > 0
);

onMounted(async () => {
  await getProducts();
});

watchEffect(() => {
  if (!isSelectedValid.value) {
    parsedProducts.value = [];
    return;
  }

  parsedProducts.value = selected.value
    .filter((p) => p && typeof p.price === "number")
    .map((element) => {
      const price = Number(element.price || 0);
      return {
        color: element.color || "#EEE",
        product: `
          <div class="text-center"><b>${element.detail || "Producto"}</b></div>
          <div class="text-center my-3">${formatAsArs(price)}</div>`,
        deposit: generateDepositTable(price),
        rest: generateRestTable(price),
        quotes: generateQuoteTables(price),
      };
    });
});

const generateDepositTable = (price: number) => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(({ percentage }) => {
    const amount = price * (percentage / 100);
    html += `<tr>
      <td class="px-1 text-center cell">${percentage}%</td>
      <td class="px-1 text-center cell"><b>${formatAsArs(amount)}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
};

const generateRestTable = (price: number) => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(({ percentage }) => {
    const rest = price - price * (percentage / 100);
    html += `<tr>
      <td class="px-1 text-right cell"><b>${formatAsArs(rest)}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
};

const generateQuoteTables = (price: number): string[] => {
  return quotes.value.map((quote) => {
    let html = `<table class="table"><tbody>`;
    deposits.value.forEach((deposit) => {
      const montoFinanciar = price - price * (deposit.percentage / 100);
      const cuota = montoFinanciar * (quote.percentage / 100);
      html += `<tr>
        <td class="px-1 text-center cell">
          ${formatAsArs(Math.round(cuota))}
        </td>
      </tr>`;
    });
    html += `</tbody></table>`;
    return html;
  });
};

const totals = computed(() => {
  if (!isSelectedValid.value) return 0;
  return selected.value.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
});

const totalDeposits = computed(() => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(({ percentage }) => {
    const amount = totals.value * (percentage / 100);
    html += `<tr>
      <td class="px-1 text-center cell">${percentage}%</td>
      <td class="px-1 text-center cell"><b>${formatAsArs(amount)}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
});

const totalRests = computed(() => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(({ percentage }) => {
    const rest = totals.value - totals.value * (percentage / 100);
    html += `<tr>
      <td class="px-1 text-right cell"><b>${formatAsArs(rest)}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
});

const totalQuotes = computed(() => {
  return quotes.value.map((q) => {
    let html = `<table class="table"><tbody>`;
    deposits.value.forEach((d) => {
      const toFinance = totals.value - totals.value * (d.percentage / 100);
      const cuota = toFinance * (q.percentage / 100);
      html += `<tr>
        <td class="px-1 text-center cell">${formatAsArs(Math.round(cuota))}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
    return html;
  });
});

const headers = computed(() => {
  const base = [
    { title: "Producto", key: "product", sortable: false },
    { title: "% Depósito", key: "deposit", sortable: false },
    { title: "Depósito", key: "deposit", sortable: false },
    { title: "Monto a financiar", key: "rest", sortable: false },
  ];

  const dynamic = quotes.value.map((q, i) => ({
    title: `${q.quantity} cuotas (${q.percentage}%)`,
    key: `quotes_${i}`,
    sortable: false,
  }));

  return [...base, ...dynamic];
});

const source = ref("");
const { copy } = useClipboard({ source });
</script>

<style scoped>
.table {
  border-spacing: 0;
  width: 100%;
}
.cell {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
  height: 36px;
}
</style>
