<template>
  <form>
    <div class="d-flex align-center ga-5">
      <!-- Deposit text field -->
      <v-text-field
        :label="label"
        v-model="deposit"
        variant="outlined"
        density="compact"
        hide-details
      >
      </v-text-field>

      <!-- Create/Update deposit -->
      <v-btn
        class="px-2"
        variant="tonal"
        color="success"
        :disabled="invalidDeposit"
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
        @click="deleteDeposit(state.$id!)"
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
        @click="clearDeposit"
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
  label?: string;
  state?: Deposit;
  showClear: boolean;
}

const { label, state, showClear } = defineProps<IDepositForm>();

const { createDeposit, updateDeposit, deleteDeposit } = useDeposit();

// ✅ Inicialización segura
const deposit = ref<number>(0);

// ✅ Validación robusta
const invalidDeposit = computed<boolean>(() => {
  const d = deposit.value;
  return isNaN(d) || !isFinite(d) || d <= 0;
});

const saveTooltip = computed<string>(() => (state ? "Actualizar" : "Guardar"));

// ✅ Guardado seguro
const handleSaveClick = async () => {
  const value = deposit.value;
  if (invalidDeposit.value) return;

  if (state) {
    await updateDeposit(state.$id!, value);
  } else {
    await createDeposit(value);
    deposit.value = 0;
  }
};

// ✅ Limpiar valor
const clearDeposit = () => {
  deposit.value = 0;
};

// ✅ Precarga al montar
onMounted(() => {
  if (state && typeof state.percentage === "number") {
    deposit.value = state.percentage;
  }
});
</script>
