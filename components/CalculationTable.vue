<template>
  <div>
    <v-alert
      type="success"
      variant="outlined"
      class="mb-4"
      v-if="quotes.length > 0 && deposits.length > 0 && isSelectedValid"
    >
      ✅ Cuotas cargadas correctamente ({{ quotes.length }} opciones) <br />
      ✅ Depósitos cargados correctamente ({{ deposits.length }} opciones)
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

      <template v-for="header in dynamicHeaders" v-slot:[`item.${header.key}`]="{ item }">
        <div v-html="item[header.key]"></div>
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
import { ref, computed, watchEffect } from 'vue';

// Asumiendo que estos composables existen y funcionan como antes
const { formatAsArs } = useFormatters();
const { deposits } = useDeposit();
const { quotes } = useQuote();
const { selected } = useProducts();

// Interfaz interna para el tipado de los datos procesados.
// Se ha modificado para permitir claves dinámicas para las cuotas.
interface IPCalculations {
  product: string;
  deposit: string;
  rest: string;
  [key: string]: any; // Permite propiedades dinámicas como quote_0, quote_1, etc.
}

const parsedProducts = ref<IPCalculations[]>([]);
const withCalculations = computed(() => parsedProducts.value);

const isSelectedValid = computed(
  () => Array.isArray(selected.value) && selected.value.length > 0
);

// ▶️ VERIFICACIÓN DE CARGA DE CUOTAS
watchEffect(() => {
  if (quotes.value.length === 0) {
    console.warn("⚠️ No se han cargado datos de cuotas.");
  }
});

// ▶️ GENERACIÓN DE CÁLCULOS (MODIFICADO)
watchEffect(() => {
  if (!isSelectedValid.value) {
    parsedProducts.value = [];
    return;
  }

  parsedProducts.value = selected.value.map((product) => {
    const price = product.price || 0;

    // Se obtienen los HTML de las tablas de cuotas
    const calculatedQuotes = getQuotesTables(price);

    // Se convierte el array de HTML en un objeto con claves dinámicas (quote_0, quote_1, ...)
    const quotesObject = calculatedQuotes.reduce((acc, quoteHtml, index) => {
      acc[`quote_${index}`] = quoteHtml;
      return acc;
    }, {} as { [key: string]: string });

    return {
      product: `
        <div class="text-center"><b>${product.detail || "Producto"}</b></div>
        <div class="text-center my-3">${formatAsArs(price)}</div>`,
      deposit: getDepositTable(price),
      rest: getRestTable(price),
      ...quotesObject, // Se añaden las propiedades de cuota al objeto principal
    };
  });
});

// --- Funciones de generación de HTML (sin cambios) ---

const getDepositTable = (price: number): string => {
  let html = "<table class='table'><tbody>";
  deposits.value.forEach((dep) => {
    const amount = (price * dep.percentage) / 100;
    html += `<tr>
      <td class="px-1 text-center">${dep.percentage}%</td>
      <td class="px-1 text-center"><b>${formatAsArs(amount)}</b></td>
    </tr>`;
  });
  html += "</tbody></table>";
  return html;
};

const getRestTable = (price: number): string => {
  let html = "<table class='table'><tbody>";
  deposits.value.forEach((dep) => {
    const deposit = (price * dep.percentage) / 100;
    const rest = price - deposit;
    html += `<tr>
      <td class="px-1 text-right"><b>${formatAsArs(rest)}</b></td>
    </tr>`;
  });
  html += "</tbody></table>";
  return html;
};

const getQuotesTables = (price: number): string[] => {
  return quotes.value.map((quote) => {
    let html = "<table class='table'><tbody>";
    deposits.value.forEach((dep) => {
      const deposit = (price * dep.percentage) / 100;
      const toFinance = price - deposit;
      const amount = (toFinance * quote.percentage) / 100;
      html += `<tr>
        <td class="px-1 text-center">${formatAsArs(Math.round(amount))}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    return html;
  });
};

// --- Computeds para los totales (sin cambios) ---

const totals = computed(() =>
  selected.value.reduce((acc, prod) => acc + (prod.price || 0), 0)
);

const totalDeposits = computed(() => {
  let html = "<table class='table'><tbody>";
  deposits.value.forEach((dep) => {
    const amount = (totals.value * dep.percentage) / 100;
    html += `<tr>
      <td class="px-1 text-center">${dep.percentage}%</td>
      <td class="px-1 text-center"><b>${formatAsArs(Math.round(amount))}</b></td>
    </tr>`;
  });
  html += "</tbody></table>";
  return html;
});

const totalRests = computed(() => {
  let html = "<table class='table'><tbody>";
  deposits.value.forEach((dep) => {
    const deposit = (totals.value * dep.percentage) / 100;
    const rest = totals.value - deposit;
    html += `<tr>
      <td class="px-1 text-right"><b>${formatAsArs(Math.round(rest))}</b></td>
    </tr>`;
  });
  html += "</tbody></table>";
  return html;
});

const totalQuotes = computed(() => {
  return quotes.value.map((quote) => {
    let html = "<table class='table'><tbody>";
    deposits.value.forEach((dep) => {
      const deposit = (totals.value * dep.percentage) / 100;
      const toFinance = totals.value - deposit;
      const amount = (toFinance * quote.percentage) / 100;
      html += `<tr>
        <td class="px-1 text-center">${formatAsArs(Math.round(amount))}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    return html;
  });
});


// --- Headers dinámicos (MODIFICADO) ---
const dynamicHeaders = computed(() => {
  return quotes.value.map((quote, index) => ({
    title: `${quote.quantity} cuotas (${quote.percentage}%)`,
    key: `quote_${index}`, // Clave modificada para coincidir con los datos
    sortable: false,
    align: 'center' as const,
  }));
});

const headers = computed(() => {
  const baseHeaders = [
    { title: "Producto", key: "product", sortable: false, align: 'center' as const },
    { title: "Depósito", key: "deposit", sortable: false, align: 'center' as const },
    { title: "Monto a financiar", key: "rest", sortable: false, align: 'center' as const },
  ];
  
  return [...baseHeaders, ...dynamicHeaders.value];
});
</script>

<style scoped>
.table {
  border-spacing: 0;
  width: 100%;
}
/* Opcional: para asegurar que las celdas de las tablas internas se vean bien */
.table td {
  border-bottom: thin solid rgba(0, 0, 0, 0.05);
  height: 36px; /* Ajusta según la altura de tu fila */
}
.table tr:last-child td {
  border-bottom: none;
}
</style>
