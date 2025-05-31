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
      ></v-text-field>

      <!-- Percentage text field -->
      <v-text-field
        :label="pLabel"
        v-model="percentage"
        variant="outlined"
        density="compact"
        hide-details
      ></v-text-field>

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
// ✅ Definimos `Quote` si no viene de una interfaz global
interface Quote {
  $id: string;
  quantity: number;
  percentage: number;
}

interface IQuoteForm {
  qLabel?: string;
  pLabel?: string;
  state?: Quote;
  showClear: boolean;
}

const { qLabel, pLabel, state, showClear } = defineProps<IQuoteForm>();
const { createQuote, updateQuote, deleteQuote } = useQuote();

// ✅ Inicialización segura
const quantity = ref<string>("");
const percentage = ref<string>("");

// ✅ Validación robusta
const invalidQuote = computed(() => {
  const q = parseFloat(quantity.value.trim());
  const p = parseFloat(percentage.value.trim());
  return (
    isNaN(q) || !isFinite(q) || q <= 0 ||
    isNaN(p) || !isFinite(p) || p <= 0
  );
});

const saveTooltip = computed(() => (state ? "Actualizar" : "Guardar"));

// ✅ Manejo seguro del click
const handleSaveClick = async () => {
  const q = quantity.value.trim();
  const p = percentage.value.trim();

  if (!q || !p || invalidQuote.value) return;

  if (state) {
    await updateQuote(state.$id!, q, p);
  } else {
    await createQuote(q, p);
    quantity.value = "";
    percentage.value = "";
  }
};

// ✅ Limpiar campos
const clearForm = () => {
  quantity.value = "";
  percentage.value = "";
};

// ✅ Precarga al montar
onMounted(() => {
  if (state) {
    quantity.value = String(state.quantity ?? "");
    percentage.value = String(state.percentage ?? "");
  }
});
</script>
