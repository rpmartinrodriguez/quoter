<template>
  <v-card variant="outlined">
    <v-card-title>Actualizar Lista de Precios</v-card-title>
    <v-card-subtitle>Subí un archivo Excel (.xlsx) para reemplazar el catálogo de productos completo.</v-card-subtitle>
    
    <v-card-text v-if="!isVerified">
      <v-sheet class="pa-4 text-center" rounded="lg">
        <v-icon size="48" color="primary" class="mb-4">mdi-shield-lock</v-icon>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Esta acción es sensible. Por favor, ingresá la contraseña de administrador para continuar.
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
          :loading="isLoadingPassword"
          color="primary"
          block
          class="mt-4"
        >
          Verificar
        </v-btn>
      </v-sheet>
    </v-card-text>

    <v-card-text v-else>
      <v-file-input
        v-model="selectedFile"
        label="Seleccionar archivo Excel"
        accept=".xlsx"
        variant="outlined"
        show-size
      ></v-file-input>
      <v-btn
        @click="handleUpload"
        :loading="isLoadingUpload"
        :disabled="selectedFile.length === 0"
        color="success"
        block
        class="mt-4"
      >
        Cargar Nueva Lista
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useProducts } from '~/composables/useProducts';
import { useSnackbar } from '~/composables/useSnackbar';

const { updateProducts, isLoading: isLoadingUpload } = useProducts();
const { showSnackbar } = useSnackbar();

const isVerified = ref(false);
const passwordInput = ref('');
const isLoadingPassword = ref(false);
const errorMsg = ref('');
const selectedFile = ref<File[]>([]);

const checkPassword = async () => {
  if (!passwordInput.value) {
    errorMsg.value = 'Por favor, ingresá una contraseña.';
    return;
  }
  isLoadingPassword.value = true;
  errorMsg.value = '';
  try {
    const { verified } = await $fetch('/api/auth/verify-password', {
      method: 'POST',
      body: {
        password: passwordInput.value,
        type: 'uploads'
      }
    });

    if (verified) {
      isVerified.value = true;
      showSnackbar({ text: 'Verificación exitosa.' });
    } else {
      errorMsg.value = 'Contraseña incorrecta.';
    }
  } catch (err) {
    errorMsg.value = 'Ocurrió un error al verificar.';
  } finally {
    isLoadingPassword.value = false;
  }
};

const handleUpload = async () => {
  if (selectedFile.value.length === 0) return;
  try {
    await updateProducts(selectedFile.value[0]);
    showSnackbar({ text: '¡Lista de productos actualizada con éxito!', color: 'success' });
    selectedFile.value = []; // Limpiamos el input
  } catch (error) {
    showSnackbar({ text: 'Error al cargar el archivo Excel.', color: 'error' });
  }
};
</script>
