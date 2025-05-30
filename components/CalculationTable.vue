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

// 🟢 Carga inicial de productos y sincronización
onMounted(async () => {
  await getProducts();
  console.log("🧪 Productos cargados desde Appwrite:", products.value);

  if (Array.isArray(products.value) && products.value.length > 0) {
    selected.value = [...products.value];
    console.log("🧩 Productos seleccionados:", selected.value);
  } else {
    console.warn("⚠️ No hay productos disponibles.");
  }
});

// 🟢 Armado de los productos con cálculos (protegido)
watchEffect(() => {
  if (!Array.isArray(selected.value) || selected.value.length === 0) {
    console.log("📭 Esperando selección de productos...");
    parsedProducts.value = [];
    return;
  }

  parsedProducts.value = selected.value
    .filter((p) => p && typeof p.price === "number")
    .map((element) => {
      const price = element.price || 0;
      return {
        color: element.color || "#CCC",
        product: `
          <div class="text-center"><b>${element.detail || "Producto"}</b></div>
          <div class="text-center my-3">${formatAsArs(price)}</div>`,
        deposit: fillDepositCell(price),
        rest: fillRestCell(price),
        quotes: calculateQuotes(price),
      };
    });

  console.log("✅ parsedProducts actualizado:", parsedProducts.value);
});

// 🔢 Funciones de cálculo
const fillDepositCell = (p: number) => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(element => {
    const amount = (p * element.percentage) / 100;
    html += `<tr>
      <td class="px-1 text-center cell">${element.percentage}%</td>
      <td class="px-1 text-center cell"><b>${formatAsArs(amount)}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
};

const fillRestCell = (p: number) => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(element => {
    const amount = (p * element.percentage) / 100;
    html += `<tr>
      <td class="px-1 text-right cell"><b>${formatAsArs(p - amount)}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
};

const calculateQuotes = (p: number): string[] => {
  return quotes.value.map(q => {
    let html = `<table class="table"><tbody>`;
    deposits.value.forEach(d => {
      const amount = (p * d.percentage) / 100;
      const diff = p - amount;
      const quote = (diff * q.percentage) / 100;
      html += `<tr>
        <td class="px-1 text-center cell">${formatAsArs(Math.round(quote))}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
    return html;
  });
};

// 🔢 Totales
const totals = computed(() =>
  selected.value.reduce((t, p) => t + (p.price || 0), 0)
);

const totalDeposits = computed(() => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(element => {
    html += `<tr>
      <td class="px-1 text-center cell">${element.percentage}%</td>
      <td class="px-1 text-center cell"><b>${formatAsArs(Math.round((totals.value * element.percentage) / 100))}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
});

const totalRests = computed(() => {
  let html = `<table class="table"><tbody>`;
  deposits.value.forEach(element => {
    const amount = (totals.value * element.percentage) / 100;
    const rest = totals.value - amount;
    html += `<tr>
      <td class="px-1 text-right cell"><b>${formatAsArs(Math.round(rest))}</b></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
});

const totalQuotes = computed(() => {
  return quotes.value.map(q => {
    let html = `<table class="table"><tbody>`;
    deposits.value.forEach(d => {
      const amount = (totals.value * d.percentage) / 100;
      const diff = totals.value - amount;
      const quote = (diff * q.percentage) / 100;
      html += `<tr>
        <td class="px-1 text-center cell cursor-pointer can-copy" data-percentage="${d.percentage}" data-quotes="${q.quantity}">
          ${formatAsArs(Math.round(quote))}
        </td>
      </tr>`;
    });
    html += `</tbody></table>`;
    return html;
  });
});

// 🧾 Copiar resumen
const source = ref("");
const { copy } = useClipboard({ source });

const test = (event: any) => {
  const elem = event.target;
  const productsList = selected.value.map((s) => s.detail);
  if (elem.classList.contains("can-copy")) {
    source.value = `Hola!!
    Quería agradecerte por la excelente decisión que tomaste. Te hacemos un breve resumen para que tengas toda la información a mano:

    \t•\t*Pieza${productsList.length > 1 ? `s: ${productsList.join(", ")}` : `: ${productsList[0]}`}*
    \t•\tDepósito inicial: ${formatAsArs(
      Math.round((totals.value * elem.dataset.percentage) / 100)
    )}
    \t•\tCantidad de cuotas: ${elem.dataset.quotes}
    \t•\tValor de cada cuota: ${elem.textContent.trim()}

    ¡Gracias por confiar en nosotros! Royal Prestige!

    Links útiles:
    - Curado de ollas: https://www.youtube.com/watch?v=m0SAopwbgxc
    - Recetas: https://www.royalprestige.com/ar/inspiracion/recetas
    - Instagram: https://www.instagram.com/royalprestigeargoficial`;

    copy(source.value);
  }
};
</script>

<style>
.table {
  border-spacing: 0;
  width: 100%;
}
.cell {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
  height: 36px;
}
</style>
