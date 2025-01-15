<template>
  <v-container fluid>
    <v-row>
      <!-- Products List column -->
      <v-col cols="12" md="4">
        <v-card flat>
          <!-- List actions -->
          <template v-slot:title>
            <ClientOnly>
              <div class="d-flex align-center w-100">
                <div class="w-100 px-1">Artículos</div>

                <div class="d-flex align-center">
                  <template v-if="quoterPrivs.uploadExcel">
                    <v-btn
                      class="px-2"
                      variant="text"
                      density="compact"
                      icon
                      @click="dialogs.excel = true"
                    >
                      <v-tooltip activator="parent" location="bottom">
                        Cargar Excel
                      </v-tooltip>
                      <v-icon>mdi-file-excel</v-icon>
                    </v-btn>
                  </template>
                  <v-btn
                    class="px-2 d-flex d-md-none"
                    variant="text"
                    density="compact"
                    icon
                    @click="dialogs.calculation = true"
                  >
                    <v-tooltip activator="parent" location="bottom">
                      Calcular
                    </v-tooltip>
                    <v-icon>mdi-calculator-variant</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="!noneSelected"
                    class="px-2"
                    variant="text"
                    density="compact"
                    icon
                    @click="selectedPs = []"
                  >
                    <v-tooltip activator="parent" location="bottom">
                      Reiniciar selección
                    </v-tooltip>
                    <v-icon>mdi-checkbox-multiple-blank-outline</v-icon>
                  </v-btn>
                  <v-btn
                    class="px-2"
                    variant="text"
                    density="compact"
                    icon
                    to="/quoter/settings"
                  >
                    <v-tooltip activator="parent" location="bottom">
                      Configurar calculadora
                    </v-tooltip>
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </div>
              </div>
            </ClientOnly>
          </template>
          <template v-slot:text>
            <v-text-field
              v-model="search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              single-line
            ></v-text-field>
          </template>

          <!-- Products -->
          <v-card-text>
            <v-data-table-virtual
              :height="dataTableHeight"
              :headers="headers"
              :items="list"
              :search="search"
              :loading="loadings.products"
              v-model="selectedPs"
              show-select
              return-object
            >
              <template v-slot:item="{ item }">
                <tr
                  :style="{
                    'background-color': selectedPs.includes(item)
                      ? `${item.color}`
                      : '',
                  }"
                >
                  <td class="check-cell">
                    <v-checkbox-btn
                      :model-value="isSelected(item)"
                      color="primary"
                      @update:model-value="toggleSelect(item)"
                    ></v-checkbox-btn>
                  </td>
                  <td>{{ item.detail }}</td>
                  <td>{{ item.composition }}</td>
                  <td>{{ formatAsArs(item.price as number) }}</td>
                </tr>
              </template>
            </v-data-table-virtual>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Calculations column -->
      <v-col cols="8" class="d-none d-md-flex">
        <v-card flat class="w-100">
          <v-card-title class="d-flex items-center justify-space-between">
            <span> Cálculos </span>
            <v-btn
              v-if="!noneSelected"
              class="px-2"
              variant="text"
              density="compact"
              icon
              @click="newCustomCalculation"
            >
              <v-tooltip activator="parent" location="bottom">
                Cáculo personalizado
              </v-tooltip>
              <v-icon>mdi-cash-edit</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="noneSelected">
              <p class="text-center">
                Escoja uno o varios productos para cotizar
              </p>
            </div>
            <div v-else>
              <CalculationTable />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mobile calculation dialog -->
    <v-dialog
      v-model="dialogs.calculation"
      transition="dialog-bottom-transition"
      fullscreen
    >
      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="dialogs.calculation = false"></v-btn>
          <v-toolbar-title style="flex: none">Cálculos</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="newCustomCalculation">
            <v-tooltip activator="parent" location="bottom">
              Cáculo personalizado
            </v-tooltip>
            <v-icon>mdi-cash-edit</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <CalculationTable />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Excel upload dialog  -->
    <ExcelForm :show="dialogs.excel" @finish="dialogs.excel = false" />
  </v-container>

  <!-- Custom Calculation -->
  <v-dialog
    v-model="dialogs.customCalculation"
    persistent
    transition="dialog-bottom-transition"
    max-width="900"
  >
    <v-card>
      <v-toolbar>
        <v-btn
          icon="mdi-close"
          @click="dialogs.customCalculation = false"
        ></v-btn>
        <v-toolbar-title>Depósito personalizado</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <CustomCalculation :total="total" :products="productsDetails" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: ["app"],
});

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

const { quoterPrivs } = usePermissions();
const { formatAsArs } = useFormatters();
const search = ref<string>("");
const loadings = reactive<Loading>({
  products: false,
  passwordForm: false,
  excelForm: false,
});
const noneSelected = computed<boolean>(() => selectedPs.value.length === 0);

const headers = ref<Object[]>([
  {
    align: "start",
    key: "detail",
    title: "Detalle",
  },
  {
    align: "start",
    key: "composition",
    title: "Composición",
  },
  {
    align: "start",
    key: "price",
    title: "Precio de lista",
  },
]);

const dialogs = reactive<Dialog>({
  calculation: false,
  excel: false,
  deposits: false,
  customCalculation: false,
});

const total = ref<number>(0);
const newCustomCalculation = () => {
  total.value = 0;
  for (const prod of selectedPs.value) {
    total.value += prod.price as number;
  }
  dialogs.customCalculation = true;
};

const productsDetails = computed<string[]>(() =>
  selectedPs.value.map((p: IProduct) => p.detail)
);

const { height: windowHeight } = useWindowSize();
const dataTableHeight = computed(() => windowHeight.value - 268);

const { list, selected: selectedPs } = useProducts("get");
const isSelected = (i: IProduct) =>
  selectedPs.value.some((item: IProduct) => item === i);

const toggleSelect = (i: IProduct) => {
  // Check if item is in array
  if (isSelected(i)) {
    const index = selectedPs.value.findIndex(
      (sp: IProduct) => sp.$id === i.$id
    );
    if (index !== -1) {
      selectedPs.value.splice(index, 1);
    }
  } else selectedPs.value.push(i);
};

useDeposit();
useQuote();
</script>
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
