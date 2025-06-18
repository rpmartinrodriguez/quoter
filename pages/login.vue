<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Iniciar Sesión</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                name="login"
                prepend-icon="mdi-account"
                type="text"
                variant="underlined"
                class="mt-4"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                variant="underlined"
              ></v-text-field>
              <v-alert v-if="errorMsg" type="error" density="compact" class="mt-4">
                {{ errorMsg }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="handleLogin" :loading="isLoading" size="large">Entrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'empty',
});

const { login } = useAuth();
const router = useRouter();
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

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
