<template>
  <form>
    <div class="d-flex align-center ga-5">
      <v-text-field
        :label="qLabel"
        v-model.number="quantity"
        type="number"
        variant="outlined"
        density="compact"
        hide-details
      ></v-text-field>

      <v-text-field
        :label="pLabel"
        v-model.number="percentage"
        type="number"
        variant="outlined"
        density="compact"
        hide-details
      ></v-text-field>

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

      <v-btn
        v-if="showClear"
        class="px-2"
        variant="tonal"
        color="info"
        @click="clearForm"
      >
        <v-tooltip activator="parent" location="bottom">
          Limpiar campos
        </v-tooltip>
        <v-icon>mdi-broom</v-icon>
      </v-btn>
    </div>
  </form>
</template>

<script lang="ts" setup>
// Asumiendo que esta interfaz podría moverse a un archivo global de tipos
interface Quote {
  $id: string;
  quantity: number;
  percentage: number;
}

interface IQuoteForm {
  qLabel?: string;
  pLabel?: string;
  state?: Quote;
  showClear?: boolean;
}

const { qLabel = "Cantidad", pLabel = "Porcentaje", state, showClear = true } = defineProps<IQuoteForm>();
const { createQuote, updateQuote, deleteQuote } = useQuote();

// --- LÓGICA CORREGIDA ---

// Estado interno: usamos `number | null` para manejar campos vacíos.
const quantity = ref<number | null>(null);
const percentage = ref<number | null>(null);

// Validación simplificada y robusta para números.
const invalidQuote = computed(() => {
  const q = quantity.value;
  const p = percentage.value;
  // Un campo es inválido si está vacío (null) o si no es un número positivo.
  return q === null || q <= 0 || p === null || p <= 0;
});

const saveTooltip = computed(() => (state ? "Actualizar" : "Guardar"));

// Manejo del guardado: ahora envía tipos numéricos.
const handleSaveClick = async () => {
  if (invalidQuote.value) return;

  // El "!" asegura a TypeScript que los valores no son null aquí, gracias a la validación.
  const q = quantity.value!;
  const p = percentage.value!;

  if (state) {
    await updateQuote(state.$id!, q, p);
  } else {
    await createQuote(q, p);
    clearForm();
  }
};

// Limpiar formulario: asigna null a los campos.
const clearForm = () => {
  quantity.value = null;
  percentage.value = null;
};

// Precarga de datos: asigna directamente los números del estado.
onMounted(() => {
  if (state) {
    quantity.value = state.quantity;
    percentage.value = state.percentage;
  }
});
</script>
