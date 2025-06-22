<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Iniciar Sesión</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pt-4">
            <v-form @submit.prevent="handleLogin">
              <v-text-field v-model="email" label="Email" prepend-inner-icon="mdi-account" type="text" variant="outlined" density="compact" class="mb-2"></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                density="compact"
              ></v-text-field>
              <v-alert v-if="errorMsg" type="error" density="compact" class="mt-4">{{ errorMsg }}</v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="handleLogin" :loading="isLoading" size="large" block>Entrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'empty' });
const { login } = useAuth();
const router = useRouter();
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = 'Por favor, completá ambos campos.';
    return;
  }
  isLoading.value = true;
  errorMsg.value = '';
  try {
    await login(email.value, password.value);
    router.push('/');
  } catch (error) {
    errorMsg.value = 'Email o contraseña incorrectos.';
  } finally {
    isLoading.value = false;
  }
};
</script>
