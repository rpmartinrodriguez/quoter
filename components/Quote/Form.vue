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

      <!-- Create deposit -->
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

      <!-- Delete deposit -->
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

      <!-- Clear deposit field -->
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
const quantity = ref<string | null>();
const percentage = ref<string | null>();
const invalidQuote = computed<boolean>(
  () =>
    !quantity.value ||
    isNaN(parseInt(quantity.value)) ||
    !isFinite(parseInt(quantity.value)) ||
    !percentage.value ||
    isNaN(parseInt(percentage.value)) ||
    !isFinite(parseInt(percentage.value))
);
const saveTooltip = computed<string>(() => (state ? "Actualizar" : "Guardar"));

const handleSaveClick = async () => {
  if (!quantity.value) return;

  if (state) {
    await updateQuote(state.$id!, quantity.value!, percentage.value!);
  } else {
    await createQuote(quantity.value, percentage.value!);
    quantity.value = null;
    percentage.value = null;
  }
};

const clearForm = () => {
  quantity.value = null;
  percentage.value = null;
};

onMounted(() => {
  if (state) {
    quantity.value = state.quantity.toString();
    percentage.value = state.percentage.toString();
  }
});
</script>
