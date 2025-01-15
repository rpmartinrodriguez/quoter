<template>
  <v-row>
    <v-col>
      <v-card flat>
        <v-card-title>
          <v-btn class="pr-2" variant="text" density="compact" icon to="/">
            <v-tooltip activator="parent" location="bottom">
              Volver a calculadora
            </v-tooltip>
            <v-icon>mdi-arrow-left-thin-circle-outline</v-icon>
          </v-btn>
          Configuración
        </v-card-title>
        <v-card-text>
          <v-row class="mt-5">
            <!-- Deposits settings -->
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

            <!-- Quotes settings -->
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
const { deposits } = useDeposit();
const { quotes } = useQuote();
</script>
