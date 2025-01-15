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

      <!-- Create deposit -->
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
        @click="deposit = null"
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
  state?: IDeposit;
  showClear: boolean;
}

const { label, state, showClear } = defineProps<IDepositForm>();

const { createDeposit, updateDeposit, deleteDeposit } = useDeposit();
const deposit = ref<number | null>();
const invalidDeposit = computed<boolean>(
  () => !deposit.value || isNaN(deposit.value) || !isFinite(deposit.value)
);
const saveTooltip = computed<string>(() => (state ? "Actualizar" : "Guardar"));

const handleSaveClick = async () => {
  if (!deposit.value) return;

  if (state) {
    await updateDeposit(state.$id!, deposit.value);
  } else {
    await createDeposit(deposit.value!);
    deposit.value = null;
  }
};

onMounted(() => {
  if (state) deposit.value = state.percentage;
});
</script>
