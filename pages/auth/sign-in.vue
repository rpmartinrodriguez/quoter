<template>
  <div class="form-wrapper">
    <h1>Iniciar sesión</h1>
    <br />
    <v-form
      validate-on="input lazy"
      v-model="valid"
      :disabled="signInLoading"
      @submit.prevent="handleSubmit"
    >
      <v-text-field
        label="Correo"
        variant="outlined"
        density="compact"
        :rules="emailRules"
        autocomplete="current-email"
        v-model="form.email"
      ></v-text-field>
      <br />

      <v-text-field
        label="Contraseña"
        variant="outlined"
        density="compact"
        :append-inner-icon="psswdInnerIcon"
        :type="psswdInputType"
        :rules="passwordRules"
        autocomplete="current-password"
        v-model="form.password"
        @click:append-inner="togglePsswdShow"
      ></v-text-field>

      <v-btn
        type="submit"
        color="success"
        class="mt-5 text-uppercase"
        block
        :disabled="signInLoading"
      >
        entrar
      </v-btn>
      <div class="mt-3 d-flex align-center justify-space-between">
        <v-btn
          variant="plain"
          density="compact"
          color="info"
          class="px-0"
          to="/auth/sign-up"
          :disabled="signInLoading"
        >
          <b>Registrarme</b>
        </v-btn>
        <v-btn
          variant="plain"
          density="compact"
          color="warning"
          class="px-0"
          to="/auth/forgot-password"
          :disabled="signInLoading"
        >
          <b>Olvidé mi contraseña</b>
        </v-btn>
      </div>
    </v-form>
    <br />
    <div class="mt-5 d-flex align-center justify-space-around">
      <small class="text-uppercase">
        Este formulario está protegido por Google Recaptcha V3
      </small>
      <img src="@/assets/img/google-recaptcha-icon.png" class="gri" />
    </div>
  </div>
</template>
<script lang="ts" setup>
definePageMeta({
  layout: "auth",
  middleware: ["auth"],
});

interface ISignInForm {
  email: string;
  password: string;
}
const { psswdInnerIcon, psswdInputType, passwordRules, togglePsswdShow } =
  usePasswordField();
const { emailRules } = useEmailField();
const { loading: signInLoading, toggleLoading: toggleSignInLoading } =
  useLoadings();
const form = reactive<ISignInForm>({
  email: "",
  password: "",
});
const valid = ref<boolean>(false);

const { login } = useSession();
const { clear } = useSnackbar();
const handleSubmit = async () => {
  if (!valid.value) return;
  clear();
  toggleSignInLoading();
  await login(form);
  toggleSignInLoading();
};
</script>
