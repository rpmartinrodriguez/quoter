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
const { products, selected, getProducts } = useProducts(); // ✅ reemplazo completo

onMounted(() => {
  getProducts();
}); // ✅ obtiene productos al montar el componente

watchEffect(() => {
  if (selected.value.length === 0 && products.value.length > 0) {
    selected.value = [...products.value];
  }
}); // ✅ sincroniza selected con los productos si está vacío

const parsedProducts = ref<IPCalculations[]>([]);
const withCalculations = computed(() => parsedProducts.value);

const fillDepositCell = (p: number) => {
  let html = `<table class="table"><tbody>`;
  for (let index = 0; index < deposits.value.length; index++) {
    const element = deposits.value[index];
    const amount = (p * element.percentage) / 100;
    html += `
      <tr>
        <td class="px-1 text-center cell">${element.percentage}%</td>
        <td class="px-1 text-center cell"><b>${formatAsArs(amount)}</b></td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  return html;
};

const fillRestCell = (p: number) => {
  let html = `<table class="table"><tbody>`;
  for (let index = 0; index < deposits.value.length; index++) {
    const element = deposits.value[index];
    const amount = (p * element.percentage) / 100;
    html += `
      <tr>
        <td class="px-1 text-right cell"><b>${formatAsArs(p - amount)}</b></td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  return html;
};

const calculateQuotes = (p: number): string[] => {
  const htmls: string[] = [];
  for (let i = 0; i < quotes.value.length; i++) {
    const q = quotes.value[i];
    let html = `<table class="table"><tbody>`;

    for (let j = 0; j < deposits.value.length; j++) {
      const d = deposits.value[j];
      const amount = (p * d.percentage) / 100;
      const diff = p - amount;
      const quote = (diff * q.percentage) / 100;
      html += `
        <tr>
          <td class="px-1 text-center cell">
            ${formatAsArs(Math.round(quote))}
          </td>
        </tr>
      `;
    }
    html += `</tbody></table>`;

    htmls.push(html);
  }
  return htmls;
};

const totals = computed<number>(() => {
  let t: number = 0;
  for (let i = 0; i < selected.value.length; i++) {
    const element = selected.value[i];
    t += element.price as number;
  }
  return t;
});

const totalDeposits = computed<string>(() => {
  let html = `<table class="table"><tbody>`;
  for (let i = 0; i < deposits.value.length; i++) {
    const element = deposits.value[i];
    html += `
      <tr>
        <td class="px-1 text-center cell">
          ${element.percentage}%
        </td>
        <td class="px-1 text-center cell">
          <b>${formatAsArs(
            Math.round((totals.value * element.percentage) / 100)
          )}</b>
        </td>
      </tr>
    `;
  }
  html += `</tbody></table>`;
  return html;
});

const totalRests = computed<string>(() => {
  let html = `<table class="table"><tbody>`;
  for (let i = 0; i < deposits.value.length; i++) {
    const element = deposits.value[i];
    const amount = (totals.value * element.percentage) / 100;
    const rest = totals.value - amount;
    html += `
      <tr>
        <td class="px-1 text-right cell">
          <b>${formatAsArs(Math.round(rest))}</b>
        </td>
      </tr>
    `;
  }
  html += `</tbody></table>`;
  return html;
});

const totalQuotes = computed(() => {
  const htmls: string[] = [];
  for (let i = 0; i < quotes.value.length; i++) {
    const q = quotes.value[i];
    let html = `<table class="table"><tbody>`;
    for (let j = 0; j < deposits.value.length; j++) {
      const d = deposits.value[j];
      const amount = (totals.value * d.percentage) / 100;
      const diff = totals.value - amount;
      const quote = (diff * q.percentage) / 100;
      html += `
        <tr>
          <td class="px-1 text-center cell cursor-pointer can-copy" data-percentage="${
            d.percentage
          }" data-quotes="${q.quantity}">
            ${formatAsArs(Math.round(quote))}
          </td>
        </tr>
      `;
    }
    html += `</tbody></table>`;
    htmls.push(html);
  }
  return htmls;
});

const source = ref("");
const { copy } = useClipboard({ source });
const test = (event: any) => {
  const elem = event.target;
  const products = selected.value.map((s) => s.detail);
  if (elem.classList.contains("can-copy")) {
    source.value = `Hola!!
    Quería agradecerte por la excelente decisión que tomaste. Te hacemos un breve resumen para que tengas toda la información a mano:

    \t•\t*Pieza${
      products.length > 1 ? `s: ${products.join(", ")}` : `: ${products[0]}`
    }*
    \t•\tDepósito inicial: ${formatAsArs(
      Math.round((totals.value * elem.dataset.percentage) / 100)
    )}
    \t•\tCantidad de cuotas: ${elem.dataset.quotes}
    \t•\tValor de cada cuota: ${elem.textContent.trim()}

    Estamos seguros de que esta decisión cumplirá con todas tus expectativas. Cualquier consulta o duda que tengas, no dudes en contactarnos. ¡Gracias por confiar en nosotros! Royal Prestige!

    A continuación, unos links de interés:

    \t•\Curado de Ollas: https://www.youtube.com/watch?app=desktop&v=m0SAopwbgxc
    \t•\Recetas: https://www.royalprestige.com/ar/inspiracion/recetas

    Seguinos en Instagram ➡️ https://www.instagram.com/royalprestigeargoficial?igsh=MXI0ZDN4ZWR1OXlyaA==`;

    copy(source.value);
  }
};

watchEffect(() => {
  // Update values for all products
  parsedProducts.value = [];
  for (let index = 0; index < selected.value.length; index++) {
    const element = selected.value[index];
    const pWithCalcs: IPCalculations = {
      color: element.color!,
      product: `
        <div class="text-center">
          <b>${element.detail}</b>
        </div>
        <div class="text-center my-3">${formatAsArs(
          element.price as number
        )}</div>
      `,
      deposit: fillDepositCell(element.price as number),
      rest: fillRestCell(element.price as number),
      quotes: calculateQuotes(element.price as number),
    };
    parsedProducts.value.push(pWithCalcs);
  }
});
</script>
