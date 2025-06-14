<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { useWindowSize } from "@vueuse/core";

// --- INTERFACES ---
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
interface Product {
  $id: string;
  detail: string;
  composition: string;
  price: number;
  color?: string;
}

// --- COMPOSABLES Y ESTADO ---
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

const { list: products, selected } = useProducts(); 
const selectedPs = ref<Product[]>([]);

watch(selectedPs, (newVal) => {
  selected.value = [...newVal];
});

// --- PROPIEDADES COMPUTADAS ---
const noneSelected = computed(() => selectedPs.value.length === 0);

const total = computed(() =>
  selectedPs.value.reduce((sum, prod) => sum + (prod?.price || 0), 0)
);

// Encabezados de la tabla
const headers = ref([
  { align: "start", key: "detail", title: "Detalle" },
  { align: "start", key: "composition", title: "Composición" },
  { align: "start", key: "price", title: "Precio de lista" },
]);

// --- MÉTODOS ---
const newCustomCalculation = () => {
  dialogs.customCalculation = true;
};

const isSelected = (i: Product) =>
  !!i?.$id && selectedPs.value.some((item) => item?.$id === i.$id);

const toggleSelect = (i: Product) => {
  if (!i?.$id) return;
  const index = selectedPs.value.findIndex((sp) => sp?.$id === i.$id);
  if (index !== -1) {
    selectedPs.value.splice(index, 1);
  } else {
    selectedPs.value.push(i);
  }
};

const handleDeselect = (productToDeselect: Product) => {
  selectedPs.value = selectedPs.value.filter(
    (p) => p.$id !== productToDeselect.$id
  );
};


// --- VALIDACIONES DE ESTADO ---
const { deposits } = useDeposit();
const { quotes } = useQuote();
const config = useRuntimeConfig();

const configOk = computed(() =>
  !!config.public.endpoint &&
  !!config.public.project &&
  !!config.public.database &&
  !!config.public.cProducts &&
  !!config.public.cDeposits &&
  !!config.public.cQuotes
);
const quotesOk = computed(() => Array.isArray(quotes.value) && quotes.value.length > 0);
const depositsOk = computed(() => Array.isArray(deposits.value) && deposits.value.length > 0);
</script>

<template>
  <v-container fluid>
    <v-alert v-if="!configOk" type="error" variant="outlined" class="mb-2 text-center">
      ⚠️ Error de configuración: Verificá el archivo .env y la conexión.
    </v-alert>

    <v-alert v-if="!quotesOk" type="error" variant="outlined" class="mb-2 text-center">
      ⚠️ No se cargaron las cuotas. Revisar Appwrite o IDs en .env
    </v-alert>

    <v-alert v-if="!depositsOk" type="error" variant="outlined" class="mb-4 text-center">
      ⚠️ No se cargaron los depósitos. Revisar Appwrite o IDs en .env
    </v-alert>

    <v-row>
      <v-col cols="12" md="4">
        <v-card flat>
          <template v-slot:title>
            <ClientOnly>
              <div class="d-flex align-center w-100">
                <div class="w-100 px-1">Artículos</div>
                <div class="d-flex align-center">
                  <v-btn v-if="noneSelected" class="px-2" variant="text" density="compact" icon @click="dialogs.excel = true">
                    <v-tooltip activator="parent" location="bottom">Cargar Excel</v-tooltip>
                    <v-icon>mdi-file-excel</v-icon>
                  </v-btn>
                  <template v-else>
                    <v-btn class="px-2 d-flex d-md-none" variant="text" density="compact" icon @click="dialogs.calculation = true">
                      <v-tooltip activator="parent" location="bottom">Calcular</v-tooltip>
                      <v-icon>mdi-calculator-variant</v-icon>
                    </v-btn>
                    <v-btn class="px-2" variant="text" density="compact" icon @click="selectedPs = []">
                      <v-tooltip activator="parent" location="bottom">Reiniciar selección</v-tooltip>
                      <v-icon>mdi-checkbox-multiple-blank-outline</v-icon>
                    </v-btn>
                  </template>
                  <v-btn class="px-2" variant="text" density="compact" icon to="/settings">
                    <v-tooltip activator="parent" location="bottom">Configurar calculadora</v-tooltip>
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </div>
              </div>
            </ClientOnly>
          </template>

          <template v-slot:text>
            <v-text-field
              v-model="search"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              single-line
            ></v-text-field>
          </template>

          <v-card-text>
            <v-data-table-virtual
              :height="dataTableHeight"
              :headers="headers"
              :items="products"
              :search="search"
              :loading="loadings.products"
            >
              <template v-slot:item="{ item }">
                <tr :style="{ 'background-color': isSelected(item) ? item?.color : '' }">
                  <td class="check-cell">
                    <v-checkbox-btn
                      :model-value="isSelected(item)"
                      color="primary"
                      @update:model-value="toggleSelect(item)"
                    />
                  </td>
                  <td>{{ item?.detail }}</td>
                  <td>{{ item?.composition }}</td>
                  <td>{{ formatAsArs(item?.price) }}</td>
                </tr>
              </template>
            </v-data-table-virtual>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="8" class="d-none d-md-flex">
        <v-card flat>
          <v-card-title>
            <span>Cálculos</span>
          </v-card-title>
          <v-card-text class="pt-4">
            <div v-if="noneSelected" class="text-center">
              <p>Seleccioná uno o varios productos para cotizar</p>
            </div>
            <div v-else>
              <CustomCalculation
                :total="total"
                :products="selectedPs"
                @deselect-product="handleDeselect"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogs.calculation" transition="dialog-bottom-transition" fullscreen>
      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="dialogs.calculation = false"></v-btn>
          <v-toolbar-title style="flex: none">Cálculos</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="newCustomCalculation">
            <v-tooltip activator="parent" location="bottom">Cálculo personalizado</v-tooltip>
            <v-icon>mdi-cash-edit</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <CustomCalculation
            :total="total"
            :products="selectedPs"
            @deselect-product="handleDeselect"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <ExcelForm :show="dialogs.excel" @finish="dialogs.excel = false" />

    <v-dialog v-model="dialogs.customCalculation" persistent transition="dialog-bottom-transition" max-width="900">
      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="dialogs.customCalculation = false"></v-btn>
          <v-toolbar-title>Cálculo Personalizado (Sobrescribir)</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <CustomCalculation
            :total="total"
            :products="selectedPs"
            @deselect-product="handleDeselect"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style>
.v-table__wrapper > table > thead > tr > th {
  font-weight: bolder !important;
}
.border-top-bold {
  border-top: 5px solid #000 !important;
}
.check-cell .v-selection-control__input {
  justify-content: start !important;
}
</style>
