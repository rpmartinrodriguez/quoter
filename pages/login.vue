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
              <v-text-field
                v-model="email"
                label="Email"
                name="login"
                prepend-inner-icon="mdi-account"
                type="text"
                variant="outlined"
                density="compact"
                class="mb-2"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Contraseña"
                name="password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                density="compact"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>
              <v-alert v-if="errorMsg" type="error" density="compact" class="mt-4">
                {{ errorMsg }}
              </v-alert>
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
// Le decimos a Nuxt que esta página use el layout "empty".
definePageMeta({
  layout: 'empty',
});

const { login } = useAuth();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

// ✅ Se añade una variable para controlar la visibilidad de la contraseña
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
  } catch (error: any) {
    errorMsg.value = 'Email o contraseña incorrectos.';
  } finally {
    isLoading.value = false;
  }
};
</script>
