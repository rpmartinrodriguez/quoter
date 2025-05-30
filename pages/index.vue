<script lang="ts" setup>
import { useWindowSize } from "@vueuse/core";

interface Loading {
  products: boolean;
  passwordForm: boolean;
  excelForm: boolean;
}

interface Dialog {
  calculation: boolean;
  excel: boolean;
  deposits: boolean;
  customCalculation: boolean;
}

const { formatAsArs } = useFormatters();
const search = ref<string>("");
const loadings = reactive<Loading>({
  products: false,
  passwordForm: false,
  excelForm: false,
});
const dialogs = reactive<Dialog>({
  calculation: false,
  excel: false,
  deposits: false,
  customCalculation: false,
});

const { height: windowHeight } = useWindowSize();
const dataTableHeight = computed(() => windowHeight.value - 196);

// ✅ Cargamos productos y manejamos selección manual
const { list: products, selected } = useProducts("get");
const selectedPs = ref<Product[]>([]);

// 🔄 Sincronizar con estado global (con protección)
watch(
  selectedPs,
  (newVal) => {
    if (selected?.value) {
      selected.value = [...newVal];
    } else {
      console.warn("⚠️ selected no está disponible aún.");
    }
  },
  { immediate: true }
);

const noneSelected = computed<boolean>(() => selectedPs.value.length === 0);
const headers = ref<Object[]>([
  { align: "start", key: "detail", title: "Detalle" },
  { align: "start", key: "composition", title: "Composición" },
  { align: "start", key: "price", title: "Precio de lista" },
]);

const total = ref<number>(0);
const newCustomCalculation = () => {
  total.value = selectedPs.value.reduce(
    (sum, prod) => sum + (prod.price || 0),
    0
  );
  dialogs.customCalculation = true;
};

const productsDetails = computed<string[]>(() =>
  selectedPs.value.map((p: Product) => p.detail)
);

const isSelected = (i: Product) =>
  selectedPs.value.some((item: Product) => item.$id === i.$id);

const toggleSelect = (i: Product) => {
  const index = selectedPs.value.findIndex((sp) => sp.$id === i.$id);
  if (index !== -1) {
    selectedPs.value.splice(index, 1);
  } else {
    selectedPs.value.push(i);
  }
};

useDeposit();
useQuote();
</script>
