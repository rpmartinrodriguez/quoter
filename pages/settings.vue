<template>
  <v-card flat>
    <v-card-title class="d-flex align-center">
        <v-icon start>mdi-cog</v-icon>
        Configuración General
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4" class="pa-4">
          <ExcelForm />
        </v-col>

        <v-col cols="12" md="4" class="pa-4">
          <v-sheet variant="outlined" rounded="lg" class="pa-4 fill-height">
            <h3 class="text-center mb-4">Opciones de Depósito</h3>
            <div class="d-flex flex-column ga-4">
              <div v-for="deposit in deposits" :key="deposit.$id" class="d-flex align-center ga-2">
                <v-text-field :model-value="deposit.percentage" label="Porcentaje" readonly suffix="%"></v-text-field>
                <v-btn icon="mdi-delete" size="small" variant="tonal" color="error" @click="deleteDeposit(deposit.$id)"></v-btn>
              </div>
              <v-divider></v-divider>
              <div class="d-flex align-center ga-2">
                <v-text-field v-model.number="newDepositPercentage" label="Nuevo Porcentaje" type="number" suffix="%"></v-text-field>
                <v-btn icon="mdi-plus" size="small" color="primary" @click="addDeposit" :disabled="!newDepositPercentage"></v-btn>
              </div>
            </div>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="4" class="pa-4">
          <v-sheet variant="outlined" rounded="lg" class="pa-4 fill-height">
            <h3 class="text-center mb-4">Opciones de Cuotas</h3>
            <div class="d-flex flex-column ga-4">
              <div v-for="quote in quotes" :key="quote.$id" class="d-flex align-center ga-2">
                <v-text-field :model-value="quote.quantity" label="Cuotas" readonly></v-text-field>
                <v-text-field :model-value="quote.percentage" label="Porcentaje" readonly suffix="%"></v-text-field>
                <v-btn icon="mdi-delete" size="small" variant="tonal" color="error" @click="deleteQuote(quote.$id)"></v-btn>
              </div>
              <v-divider></v-divider>
              <div class="d-flex align-center ga-2">
                <v-text-field v-model.number="newQuote.quantity" label="Nuevas Cuotas" type="number"></v-text-field>
                <v-text-field v-model.number="newQuote.percentage" label="Nuevo %" type="number" suffix="%"></v-text-field>
                <v-btn icon="mdi-plus" size="small" color="primary" @click="addQuote" :disabled="!newQuote.quantity || !newQuote.percentage"></v-btn>
              </div>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useDeposit } from '~/composables/useDeposit';
import { useQuote } from '~/composables/useQuote';
import ExcelForm from '~/components/ExcelForm.vue'; // Se importa el componente dedicado

// --- COMPOSABLES ---
const { deposits, getDeposits, createDeposit, deleteDeposit } = useDeposit();
const { quotes, getQuotes, createQuote, deleteQuote } = useQuote();
const { setTitle } = usePageTitle();

// --- LÓGICA PARA DEPÓSITOS ---
const newDepositPercentage = ref<number | null>(null);
const addDeposit = async () => {
  if (!newDepositPercentage.value) return;
  await createDeposit(newDepositPercentage.value);
  newDepositPercentage.value = null;
};

// --- LÓGICA PARA CUOTAS ---
const newQuote = reactive({ quantity: null as number | null, percentage: null as number | null });
const addQuote = async () => {
  if (!newQuote.quantity || !newQuote.percentage) return;
  await createQuote(newQuote.quantity, newQuote.percentage);
  newQuote.quantity = null;
  newQuote.percentage = null;
};

onMounted(() => {
  setTitle('Configuración');
  getDeposits();
  getQuotes();
});
</script>
