<template>
  <div class="form-wrapper">
    <h1>Registro</h1>
    <br />
    <v-form
      validate-on="input lazy"
      v-model="valid"
      :disabled="signUpLoading"
      @submit.prevent="handleSubmit"
    >
      <!-- Sponsor -->
      <v-text-field
        label="Código de sponsor"
        variant="outlined"
        density="compact"
        :rules="sponsorRules"
        v-model="form.sponsor"
      ></v-text-field>
      <br />

      <!-- Name -->
      <v-text-field
        label="Nombre completo"
        variant="outlined"
        density="compact"
        :rules="nameRules"
        v-model="form.name"
      ></v-text-field>
      <br />

      <!-- Role -->
      <v-select
        label="Nivel"
        variant="outlined"
        density="compact"
        :items="roles"
        item-title="name"
        item-value="label"
        :rules="roleRules"
        v-model="form.role"
      ></v-select>
      <br />

      <!-- Email -->
      <v-text-field
        label="Correo"
        variant="outlined"
        density="compact"
        :rules="emailRules"
        autocomplete="current-email"
        v-model="form.email"
      ></v-text-field>
      <br />

      <!-- Password -->
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

      <!-- Submit -->
      <v-btn
        type="submit"
        color="success"
        class="mt-5 text-uppercase"
        block
        :disabled="signUpLoading"
      >
        entrar
      </v-btn>

      <!-- Login link -->
      <div class="mt-3 d-flex align-center justify-space-between">
        <v-btn
          variant="plain"
          density="compact"
          color="info"
          class="px-0"
          to="/auth/sign-in"
          :disabled="signUpLoading"
        >
          <b>Iniciar sesión</b>
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

const { psswdInnerIcon, psswdInputType, passwordRules, togglePsswdShow } =
  usePasswordField();
const { emailRules } = useEmailField();
const { loading: signUpLoading, toggleLoading: toggleSignUpLoading } =
  useLoadings();

const sponsorRules = [
  (value: string) => {
    if (!value) return "El código del sponsor es requerido";

    if (!Number.isInteger(Number(value))) return "Código inválido";

    return true;
  },
];

const nameRules = [
  (value: string) => {
    if (!value) return "El nombre es requerido";

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+$/;
    if (!nameRegex.test(value)) return "Nombre inválido";

    return true;
  },
];

const roleRules = [
  (value: string) => {
    if (!value) return "El código del sponsor es requerido";

    return true;
  },
];

const form = reactive<ISignUpForm>({
  sponsor: "",
  name: "",
  role: null,
  email: "",
  password: "",
});

const valid = ref<boolean>(false);

interface IRole {
  name: string;
  label: string;
}
const roles: IRole[] = [
  { name: "Emprendedor", label: "emprendedor" },
  { name: "Distribuidor Junior", label: "dits-jr" },
  { name: "Distribuidor 3", label: "dist-3" },
  { name: "Distribuidor 2", label: "dist-2" },
  { name: "Distribuidor 1", label: "dist-1" },
  { name: "Blue Network", label: "blue-net" },
  { name: "Royal Network", label: "royal-net" },
  { name: "Premier Network", label: "premier-net" },
  { name: "Master Network", label: "master-net" },
  { name: "Elite Network", label: "elite-net" },
];

const { signUp } = useSession();
const { clear } = useSnackbar();
const handleSubmit = async () => {
  clear();
  if (!valid.value) return;
  toggleSignUpLoading();

  await signUp(form);
  toggleSignUpLoading();
};
</script>
