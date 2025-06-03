<template>
  <div>
    <!-- Validación visual de carga de datos -->
    <v-alert
      type="success"
      variant="outlined"
      class="mb-4"
      v-if="quotes.length > 0 && deposits.length > 0 && selected.length > 0"
    >
      ✅ Productos seleccionados: {{ selected.length }} <br />
      ✅ Cuotas cargadas correctamente ({{ quotes.length }} opciones) <br />
      ✅ Depósitos cargados correctamente ({{ deposits.length }} opciones)
    </v-alert>

    <v-alert
      v-else
      type="warning"
      variant="outlined"
      class="mb-4"
    >
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

      <!-- Totales -->
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

// ▶️ Obtener productos y loguear entradas clave
onMounted(async () => {
  await getProducts();
  console.log("📦 Productos cargados:", products.value);
  console.log("💰 Depósitos:", deposits.value);
  console.log("📆 Cuotas:", quotes.value);
  console.log("✅ Productos seleccionados:", selected.value);
});

// ▶️ Calcula los valores por producto seleccionado
watchEffect(() => {
  console.log("⏳ Ejecutando cálculo...");

  if (!isSelectedValid.value) {
    console.warn("⚠️ No hay productos seleccionados.");
    parsedProducts.value = [];
    return;
  }

  parsedProducts.value = selected.value
    .filter((p) => p && typeof p.price === "number")
    .map((element) => {
      const price = element.price || 0;
      return {
        color: element.color || "#EEE",
        product: `
          <div class="text-center"><b>${element.detail || "Producto"}</b></div>
          <div class="text-center my-3">${formatAsArs(price)}</div>`,
        deposit: fillDepositCell(price),
        rest: fillRestCell(price),
        quotes: calculateQuotes(price),
      };
    });

  console.log("✅ parsedProducts generado:", parsedProducts.value);
});

// Función para mostrar tabla de depósitos por producto
const fillDepositCell = (p: number) => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(({ percentage }) => {
    const amount = (p * percentage) / 100;
    html += `<tr>
      <td class="px-1 text-center cell">${percentage}%</td>
      <td class="px-1 text-center cell"><b>${formatAsArs(amount)}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
};

// Muestra saldo a financiar por producto
const fillRestCell = (p: number) => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(({ percentage }) => {
    const deposit = (p * percentage) / 100;
    const rest = p - deposit;
    html += `<tr>
      <td class="px-1 text-right cell"><b>${formatAsArs(rest)}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
};

// Muestra las cuotas por producto según cada configuración
const calculateQuotes = (p: number): string[] => {
  return quotes.value.map((q) => {
    let html = `<table class="table"><tbody>`;
    deposits.value.forEach((d) => {
      const deposit = (p * d.percentage) / 100;
      const toFinance = p - deposit;
      const quote = (toFinance * q.percentage) / 100;
      html += `<tr>
        <td class="px-1 text-center cell cursor-pointer can-copy" data-percentage="${d.percentage}" data-quotes="${q.quantity}">
          ${formatAsArs(Math.round(quote))}
        </td>
      </tr>`;
    });
    html += `</tbody></table>`;
    return html;
  });
};

// Totales
const totals = computed(() => {
  if (!isSelectedValid.value) return 0;
  return selected.value.reduce((t, p) => t + (p.price || 0), 0);
});

const totalDeposits = computed(() => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(({ percentage }) => {
    const amount = (totals.value * percentage) / 100;
    html += `<tr>
      <td class="px-1 text-center cell">${percentage}%</td>
      <td class="px-1 text-center cell"><b>${formatAsArs(Math.round(amount))}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
});

const totalRests = computed(() => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(({ percentage }) => {
    const rest = totals.value - (totals.value * percentage) / 100;
    html += `<tr>
      <td class="px-1 text-right cell"><b>${formatAsArs(Math.round(rest))}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
});

const totalQuotes = computed(() => {
  return quotes.value.map((q) => {
    let html = `<table class="table"><tbody>`;
    deposits.value.forEach((d) => {
      const deposit = (totals.value * d.percentage) / 100;
      const toFinance = totals.value - deposit;
      const quote = (toFinance * q.percentage) / 100;
      html += `<tr>
        <td class="px-1 text-center cell">${formatAsArs(Math.round(quote))}</td>
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
