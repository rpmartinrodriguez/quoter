<template>
  <v-row>
    <v-col>
      <v-card flat>
        <v-card-title>
          <v-icon start>mdi-cog</v-icon>
          Configuración
        </v-card-title>

        <v-card-text v-if="!isVerified" class="d-flex justify-center align-center" style="min-height: 60vh;">
          <v-sheet width="450" class="mx-auto pa-8 text-center" rounded="lg" elevation="2">
            <v-icon size="64" color="primary" class="mb-4">mdi-shield-lock</v-icon>
            <h4 class="text-h6 mb-4">Acceso Restringido</h4>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Para modificar la configuración de la calculadora, por favor ingresá la contraseña de administrador.
            </p>
            <v-text-field
              v-model="passwordInput"
              label="Contraseña"
              type="password"
              variant="outlined"
              @keydown.enter="checkPassword"
            ></v-text-field>
            <v-alert v-if="errorMsg" type="error" density="compact" class="mt-2 text-left">{{ errorMsg }}</v-alert>
            <v-btn
              @click="checkPassword"
              :loading="isLoading"
              color="primary"
              block
              class="mt-4"
              size="large"
            >
              Verificar
            </v-btn>
          </v-sheet>
        </v-card-text>

        <v-card-text v-else>
          <v-row class="mt-1">
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
import { ref, onMounted } from 'vue';
import { usePageTitle } from '~/composables/usePageTitle';
import { useDeposit } from '~/composables/useDeposit';
import { useQuote } from '~/composables/useQuote';

const { deposits } = useDeposit();
const { quotes } = useQuote();
const { setTitle } = usePageTitle();

const isVerified = ref(false);
const passwordInput = ref('');
const isLoading = ref(false);
const errorMsg = ref('');

// ✅ --- INICIO: FUNCIÓN checkPassword MODIFICADA ---
const checkPassword = async () => {
  if (!passwordInput.value) {
    errorMsg.value = 'Por favor, ingresá una contraseña.';
    return;
  }
  isLoading.value = true;
  errorMsg.value = '';
  try {
    // Hacemos la llamada a nuestra API interna más explícita y robusta,
    // asegurando que el cuerpo de la petición sea un JSON válido.
    const { verified } = await $fetch('/api/auth/verify-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: passwordInput.value })
    });

    if (verified) {
      isVerified.value = true;
      sessionStorage.setItem('settings_verified', 'true');
    } else {
      errorMsg.value = 'Contraseña incorrecta.';
    }
  } catch (err) {
    errorMsg.value = 'Ocurrió un error al verificar. Intentá de nuevo.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
// ✅ --- FIN: FUNCIÓN checkPassword MODIFICADA ---

onMounted(() => {
  setTitle('Configuración');
  if (sessionStorage.getItem('settings_verified') === 'true') {
    isVerified.value = true;
  }
});
</script>
