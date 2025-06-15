<template>
  <v-row>
    <v-col>
      <v-card flat>
        <v-card-title>
          Configuración
        </v-card-title>
        <v-card-text>
          <v-row class="mt-5">
            <v-col cols="12" md="6" class="pa-5">
              <h3 class="text-center mb-5">Opciones de Depósito</h3>
              <div class="d-flex flex-column ga-5">
                <DepositForm
                  v-for="deposit in deposits"
                  :key="deposit.$id"
                  :state="deposit"
                  :show-clear="false"
                />
                <DepositForm label="Nuevo Depósito" :show-clear="true" />
              </div>
            </v-col>

            <v-col cols="12" md="6" class="pa-5">
              <h3 class="text-center mb-5">Opciones de Cuotas</h3>
              <div class="d-flex flex-column ga-5">
                <QuoteForm
                  v-for="quote in quotes"
                  :key="quote.$id"
                  :state="quote"
                  :show-clear="false"
                />
                <QuoteForm
                  q-label="Cantidad de cuotas"
                  p-label="Porcentaje de ganancia"
                  :show-clear="true"
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useDeposit } from '~/composables/useDeposit';
import { useQuote } from '~/composables/useQuote';

const { deposits } = useDeposit();
const { quotes } = useQuote();
const { setTitle } = usePageTitle();

onMounted(() => {
  setTitle('Configuración');
});
</script>
