<template>
  <form>
    <div class="d-flex align-center ga-5">
      <!-- Quantity text field -->
      <v-text-field
        :label="qLabel"
        v-model="quantity"
        variant="outlined"
        density="compact"
        hide-details
      >
      </v-text-field>

      <!-- Percentage text field -->
      <v-text-field
        :label="pLabel"
        v-model="percentage"
        variant="outlined"
        density="compact"
        hide-details
      >
      </v-text-field>

      <!-- Create/Update Quote -->
      <v-btn
        class="px-2"
        variant="tonal"
        color="success"
        :disabled="invalidQuote"
        @click="handleSaveClick"
      >
        <v-tooltip activator="parent" location="bottom">
          {{ saveTooltip }}
        </v-tooltip>
        <v-icon>mdi-check</v-icon>
      </v-btn>

      <!-- Delete Quote -->
      <v-btn
        v-if="state"
        class="px-2"
        variant="tonal"
        color="error"
        @click="deleteQuote(state.$id!)"
      >
        <v-tooltip activator="parent" location="bottom"> Eliminar </v-tooltip>
        <v-icon>mdi-delete</v-icon>
      </v-btn>

      <!-- Clear Form -->
      <v-btn
        v-if="showClear"
        class="px-2"
        variant="tonal"
        color="info"
        @click="clearForm"
      >
        <v-tooltip activator="parent" location="bottom">
          Limpiar campo
        </v-tooltip>
        <v-icon>mdi-broom</v-icon>
      </v-btn>
    </div>
  </form>
</template>

<script lang="ts" setup>
interface IDepositForm {
  qLabel?: string;
  pLabel?: string;
  state?: Quote;
  showClear: boolean;
}

const { qLabel, pLabel, state, showClear } = defineProps<IDepositForm>();

const { createQuote, updateQuote, deleteQuote } = useQuote();

// ✅ Refs inicializados como string vacía para evitar problemas de `null`
const quantity = ref<string>("");
const percentage = ref<string>("");

// ✅ Validación sólida con parseFloat y control de NaN
const invalidQuote = computed<boolean>(() => {
  const q = parseFloat(quantity.value);
  const p = parseFloat(percentage.value);
  return (
    isNaN(q) ||
    !isFinite(q) ||
    q <= 0 ||
    isNaN(p) ||
    !isFinite(p) ||
    p <= 0
  );
});

const saveTooltip = computed<string>(() => (state ? "Actualizar" : "Guardar"));

const handleSaveClick = async () => {
  const q = quantity.value?.trim();
  const p = percentage.value?.trim();

  if (!q || !p || invalidQuote.value) return;

  if (state) {
    await updateQuote(state.$id!, q, p);
  } else {
    await createQuote(q, p);
    quantity.value = "";
    percentage.value = "";
  }
};

const clearForm = () => {
  quantity.value = "";
  percentage.value = "";
};

// ✅ Precarga de valores cuando se pasa un `state` externo
onMounted(() => {
  if (state) {
    quantity.value = String(state.quantity || "");
    percentage.value = String(state.percentage || "");
  }
});
</script>
